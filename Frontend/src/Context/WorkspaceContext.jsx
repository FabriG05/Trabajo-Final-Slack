import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
    getWorkspaceById,
    getChannels,
    createChannel,
    deleteChannel as deleteChannelRequest,
    deleteMessage as deleteMessageRequest,
    updateMessage as updateMessageRequest,
    deleteWorkspace as deleteWorkspaceRequest,
    updateWorkspace as updateWorkspaceRequest,
    deleteWorkspaceMember as deleteWorkspaceMemberRequest,
    updateMemberRole as updateMemberRoleRequest,
    getChannelMessages,
    sendChannelMessage,
    getDirectMessages,
    sendDirectMessage,
    getUnreadCounts,
    markConversationRead as markConversationReadRequest,
    getStarredMessages,
    starMessage as starMessageRequest,
    unstarMessage as unstarMessageRequest
} from '../Services/WorkSpaceService'
import { updateUserStatus, updateProfilePhoto, getCurrentUser } from '../Services/ProfileService'
import { connectSocket, disconnectSocket, getSocket } from '../Services/SocketService'
import useWorkspaceMembers from '../Hooks/useWorkspaceMembers'

/*
    WorkspaceContext: central state for the Slack workspace interface.
    Owns workspace details, navigation selection, channel list, active channel,
    direct messages, messages feed, and current user profile.

    Channels and messages live in MongoDB: this context loads them from the
    API on mount and writes every new channel/message back to the server, so
    they survive a page reload and are shared with the rest of the members.

    Socket.IO adds the realtime layer: new messages, channels and typing
    notifications arrive without reloading. The REST API is still the source
    of truth; sockets only notify.
*/
const WorkspaceContext = createContext(null)

const INITIAL_APPS = [
    { id: 'slack', name: 'Slack' },
    { id: 'gcal', name: 'Google Calendar', external: true },
    { id: 'gdrive', name: 'Google Drive', external: true }
]

const TYPING_TIMEOUT_MS = 4000
const TYPING_STOP_DELAY_MS = 1500

/* Maps the API message shape to the shape the chat UI renders. */
function mapMessage(message) {
    const createdAt = message.created_at ? new Date(message.created_at) : new Date()
    const sender = message.sender_id

    const attachment = message.attachment?.data
        ? {
            data: message.attachment.data,
            name: message.attachment.name || 'Attachment',
            mimeType: message.attachment.mimeType || '',
            size: Number(message.attachment.size || 0)
        }
        : null

    return {
        id: message._id,
        type: 'user',
        senderId: String(sender?._id ?? message.sender_id ?? ''),
        senderPhoto: sender?.profile_photo || sender?.profilePhoto || null,
        user: sender?.name || sender?.email || 'Unknown user',
        text: message.content || '',
        attachment,
        edited: Boolean(message.edited),
        time: createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        createdAt: createdAt.getTime()
    }
}

function mapChannel(channel) {
    return {
        id: channel._id,
        name: channel.name,
        isPrivate: Boolean(channel.is_private)
    }
}

/*
    Conversation key of a realtime message:
    - channel message -> channel id
    - direct message  -> id of the other participant
*/
function getConversationKey(message, currentUserId) {
    if (message.message_type === 'direct') {
        const senderId = String(message.sender_id?._id ?? message.sender_id ?? '')
        const receiverId = String(message.receiver_id?._id ?? message.receiver_id ?? '')

        if (!senderId || !receiverId) {
            return null
        }

        return senderId === String(currentUserId) ? receiverId : senderId
    }

    return message.channel_id ? String(message.channel_id) : null
}

function sortByCreationDate(messages) {
    return [...messages].sort(
        (first, second) => (first.createdAt || 0) - (second.createdAt || 0)
    )
}

export function WorkspaceProvider({ children, workspaceId }) {
    const navigate = useNavigate()
    const [workspace, setWorkspace] = useState(null)
    const [loadingWorkspace, setLoadingWorkspace] = useState(Boolean(workspaceId))
    const [workspaceError, setWorkspaceError] = useState(null)

    // Left navigation bar selection ('home', 'dms', 'activity', 'files', 'admin')
    const [activeNavTab, setActiveNavTab] = useState('home')

    // Channels and active selection
    const [channels, setChannels] = useState([])
    const [activeChannelId, setActiveChannelId] = useState(null)
    const [loadingChannels, setLoadingChannels] = useState(Boolean(workspaceId))
    const [channelError, setChannelError] = useState(null)

    // Direct Messages and active selection
    const [activeDmId, setActiveDmId] = useState(null)

    const { members: workspaceMembers, activeMembers, refreshMembers } = useWorkspaceMembers(workspaceId)

    // Apps list
    const [apps] = useState(INITIAL_APPS)

    // Messages dictionary keyed by channel or DM ID
    const [messagesByConversation, setMessagesByConversation] = useState({})
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [messageError, setMessageError] = useState(null)

    // Unread counters and "typing" state, both keyed by conversation.
    const [unreadByConversation, setUnreadByConversation] = useState({})
    const [typingByConversation, setTypingByConversation] = useState({})
    const [starredMessages, setStarredMessages] = useState([])
    const [loadingStarred, setLoadingStarred] = useState(false)

    // Incremented after a socket reconnection to refetch what was missed.
    const [realtimeRefreshToken, setRealtimeRefreshToken] = useState(0)

    // Values read by socket handlers without reconnecting on every change.
    const activeChannelIdRef = useRef(null)
    const activeDmIdRef = useRef(null)
    const currentUserIdRef = useRef(null)
    const channelsRef = useRef([])

    // Outgoing typing state and timers.
    const outgoingTypingRef = useRef(null)
    const typingStopTimerRef = useRef(null)
    const typingTimersRef = useRef({})

    // Throttles the "mark as read" request for the open conversation.
    const lastReadMarkRef = useRef({ key: null, at: 0 })

    // In-app navigation history (back/forward in top bar).
    const navHistoryRef = useRef([])
    const navHistoryIndexRef = useRef(-1)
    const isHistoryNavRef = useRef(false)
    const [navHistoryState, setNavHistoryState] = useState({ index: -1, length: 0, entries: [] })

    // Global search input
    const [searchQuery, setSearchQuery] = useState('')

    // Current logged-in user, loaded from the API with the auth token.
    const [currentUser, setCurrentUser] = useState({
        id: null,
        username: '',
        displayName: '',
        initials: '',
        status: 'online',
        photo: null
    })

    // Direct messages: one entry per active member of the workspace.
    // The signed-in user reads their own status from `currentUser`, so a
    // status change shows up immediately instead of waiting for a refetch.
    const directMessages = activeMembers
        .filter((member) => member.FK_id_user?._id)
        .map((member) => {
            const id = member.FK_id_user._id
            const isSelf = Boolean(currentUser.id)
                && String(id) === String(currentUser.id)

            return {
                id,
                username: member.FK_id_user.name || member.FK_id_user.email,
                status: isSelf ? currentUser.status : member.FK_id_user.status,
                photo: isSelf
                    ? currentUser.photo
                    : member.FK_id_user.profile_photo || null,
                isSelf
            }
        })

    // The user's own presence.
    const userStatus = currentUser.status

    // Role of the signed-in user in this workspace. It decides which
    // destructive actions the UI offers (the API enforces them anyway).
    const currentMembership = activeMembers.find(
        (member) => String(member.FK_id_user?._id) === String(currentUser.id)
    )
    const currentUserRole = currentMembership?.role || null
    const canManageChannels = ['Owner', 'Admin'].includes(currentUserRole)
    const canDeleteAnyMessage = canManageChannels
    const canManageWorkspace = currentUserRole === 'Owner'

    // Keep the refs used by socket handlers in sync with the latest render.
    useEffect(() => {
        activeChannelIdRef.current = activeChannelId
        activeDmIdRef.current = activeDmId
        currentUserIdRef.current = currentUser.id
        channelsRef.current = channels
    }, [activeChannelId, activeDmId, currentUser.id, channels])

    // Rebuild the unread badges from the persisted read state.
    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let isMounted = true

        getUnreadCounts(workspaceId)
            .then((response) => {
                if (!isMounted) {
                    return
                }

                const counts = response?.data?.counts || {}

                setUnreadByConversation((previous) => {
                    const merged = { ...counts }

                    Object.entries(previous).forEach(([key, value]) => {
                        merged[key] = Math.max(Number(merged[key] || 0), Number(value || 0))
                    })

                    // The conversation already open counts as read.
                    if (activeChannelIdRef.current) {
                        merged[String(activeChannelIdRef.current)] = 0
                    }

                    if (activeDmIdRef.current) {
                        merged[String(activeDmIdRef.current)] = 0
                    }

                    return merged
                })
            })
            .catch((error) => {
                console.warn('Could not load the unread counts:', error.message)
            })

        return () => {
            isMounted = false
        }
    }, [workspaceId])

    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let isMounted = true
        setLoadingStarred(true)

        getStarredMessages(workspaceId)
            .then((response) => {
                if (isMounted) {
                    setStarredMessages(response?.data?.starred || [])
                }
            })
            .catch((error) => {
                console.warn('Could not load starred messages:', error.message)
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingStarred(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [workspaceId])

    const persistReadState = useCallback((conversationKey, conversationType) => {
        if (!workspaceId || !conversationKey) {
            return
        }

        lastReadMarkRef.current = { key: conversationKey, at: Date.now() }

        markConversationReadRequest(workspaceId, conversationKey, conversationType)
            .catch((error) => {
                console.warn('Could not mark the conversation as read:', error.message)
            })
    }, [workspaceId])

    // Fetch workspace metadata when workspaceId is provided
    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let isMounted = true

        getWorkspaceById(workspaceId)
            .then((res) => {
                if (isMounted) {
                    const data = res?.data?.selectedWorkspace || res?.data || {}
                    setWorkspace(data)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.warn('Could not fetch workspace from API, using fallback data:', err.message)
                    // Fallback to minimal workspace representation
                    setWorkspace({
                        id: workspaceId,
                        name: 'New Workspace',
                        description: 'Your workspace'
                    })
                    setWorkspaceError(err.message)
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingWorkspace(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [workspaceId])

    // Fetch the signed-in user so messages and the "you" badge use real data.
    useEffect(() => {
        let isMounted = true

        getCurrentUser()
            .then((res) => {
                const user = res?.data?.user

                if (isMounted && user) {
                    setCurrentUser({
                        id: user._id,
                        username: user.name,
                        displayName: user.name,
                        initials: (user.name || '').slice(0, 2).toUpperCase(),
                        status: user.status || 'online',
                        photo: user.profile_photo || null
                    })
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.warn('Could not fetch the current user:', err.message)
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    // Fetch the channels of the workspace.
    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let isMounted = true

        getChannels(workspaceId)
            .then((res) => {
                if (!isMounted) {
                    return
                }

                const obtainedChannels = (res?.data?.channels || []).map(mapChannel)

                // Merge instead of replacing: a channel created through the
                // socket while this request was in flight must not be lost.
                setChannels((previous) => {
                    const byId = new Map()

                    for (const channel of obtainedChannels) {
                        byId.set(String(channel.id), channel)
                    }

                    for (const channel of previous) {
                        if (!byId.has(String(channel.id))) {
                            byId.set(String(channel.id), channel)
                        }
                    }

                    return [...byId.values()]
                })

                setChannelError(null)

                // Keep the current selection if it still exists; otherwise
                // open the first channel of the workspace.
                setActiveChannelId((previousId) => {
                    const stillExists = obtainedChannels.some(
                        (channel) => channel.id === previousId
                    )

                    return stillExists ? previousId : (obtainedChannels[0]?.id || null)
                })
            })
            .catch((err) => {
                if (isMounted) {
                    setChannelError(err.message)
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingChannels(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [workspaceId, realtimeRefreshToken])

    const activeChannel = channels.find((c) => c.id === activeChannelId) || null
    const activeDm = directMessages.find((dm) => dm.id === activeDmId) || null

    // Determine current conversation key
    const currentConversationKey = activeDmId || activeChannelId
    const currentMessages = currentConversationKey
        ? messagesByConversation[String(currentConversationKey)] || []
        : []

    const currentTypingUsers = currentConversationKey
        ? Object.values(typingByConversation[String(currentConversationKey)] || {})
        : []

    useEffect(() => {
        const state = {
            navTab: activeNavTab,
            channelId: activeChannelId ? String(activeChannelId) : null,
            dmId: activeDmId ? String(activeDmId) : null
        }

        if (isHistoryNavRef.current) {
            isHistoryNavRef.current = false
            return
        }

        const current = navHistoryRef.current[navHistoryIndexRef.current]
        if (
            current
            && current.navTab === state.navTab
            && current.channelId === state.channelId
            && current.dmId === state.dmId
        ) {
            return
        }

        navHistoryRef.current = navHistoryRef.current.slice(0, navHistoryIndexRef.current + 1)
        navHistoryRef.current.push(state)
        navHistoryIndexRef.current = navHistoryRef.current.length - 1
        setNavHistoryState({
            index: navHistoryIndexRef.current,
            length: navHistoryRef.current.length,
            entries: [...navHistoryRef.current]
        })
    }, [activeNavTab, activeChannelId, activeDmId])

    function applyNavHistoryState(state) {
        if (!state) {
            return
        }

        isHistoryNavRef.current = true
        setActiveNavTab(state.navTab || 'home')
        setActiveChannelId(state.channelId || null)
        setActiveDmId(state.dmId || null)
    }

    function goBack() {
        if (navHistoryIndexRef.current <= 0) {
            return
        }

        navHistoryIndexRef.current -= 1
        setNavHistoryState({
            index: navHistoryIndexRef.current,
            length: navHistoryRef.current.length,
            entries: [...navHistoryRef.current]
        })
        applyNavHistoryState(navHistoryRef.current[navHistoryIndexRef.current])
    }

    function goForward() {
        if (navHistoryIndexRef.current >= navHistoryRef.current.length - 1) {
            return
        }

        navHistoryIndexRef.current += 1
        setNavHistoryState({
            index: navHistoryIndexRef.current,
            length: navHistoryRef.current.length,
            entries: [...navHistoryRef.current]
        })
        applyNavHistoryState(navHistoryRef.current[navHistoryIndexRef.current])
    }

    function goToHistoryIndex(index) {
        if (index < 0 || index >= navHistoryRef.current.length || index === navHistoryIndexRef.current) {
            return
        }

        navHistoryIndexRef.current = index
        setNavHistoryState({
            index: navHistoryIndexRef.current,
            length: navHistoryRef.current.length,
            entries: [...navHistoryRef.current]
        })
        applyNavHistoryState(navHistoryRef.current[navHistoryIndexRef.current])
    }

    /*
        Adds a message only if its id is not already stored. Both the REST
        response and the socket event can deliver the same message.
    */
    const upsertMessage = useCallback((conversationKey, message) => {
        const mappedMessage = mapMessage(message)

        setMessagesByConversation((previous) => {
            const existing = previous[conversationKey] || []

            if (existing.some((item) => String(item.id) === String(mappedMessage.id))) {
                return previous
            }

            return {
                ...previous,
                [conversationKey]: sortByCreationDate([...existing, mappedMessage])
            }
        })
    }, [])

    /*
        Merges a REST response with messages that may have arrived by socket
        while the request was in flight.
    */
    const mergeMessages = useCallback((conversationKey, incomingMessages) => {
        const mappedMessages = incomingMessages.map(mapMessage)

        setMessagesByConversation((previous) => {
            const byId = new Map()

            for (const message of mappedMessages) {
                byId.set(String(message.id), message)
            }

            for (const message of previous[conversationKey] || []) {
                byId.set(String(message.id), message)
            }

            return {
                ...previous,
                [conversationKey]: sortByCreationDate([...byId.values()])
            }
        })
    }, [])

    /*
        Removes a channel and everything cached for it. Used both by the
        local delete action and by the channel:deleted socket event.
    */
    const removeChannelLocally = useCallback((channelId) => {
        const key = String(channelId)
        const remainingChannels = channelsRef.current.filter(
            (channel) => String(channel.id) !== key
        )

        channelsRef.current = remainingChannels
        setChannels(remainingChannels)

        setMessagesByConversation((previous) => {
            if (!(key in previous)) {
                return previous
            }

            const next = { ...previous }
            delete next[key]
            return next
        })

        setUnreadByConversation((previous) => {
            if (!(key in previous)) {
                return previous
            }

            const next = { ...previous }
            delete next[key]
            return next
        })

        setTypingByConversation((previous) => {
            if (!(key in previous)) {
                return previous
            }

            const next = { ...previous }
            delete next[key]
            return next
        })

        // If the user was looking at the deleted channel, move to the first
        // one that is still available (a DM open takes precedence).
        if (!activeDmIdRef.current && String(activeChannelIdRef.current) === key) {
            const nextChannelId = remainingChannels[0]?.id || null

            activeChannelIdRef.current = nextChannelId
            setActiveChannelId(nextChannelId)
            setLoadingMessages(Boolean(nextChannelId))
        }
    }, [])

    /* Removes one message from a conversation after it was deleted. */
    const removeMessageLocally = useCallback((conversationKey, messageId) => {
        setMessagesByConversation((previous) => {
            const existing = previous[conversationKey]

            if (!existing) {
                return previous
            }

            const filtered = existing.filter(
                (message) => String(message.id) !== String(messageId)
            )

            if (filtered.length === existing.length) {
                return previous
            }

            return {
                ...previous,
                [conversationKey]: filtered
            }
        })
    }, [])

    // Load the messages of the active channel or direct message.
    useEffect(() => {
        if (!workspaceId || !currentConversationKey) {
            return
        }

        let isMounted = true
        const conversationKey = String(currentConversationKey)

        const request = activeDmId
            ? getDirectMessages(workspaceId, activeDmId)
            : getChannelMessages(workspaceId, activeChannelId)

        request
            .then((res) => {
                if (!isMounted) {
                    return
                }

                mergeMessages(conversationKey, res?.data?.messages || [])
                setMessageError(null)
            })
            .catch((err) => {
                if (isMounted) {
                    setMessageError(err.message)
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingMessages(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [
        workspaceId,
        activeChannelId,
        activeDmId,
        currentConversationKey,
        realtimeRefreshToken,
        mergeMessages
    ])

    // Realtime connection: messages, channels and typing notifications.
    useEffect(() => {
        if (!workspaceId) {
            return
        }

        const socket = connectSocket()

        if (!socket) {
            return
        }

        let hasConnectedBefore = socket.connected

        function joinWorkspace() {
            socket.emit('workspace:join', { workspaceId })
        }

        function handleConnect() {
            joinWorkspace()

            // On reconnections, refetch the channels and the open conversation
            // to recover events that were sent while the socket was down.
            if (hasConnectedBefore) {
                setRealtimeRefreshToken((token) => token + 1)
            }

            hasConnectedBefore = true
        }

        if (socket.connected) {
            joinWorkspace()
        }

        socket.on('connect', handleConnect)

        function handleMessageCreated(payload) {
            const message = payload?.message

            if (!message) {
                return
            }

            const conversationKey = getConversationKey(message, currentUserIdRef.current)

            if (!conversationKey) {
                return
            }

            const isDirect = message.message_type === 'direct'
            const isActiveConversation = isDirect
                ? String(activeDmIdRef.current) === conversationKey
                : !activeDmIdRef.current
                    && String(activeChannelIdRef.current) === conversationKey

            if (isActiveConversation) {
                upsertMessage(conversationKey, message)

                setUnreadByConversation((previous) => (
                    previous[conversationKey]
                        ? { ...previous, [conversationKey]: 0 }
                        : previous
                ))

                // Persist the read state, throttled so a busy channel does
                // not send one request per message.
                const now = Date.now()
                const lastMark = lastReadMarkRef.current

                if (lastMark.key !== conversationKey || now - lastMark.at > 3000) {
                    persistReadState(conversationKey, isDirect ? 'direct' : 'channel')
                }

                return
            }

            setUnreadByConversation((previous) => ({
                ...previous,
                [conversationKey]: (previous[conversationKey] || 0) + 1
            }))
        }

        function handleMessageUpdated(payload) {
            const message = payload?.message

            if (!message) {
                return
            }

            const conversationKey = getConversationKey(message, currentUserIdRef.current)

            if (!conversationKey) {
                return
            }

            upsertMessage(conversationKey, message)
        }

        function handleChannelCreated(payload) {
            const channel = payload?.channel

            if (!channel) {
                return
            }

            const mappedChannel = mapChannel(channel)

            setChannels((previous) => (
                previous.some((item) => String(item.id) === String(mappedChannel.id))
                    ? previous
                    : [...previous, mappedChannel]
            ))
        }

        function handleMessageDeleted(payload) {
            const message = payload?.message

            if (!message) {
                return
            }

            const conversationKey = getConversationKey(message, currentUserIdRef.current)

            if (!conversationKey) {
                return
            }

            const deletedId = String(payload.messageId ?? message._id ?? '')

            removeMessageLocally(conversationKey, deletedId)
            if (deletedId) {
                setStarredMessages((previous) => previous.filter(
                    (item) => String(item?.message_id?._id || item?.message_id || '') !== deletedId
                ))
            }

            // If it was an unread message of another person, lower the badge.
            const senderId = String(message.sender_id?._id ?? message.sender_id ?? '')
            const isOwnMessage = senderId === String(currentUserIdRef.current)
            const isActiveConversation = message.message_type === 'direct'
                ? String(activeDmIdRef.current) === conversationKey
                : !activeDmIdRef.current
                    && String(activeChannelIdRef.current) === conversationKey

            if (!isOwnMessage && !isActiveConversation) {
                setUnreadByConversation((previous) => {
                    const currentUnread = previous[conversationKey]

                    if (!currentUnread) {
                        return previous
                    }

                    return {
                        ...previous,
                        [conversationKey]: Math.max(0, currentUnread - 1)
                    }
                })
            }
        }

        function handleChannelDeleted(payload) {
            const channelId = payload?.channelId ?? payload?.channel?._id

            if (!channelId) {
                return
            }

            removeChannelLocally(channelId)
        }

        function handleWorkspaceDeleted() {
            // The workspace no longer exists: leave the screen. The member
            // who deleted it navigates here too, so this is idempotent.
            navigate('/home', { replace: true })
        }

        async function handleMembersChanged() {
            const response = await refreshMembers()
            const members = response?.data?.members || []
            const currentUserId = String(currentUserIdRef.current || '')
            const isStillMember = members.some((member) => {
                const invitationAccepted = member.invitation_accepted ?? member.invitationAccepted
                const memberId = String(member?.FK_id_user?._id || member?.FK_id_user || '')
                return invitationAccepted && memberId === currentUserId
            })

            if (currentUserId && !isStillMember) {
                navigate('/home', { replace: true })
            }
        }

        function removeTypingUser(conversationKey, userId) {
            const timerKey = `${conversationKey}:${userId}`

            clearTimeout(typingTimersRef.current[timerKey])
            delete typingTimersRef.current[timerKey]

            setTypingByConversation((previous) => {
                const conversation = previous[conversationKey]

                if (!conversation || !conversation[userId]) {
                    return previous
                }

                const updatedConversation = { ...conversation }
                delete updatedConversation[userId]

                const updatedState = { ...previous }

                if (Object.keys(updatedConversation).length === 0) {
                    delete updatedState[conversationKey]
                } else {
                    updatedState[conversationKey] = updatedConversation
                }

                return updatedState
            })
        }

        function handleTypingStart(payload) {
            if (!payload) {
                return
            }

            const typingUserId = String(payload.user?._id || payload.userId || '')

            if (!typingUserId || typingUserId === String(currentUserIdRef.current)) {
                return
            }

            const conversationKey = payload.scope === 'direct'
                ? typingUserId
                : String(payload.channelId || '')

            if (!conversationKey) {
                return
            }

            setTypingByConversation((previous) => ({
                ...previous,
                [conversationKey]: {
                    ...(previous[conversationKey] || {}),
                    [typingUserId]: payload.user?.name || 'Someone'
                }
            }))

            const timerKey = `${conversationKey}:${typingUserId}`

            clearTimeout(typingTimersRef.current[timerKey])
            typingTimersRef.current[timerKey] = setTimeout(() => {
                removeTypingUser(conversationKey, typingUserId)
            }, TYPING_TIMEOUT_MS)
        }

        function handleTypingStop(payload) {
            if (!payload) {
                return
            }

            const typingUserId = String(payload.user?._id || payload.userId || '')

            if (!typingUserId) {
                return
            }

            const conversationKey = payload.scope === 'direct'
                ? typingUserId
                : String(payload.channelId || '')

            if (conversationKey) {
                removeTypingUser(conversationKey, typingUserId)
            }
        }

        socket.on('message:created', handleMessageCreated)
        socket.on('message:updated', handleMessageUpdated)
        socket.on('message:deleted', handleMessageDeleted)
        socket.on('channel:created', handleChannelCreated)
        socket.on('channel:deleted', handleChannelDeleted)
        socket.on('workspace:deleted', handleWorkspaceDeleted)
        socket.on('workspace:members-changed', handleMembersChanged)
        socket.on('typing:start', handleTypingStart)
        socket.on('typing:stop', handleTypingStop)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('message:created', handleMessageCreated)
            socket.off('message:updated', handleMessageUpdated)
            socket.off('message:deleted', handleMessageDeleted)
            socket.off('channel:created', handleChannelCreated)
            socket.off('channel:deleted', handleChannelDeleted)
            socket.off('workspace:deleted', handleWorkspaceDeleted)
            socket.off('workspace:members-changed', handleMembersChanged)
            socket.off('typing:start', handleTypingStart)
            socket.off('typing:stop', handleTypingStop)

            Object.values(typingTimersRef.current).forEach(clearTimeout)
            typingTimersRef.current = {}

            disconnectSocket()
        }
    }, [workspaceId, persistReadState, upsertMessage, removeChannelLocally, removeMessageLocally, navigate, refreshMembers])

    // Clear the outgoing typing timer when the screen unmounts.
    useEffect(() => {
        return () => {
            clearTimeout(typingStopTimerRef.current)
        }
    }, [])

    function clearUnread(conversationKey) {
        if (!conversationKey) {
            return
        }

        setUnreadByConversation((previous) => (
            previous[conversationKey]
                ? { ...previous, [conversationKey]: 0 }
                : previous
        ))
    }

    /*
        Tells the server that this user is typing in the active conversation.
        Only the first keystroke emits the event; the rest just reset the
        timer that sends "stop typing".
    */
    function notifyTyping() {
        const socket = getSocket()

        if (!socket || !socket.connected || !workspaceId) {
            return
        }

        const dmId = activeDmId
        const channelId = activeChannelId

        if (!dmId && !channelId) {
            return
        }

        if (!outgoingTypingRef.current) {
            const payload = dmId
                ? { workspaceId, scope: 'direct', userId: String(dmId) }
                : { workspaceId, scope: 'channel', channelId: String(channelId) }

            outgoingTypingRef.current = payload
            socket.emit('typing:start', payload)
        }

        clearTimeout(typingStopTimerRef.current)
        typingStopTimerRef.current = setTimeout(stopTyping, TYPING_STOP_DELAY_MS)
    }

    function stopTyping() {
        clearTimeout(typingStopTimerRef.current)
        typingStopTimerRef.current = null

        const payload = outgoingTypingRef.current
        outgoingTypingRef.current = null

        const socket = getSocket()

        if (socket && payload) {
            socket.emit('typing:stop', payload)
        }
    }

    function selectChannel(channelId) {
        // Any conversation opens in the chat pane, leaving overview screens
        // such as the Direct messages list.
        setActiveNavTab('home')

        // Clicking the conversation already open would leave the loading flag on,
        // because the messages effect would not run again.
        if (channelId === activeChannelId && !activeDmId) {
            return
        }

        stopTyping()
        clearUnread(String(channelId))
        persistReadState(String(channelId), 'channel')
        setLoadingMessages(true)
        setActiveChannelId(channelId)
        setActiveDmId(null)
    }

    function selectDm(dmId) {
        // Only members of the workspace with an active membership can be opened as a DM.
        if (!directMessages.some((dm) => dm.id === dmId)) {
            return
        }

        setActiveNavTab((current) => (current === 'dms' ? 'dms' : 'home'))

        if (dmId === activeDmId) {
            return
        }

        stopTyping()
        clearUnread(String(dmId))
        persistReadState(String(dmId), 'direct')
        setLoadingMessages(true)
        setActiveDmId(dmId)
    }

    function openDmsTab() {
        stopTyping()
        setActiveDmId(null)
        setActiveChannelId(null)
        setActiveNavTab('dms')
    }

    async function setUserStatus(status) {
        if (!['online', 'away', 'offline', 'do not disturb'].includes(status)) {
            return false
        }

        try {
            await updateUserStatus(status)
            setCurrentUser((prev) => ({ ...prev, status }))
            return true
        } catch (error) {
            console.error('Could not update the user status:', error.message)
            return false
        }
    }

    /*
        Stores a new profile photo (already compressed to a small base64
        JPEG) and updates the avatar without a reload.
    */
    async function changeProfilePhoto(profilePhoto) {
        await updateProfilePhoto(profilePhoto)
        setCurrentUser((prev) => ({ ...prev, photo: profilePhoto }))
    }

    /*
        Sends a message to the active conversation. Returns true when the
        server stored it, so the composer only clears the input on success.
    */
    async function sendMessage(text, attachment = null) {
        const content = text?.trim() || ''

        if ((!content && !attachment) || !workspaceId || !currentConversationKey) {
            return false
        }

        const dmId = activeDmId
        const channelId = activeChannelId
        const conversationKey = String(dmId || channelId)

        stopTyping()

        try {
            const response = dmId
                ? await sendDirectMessage(workspaceId, dmId, content, attachment)
                : await sendChannelMessage(workspaceId, channelId, content, attachment)

            const createdMessage = response?.data?.message

            if (createdMessage) {
                // The socket event will deliver the same message too; upsert
                // deduplicates it by id.
                upsertMessage(conversationKey, createdMessage)
            }

            setMessageError(null)
            return true
        } catch (error) {
            setMessageError(error.message)
            return false
        }
    }

    /*
        Deletes one message of the active conversation. Returns true when
        the message is gone from the server (or already gone).
    */
    async function deleteMessage(messageId) {
        if (!workspaceId || !messageId) {
            return false
        }

        const conversationKey = currentConversationKey
            ? String(currentConversationKey)
            : null

        try {
            await deleteMessageRequest(workspaceId, messageId)
        } catch (error) {
            // A 404 means someone else deleted it first: drop it locally too.
            if (!/404/.test(error.message)) {
                setMessageError(error.message)
                return false
            }
        }

        if (conversationKey) {
            removeMessageLocally(conversationKey, messageId)
        }

        setMessageError(null)
        return true
    }

    async function editMessage(messageId, content) {
        if (!workspaceId || !messageId) {
            return false
        }

        const conversationKey = currentConversationKey
            ? String(currentConversationKey)
            : null

        try {
            const response = await updateMessageRequest(workspaceId, messageId, content)
            const updatedMessage = response?.data?.message

            if (updatedMessage && conversationKey) {
                upsertMessage(conversationKey, updatedMessage)
            }

            setMessageError(null)
            return true
        } catch (error) {
            setMessageError(error.message)
            return false
        }
    }

    /*
        Deletes a channel and everything cached for it. Throws on failure so
        the confirmation dialog can show the server message.
    */
    async function deleteChannel(channelId) {
        if (!workspaceId || !channelId) {
            throw new Error('Channel not found.')
        }

        await deleteChannelRequest(workspaceId, channelId)

        stopTyping()
        removeChannelLocally(channelId)
    }

    /*
        Deletes the workspace (owner only) and returns to the workspace list.
    */
    async function deleteWorkspace() {
        if (!workspaceId) {
            throw new Error('Workspace not found.')
        }

        await deleteWorkspaceRequest(workspaceId)

        disconnectSocket()
        navigate('/home', { replace: true })
    }

    /* Renames the workspace (Owner/Admin). */
    async function renameWorkspace(name) {
        const trimmedName = name?.trim()

        if (!workspaceId || !trimmedName) {
            throw new Error('Workspace name is required.')
        }

        const response = await updateWorkspaceRequest(workspaceId, trimmedName)
        const updatedWorkspace = response?.data?.updatedWorkspace

        setWorkspace((previous) => ({
            ...(previous || {}),
            ...(updatedWorkspace || {}),
            name: updatedWorkspace?.name || trimmedName
        }))

        return updatedWorkspace
    }

    /* Removes a member from the workspace (Owner/Admin). */
    async function removeWorkspaceMember(memberId) {
        if (!workspaceId || !memberId) {
            throw new Error('Member not found.')
        }

        await deleteWorkspaceMemberRequest(workspaceId, memberId)
        await refreshMembers()
    }

    /* Changes a member role between User/Admin (Owner/Admin). */
    async function changeWorkspaceMemberRole(memberId, role) {
        if (!workspaceId || !memberId) {
            throw new Error('Member not found.')
        }

        await updateMemberRoleRequest(workspaceId, memberId, role)
        await refreshMembers()
    }

    /*
        Creates a channel in the workspace. Returns true when the server
        stored it, so the sidebar can keep the form open on error.
    */
    async function addChannel(name) {
        const trimmedName = name?.trim()

        if (!trimmedName || !workspaceId) {
            return false
        }

        try {
            const response = await createChannel(workspaceId, trimmedName)
            const createdChannel = response?.data?.channel

            if (!createdChannel) {
                return false
            }

            const mappedChannel = mapChannel(createdChannel)

            stopTyping()
            clearUnread(String(mappedChannel.id))
            setChannels((previous) => [...previous, mappedChannel])
            setActiveChannelId(mappedChannel.id)
            setActiveDmId(null)
            setChannelError(null)

            return true
        } catch (error) {
            setChannelError(error.message)
            return false
        }
    }

    function clearChannelError() {
        setChannelError(null)
    }

    const starredMessageIds = new Set(
        starredMessages
            .map((item) => String(item?.message_id?._id || item?.message_id || ''))
            .filter(Boolean)
    )

    async function toggleStarMessage(messageId) {
        if (!workspaceId || !messageId) {
            return
        }

        const key = String(messageId)
        const isStarred = starredMessageIds.has(key)

        try {
            if (isStarred) {
                await unstarMessageRequest(workspaceId, key)
            } else {
                await starMessageRequest(workspaceId, key)
            }

            const response = await getStarredMessages(workspaceId)
            setStarredMessages(response?.data?.starred || [])
        } catch (error) {
            console.warn('Could not update starred message:', error.message)
        }
    }

    const value = {
        workspaceId,
        workspace,
        loadingWorkspace,
        workspaceError,
        activeNavTab,
        setActiveNavTab,
        channels,
        activeChannel,
        selectChannel,
        addChannel,
        loadingChannels,
        channelError,
        clearChannelError,
        directMessages,
        activeDm,
        selectDm,
        openDmsTab,
        apps,
        starredMessages,
        loadingStarred,
        starredMessageIds,
        toggleStarMessage,
        messages: currentMessages,
        loadingMessages,
        messageError,
        sendMessage,
        editMessage,
        deleteMessage,
        deleteChannel,
        deleteWorkspace,
        renameWorkspace,
        removeWorkspaceMember,
        changeWorkspaceMemberRole,
        workspaceMembers,
        activeMembers,
        refreshMembers,
        currentUserRole,
        canManageChannels,
        canDeleteAnyMessage,
        canManageWorkspace,
        unreadByConversation,
        typingUsers: currentTypingUsers,
        notifyTyping,
        stopTyping,
        currentUser,
        userStatus,
        setUserStatus,
        changeProfilePhoto,
        searchQuery,
        setSearchQuery,
        canGoBack: navHistoryState.index > 0,
        canGoForward: navHistoryState.index < navHistoryState.length - 1,
        goBack,
        goForward,
        goToHistoryIndex,
        navHistory: navHistoryState
    }

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    )
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider')
    }
    return context
}

export default WorkspaceContext
