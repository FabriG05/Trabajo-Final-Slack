import React, { useEffect, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { getDirectMessageSummaries } from '../../../Services/WorkSpaceService'
import { getSocket } from '../../../Services/SocketService'
import { formatConversationTimestamp } from '../../../Utils/formatDate'
import InvitePeopleDialog from './InvitePeopleDialog'
import NewMessageDialog from './NewMessageDialog'
import {
    IconCompose,
    IconChevronDown,
    IconSearch,
    IconMembers,
    IconUser
} from './SlackIcons'
import '../CSS/DirectMessagesView.css'

/*
    DirectMessagesView: overview of every DM conversation of the workspace.
    Replaces the ChatArea while the "DMs" shortcut is active in the nav.
    Rows show the last message of each conversation and open it on click.
*/

const SELF_PREVIEW =
    'This is your space. Draft messages, create your to-do lists or keep links and files handy.'

function getInitials(username) {
    return (username || '?').slice(0, 2).toUpperCase()
}

function DirectMessagesView() {
    const {
        workspaceId,
        directMessages,
        currentUser,
        selectDm,
        unreadByConversation
    } = useWorkspace()

    const [filterQuery, setFilterQuery] = useState('')
    const [showUnreadOnly, setShowUnreadOnly] = useState(false)
    const [summaries, setSummaries] = useState({})
    const [loadingSummaries, setLoadingSummaries] = useState(true)
    const [summariesError, setSummariesError] = useState(null)
    const [refreshToken, setRefreshToken] = useState(0)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)

    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let cancelled = false

        async function loadSummaries() {
            try {
                const response = await getDirectMessageSummaries(workspaceId)
                const conversations = response?.data?.conversations || []

                if (cancelled) {
                    return
                }

                setSummaries(
                    conversations.reduce((accumulator, conversation) => {
                        accumulator[String(conversation.user_id)] = conversation.last_message
                        return accumulator
                    }, {})
                )
                setSummariesError(null)
            } catch (error) {
                if (!cancelled) {
                    setSummariesError(error.message || 'Could not load the conversations.')
                }
            } finally {
                if (!cancelled) {
                    setLoadingSummaries(false)
                }
            }
        }

        loadSummaries()

        return () => {
            cancelled = true
        }
    }, [workspaceId, refreshToken])

    // Keep the previews live while the screen is open.
    useEffect(() => {
        const socket = getSocket()

        if (!socket) {
            return
        }

        function handleMessageCreated(payload) {
            const message = payload?.message

            if (!message || message.message_type !== 'direct') {
                return
            }

            const senderId = String(message.sender_id?._id ?? message.sender_id ?? '')
            const receiverId = String(message.receiver_id?._id ?? message.receiver_id ?? '')
            const currentUserId = String(currentUser.id)

            if (!currentUserId || (senderId !== currentUserId && receiverId !== currentUserId)) {
                return
            }

            const partnerId = senderId === currentUserId ? receiverId : senderId

            if (!partnerId) {
                return
            }

            setSummaries((previous) => ({
                ...previous,
                [partnerId]: {
                    id: message._id,
                    content: message.content,
                    sender_id: message.sender_id?._id ?? message.sender_id,
                    created_at: message.created_at || new Date().toISOString()
                }
            }))
        }

        function handleMessageDeleted(payload) {
            if (payload?.message?.message_type === 'direct') {
                // The deleted message may have been the preview of the row.
                setRefreshToken((token) => token + 1)
            }
        }

        socket.on('message:created', handleMessageCreated)
        socket.on('message:deleted', handleMessageDeleted)

        return () => {
            socket.off('message:created', handleMessageCreated)
            socket.off('message:deleted', handleMessageDeleted)
        }
    }, [currentUser.id])

    const normalizedQuery = filterQuery.trim().toLowerCase()

    const rows = directMessages
        .map((dm) => ({
            ...dm,
            summary: summaries[String(dm.id)] || null
        }))
        .filter((dm) => {
            if (normalizedQuery && !dm.username.toLowerCase().includes(normalizedQuery)) {
                return false
            }

            if (showUnreadOnly && !Number(unreadByConversation[dm.id] || 0)) {
                return false
            }

            return true
        })
        .sort((first, second) => {
            const firstTime = first.summary?.created_at
                ? new Date(first.summary.created_at).getTime()
                : 0
            const secondTime = second.summary?.created_at
                ? new Date(second.summary.created_at).getTime()
                : 0

            return secondTime - firstTime
        })

    function getPreview(dm) {
        if (dm.isSelf) {
            return dm.summary?.content
                ? `You: ${dm.summary.content}`
                : SELF_PREVIEW
        }

        if (!dm.summary) {
            return 'No messages yet'
        }

        const isOwnMessage =
            String(dm.summary.sender_id?._id ?? dm.summary.sender_id ?? '') === String(currentUser.id)

        return isOwnMessage ? `You: ${dm.summary.content}` : dm.summary.content
    }

    return (
        <main className='dms-view' aria-label='Direct messages'>
            {/* Header */}
            <header className='dms-view__header'>
                <button type='button' className='dms-view__title-btn'>
                    <span>Direct messages</span>
                    <IconChevronDown size={12} />
                </button>

                <div className='dms-view__header-actions'>
                    <button
                        type='button'
                        className='dms-view__toggle'
                        role='switch'
                        aria-checked={showUnreadOnly}
                        onClick={() => setShowUnreadOnly((current) => !current)}
                    >
                        <span>Unread messages</span>
                        <span
                            className={`dms-view__toggle-track${showUnreadOnly ? ' dms-view__toggle-track--on' : ''}`}
                            aria-hidden='true'
                        >
                            <span className='dms-view__toggle-thumb' />
                        </span>
                    </button>

                    <button
                        type='button'
                        className='dms-view__icon-btn'
                        title='New message'
                        aria-label='New message'
                        onClick={() => setIsNewMessageOpen(true)}
                    >
                        <IconCompose size={16} />
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className='dms-view__search'>
                <span className='dms-view__search-icon' aria-hidden='true'>
                    <IconSearch size={14} />
                </span>
                <input
                    type='text'
                    className='dms-view__search-input'
                    placeholder='Find a DM...'
                    value={filterQuery}
                    onChange={(event) => setFilterQuery(event.target.value)}
                />
            </div>

            {/* Invite banner */}
            <div className='dms-view__banner'>
                <span className='dms-view__banner-icon' aria-hidden='true'>
                    <IconMembers size={18} />
                </span>
                <p className='dms-view__banner-text'>
                    Anyone missing? Add your whole team and get the conversation started.
                </p>
                <button type='button' className='dms-view__banner-btn' onClick={() => setIsInviteOpen(true)}>
                    Add colleagues
                </button>
            </div>

            {/* Conversation list */}
            <div className='dms-view__body'>
                {loadingSummaries && (
                    <p className='dms-view__notice'>Loading direct messages…</p>
                )}
                {summariesError && (
                    <p className='dms-view__notice dms-view__notice--error' role='alert'>
                        {summariesError}
                    </p>
                )}
                {!loadingSummaries && rows.length === 0 && (
                    <p className='dms-view__notice'>
                        {showUnreadOnly ? 'No unread direct messages' : 'No DMs found'}
                    </p>
                )}

                <ul className='dms-view__list'>
                    {rows.map((dm) => {
                        const unreadCount = Number(unreadByConversation[dm.id] || 0)

                        return (
                            <li key={dm.id}>
                                <button
                                    type='button'
                                    className='dms-view__row'
                                    onClick={() => selectDm(dm.id)}
                                >
                                    <span className='dms-view__avatar'>
                                        {dm.photo ? (
                                            <img
                                                className='dms-view__avatar-image'
                                                src={dm.photo}
                                                alt=''
                                            />
                                        ) : dm.isSelf ? (
                                            <IconUser size={18} />
                                        ) : (
                                            getInitials(dm.username)
                                        )}
                                        {dm.status && (
                                            <span
                                                className='dms-view__status'
                                                data-status={dm.status}
                                            />
                                        )}
                                    </span>

                                    <span className='dms-view__content'>
                                        <span className='dms-view__name'>
                                            {dm.username}
                                            {dm.isSelf && (
                                                <span className='dms-view__you'>(you)</span>
                                            )}
                                        </span>
                                        <span className='dms-view__preview'>
                                            {getPreview(dm)}
                                        </span>
                                    </span>

                                    <span className='dms-view__meta'>
                                        {dm.summary?.created_at && (
                                            <span className='dms-view__time'>
                                                {formatConversationTimestamp(dm.summary.created_at)}
                                            </span>
                                        )}
                                        {unreadCount > 0 && (
                                            <span className='dms-view__unread'>
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>

            {isInviteOpen && <InvitePeopleDialog onClose={() => setIsInviteOpen(false)} />}
            {isNewMessageOpen && <NewMessageDialog onClose={() => setIsNewMessageOpen(false)} />}
        </main>
    )
}

export default DirectMessagesView
