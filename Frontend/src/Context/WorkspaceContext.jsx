import React, { createContext, useContext, useEffect, useState } from 'react'
import { getWorkspaceById } from '../Services/WorkSpaceService'
import { updateUserStatus } from '../Services/ProfileService'
import useWorkspaceMembers from '../Hooks/useWorkspaceMembers'

/*
    WorkspaceContext: central state for the Slack workspace interface.
    Owns workspace details, navigation selection, channel list, active channel,
    direct messages, messages feed, and current user profile.
*/
const WorkspaceContext = createContext(null)

const INITIAL_CHANNELS = [
    { id: 'all-new-workspace', name: 'all-new-workspace', isPrivate: false },
    { id: 'new-channel', name: 'new-channel', isPrivate: false },
    { id: 'social', name: 'social', isPrivate: false }
]

const INITIAL_APPS = [
    { id: 'slack', name: 'Slack', badge: 1 },
    { id: 'gcal', name: 'Google Calendar', external: true },
    { id: 'gdrive', name: 'Google Drive', external: true }
]

const INITIAL_MESSAGES = {
    'new-channel': [
        {
            id: 'm1',
            type: 'system',
            user: 'fabrigulle05',
            text: 'joined #new-channel.',
            time: '23:18',
            date: 'Sunday, 15 November'
        }
    ]
}

export function WorkspaceProvider({ children, workspaceId }) {
    const [workspace, setWorkspace] = useState(null)
    const [loadingWorkspace, setLoadingWorkspace] = useState(Boolean(workspaceId))
    const [workspaceError, setWorkspaceError] = useState(null)

    // Left navigation bar selection ('home', 'dms', 'activity', 'files', 'agents', 'admin')
    const [activeNavTab, setActiveNavTab] = useState('home')

    // Channels and active selection
    const [channels, setChannels] = useState(INITIAL_CHANNELS)
    const [activeChannelId, setActiveChannelId] = useState('new-channel')

    // Direct Messages and active selection
    const [activeDmId, setActiveDmId] = useState(null)

    const { activeMembers } = useWorkspaceMembers(workspaceId)

    // Apps list
    const [apps] = useState(INITIAL_APPS)

    // Messages dictionary keyed by channel or DM ID
    const [messagesByConversation, setMessagesByConversation] = useState(INITIAL_MESSAGES)

    // Global search input
    const [searchQuery, setSearchQuery] = useState('')

    // Current logged-in user placeholder/profile
    const [currentUser, setCurrentUser] = useState({
        username: 'fabrigulle05',
        displayName: 'fabrigulle05',
        initials: 'FG',
        status: 'online'
    })

    // Direct messages: one entry per active member of the workspace.
    const directMessages = activeMembers.map((member) => ({
        id: member.FK_id_user?._id,
        username: member.FK_id_user?.name || member.FK_id_user?.email,
        status: member.FK_id_user?.status,
        isSelf: member.FK_id_user?.name === currentUser.username
            || member.FK_id_user?.name === currentUser.displayName
    }))

    // The user's own presence, from their active member entry.
    const userStatus = directMessages.find((dm) => dm.isSelf)?.status || currentUser.status

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

    const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[1] || channels[0]
    const activeDm = directMessages.find((dm) => dm.id === activeDmId) || null

    // Determine current conversation key
    const currentConversationKey = activeDmId ? activeDmId : activeChannel?.id || 'new-channel'
    const currentMessages = messagesByConversation[currentConversationKey] || []

    function selectChannel(channelId) {
        setActiveChannelId(channelId)
        setActiveDmId(null)
    }

    function selectDm(dmId) {
        // Only members of the workspace with an active membership can be opened as a DM.
        if (!directMessages.some((dm) => dm.id === dmId)) {
            return
        }

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

    function sendMessage(text) {
        if (!text || !text.trim()) return

        const newMessage = {
            id: `msg-${Date.now()}`,
            type: 'user',
            user: currentUser.username,
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today'
        }

        setMessagesByConversation((prev) => ({
            ...prev,
            [currentConversationKey]: [...(prev[currentConversationKey] || []), newMessage]
        }))
    }

    function addChannel(name) {
        if (!name || !name.trim()) return
        const cleanName = name.trim().toLowerCase().replace(/\s+/g, '-')
        const newChan = { id: cleanName, name: cleanName, isPrivate: false }
        setChannels((prev) => [...prev, newChan])
        setActiveChannelId(cleanName)
        setActiveDmId(null)
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
        directMessages,
        activeDm,
        selectDm,
        apps,
        messages: currentMessages,
        sendMessage,
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
