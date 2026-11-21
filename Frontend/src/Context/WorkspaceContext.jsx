import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import {
    getWorkspaceById,
    getChannels,
    createChannel,
    getChannelMessages,
    sendChannelMessage,
    getDirectMessages,
    sendDirectMessage
} from '../Services/WorkSpaceService'
import { updateUserStatus, getCurrentUser } from '../Services/ProfileService'
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
    { id: 'slack', name: 'Slack', badge: 1 },
    { id: 'gcal', name: 'Google Calendar', external: true },
    { id: 'gdrive', name: 'Google Drive', external: true }
]

const TYPING_TIMEOUT_MS = 4000
const TYPING_STOP_DELAY_MS = 1500

/* Maps the API message shape to the shape the chat UI renders. */
function mapMessage(message) {
    const createdAt = message.created_at ? new Date(message.created_at) : new Date()
    const sender = message.sender_id

    return {
        id: message._id,
        type: 'user',
        user: sender?.name || sender?.email || 'Unknown user',
        text: message.content,
        time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
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
    const [workspace, setWorkspace] = useState(null)
    const [loadingWorkspace, setLoadingWorkspace] = useState(Boolean(workspaceId))
    const [workspaceError, setWorkspaceError] = useState(null)

    // Left navigation bar selection ('home', 'dms', 'activity', 'files', 'agents', 'admin')
    const [activeNavTab, setActiveNavTab] = useState('home')

    // Channels and active selection
    const [channels, setChannels] = useState([])
    const [activeChannelId, setActiveChannelId] = useState(null)
    const [loadingChannels, setLoadingChannels] = useState(Boolean(workspaceId))
    const [channelError, setChannelError] = useState(null)

    // Direct Messages and active selection
    const [activeDmId, setActiveDmId] = useState(null)

    const { activeMembers } = useWorkspaceMembers(workspaceId)

    // Apps list
    const [apps] = useState(INITIAL_APPS)

    // Messages dictionary keyed by channel or DM ID
    const [messagesByConversation, setMessagesByConversation] = useState({})
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [messageError, setMessageError] = useState(null)

    // Unread counters and "typing" state, both keyed by conversation.
    const [unreadByConversation, setUnreadByConversation] = useState({})
    const [typingByConversation, setTypingByConversation] = useState({})

    // Incremented after a socket reconnection to refetch what was missed.
    const [realtimeRefreshToken, setRealtimeRefreshToken] = useState(0)

    // Values read by socket handlers without reconnecting on every change.
    const activeChannelIdRef = useRef(null)
    const activeDmIdRef = useRef(null)
    const currentUserIdRef = useRef(null)

    // Outgoing typing state and timers.
    const outgoingTypingRef = useRef(null)
    const typingStopTimerRef = useRef(null)
    const typingTimersRef = useRef({})

    // Global search input
    const [searchQuery, setSearchQuery] = useState('')

    // Current logged-in user, loaded from the API with the auth token.
    const [currentUser, setCurrentUser] = useState({
        id: null,
        username: '',
        displayName: '',
        initials: '',
        status: 'online'
    })

    // Direct messages: one entry per active member of the workspace.
    const directMessages = activeMembers
        .filter((member) => member.FK_id_user?._id)
        .map((member) => ({
            id: member.FK_id_user._id,
            username: member.FK_id_user.name || member.FK_id_user.email,
            status: member.FK_id_user.status,
            isSelf: Boolean(currentUser.id)
                && String(member.FK_id_user._id) === String(currentUser.id)
        }))

    // The user's own presence, from their active member entry.
    const userStatus = directMessages.find((dm) => dm.isSelf)?.status || currentUser.status

    // Keep the refs used by socket handlers in sync with the latest render.
    useEffect(() => {
        activeChannelIdRef.current = activeChannelId
        activeDmIdRef.current = activeDmId
        currentUserIdRef.current = currentUser.id
    })

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
                        status: user.status || 'online'
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

                return
            }

            setUnreadByConversation((previous) => ({
                ...previous,
                [conversationKey]: (previous[conversationKey] || 0) + 1
            }))
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
        socket.on('channel:created', handleChannelCreated)
        socket.on('typing:start', handleTypingStart)
        socket.on('typing:stop', handleTypingStop)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('message:created', handleMessageCreated)
            socket.off('channel:created', handleChannelCreated)
            socket.off('typing:start', handleTypingStart)
            socket.off('typing:stop', handleTypingStop)

            Object.values(typingTimersRef.current).forEach(clearTimeout)
            typingTimersRef.current = {}

            disconnectSocket()
        }
    }, [workspaceId, upsertMessage])

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
        // Clicking the conversation already open would leave the loading flag on,
        // because the messages effect would not run again.
        if (channelId === activeChannelId && !activeDmId) {
            return
        }

        stopTyping()
        clearUnread(String(channelId))
        setLoadingMessages(true)
        setActiveChannelId(channelId)
        setActiveDmId(null)
    }

    function selectDm(dmId) {
        // Only members of the workspace with an active membership can be opened as a DM.
        if (!directMessages.some((dm) => dm.id === dmId)) {
            return
        }

        if (dmId === activeDmId) {
            return
        }

        stopTyping()
        clearUnread(String(dmId))
        setLoadingMessages(true)
        setActiveDmId(dmId)
    }

    async function setUserStatus(status) {
        if (!['online', 'away', 'offline', 'do not disturb'].includes(status)) {
            return
        }

        try {
            await updateUserStatus(status)
            setCurrentUser((prev) => ({ ...prev, status }))
        } catch (error) {
            console.error('Could not update the user status:', error.message)
        }
    }

    /*
        Sends a message to the active conversation. Returns true when the
        server stored it, so the composer only clears the input on success.
    */
    async function sendMessage(text) {
        const content = text?.trim()

        if (!content || !workspaceId || !currentConversationKey) {
            return false
        }

        const dmId = activeDmId
        const channelId = activeChannelId
        const conversationKey = String(dmId || channelId)

        stopTyping()

        try {
            const response = dmId
                ? await sendDirectMessage(workspaceId, dmId, content)
                : await sendChannelMessage(workspaceId, channelId, content)

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
        apps,
        messages: currentMessages,
        loadingMessages,
        messageError,
        sendMessage,
        unreadByConversation,
        typingUsers: currentTypingUsers,
        notifyTyping,
        stopTyping,
        currentUser,
        userStatus,
        setUserStatus,
        searchQuery,
        setSearchQuery
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
