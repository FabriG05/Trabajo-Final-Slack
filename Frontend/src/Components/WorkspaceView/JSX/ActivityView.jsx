import React, { useEffect, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { getActivity, getDirectMessageSummaries } from '../../../Services/WorkSpaceService'
import { getSocket } from '../../../Services/SocketService'
import { formatConversationTimestamp } from '../../../Utils/formatDate'
import { IconCheck } from './SlackIcons'
import '../CSS/ActivityView.css'

/*
    ActivityView: mentions of the signed-in user in channels plus the
    direct conversations with unread messages. Replaces the ChatArea
    while the "Activity" shortcut is active in the nav.
*/

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getInitials(name) {
    return (name || '?').slice(0, 2).toUpperCase()
}

function ActivityView() {
    const {
        workspaceId,
        directMessages,
        currentUser,
        selectChannel,
        selectDm,
        unreadByConversation
    } = useWorkspace()

    const [showUnreadOnly, setShowUnreadOnly] = useState(true)
    const [mentions, setMentions] = useState([])
    const [summaries, setSummaries] = useState({})
    const [loading, setLoading] = useState(true)
    const [activityError, setActivityError] = useState(null)
    const [refreshToken, setRefreshToken] = useState(0)

    useEffect(() => {
        if (!workspaceId) {
            return
        }

        let cancelled = false

        async function loadActivity() {
            const [summariesResult, activityResult] = await Promise.allSettled([
                getDirectMessageSummaries(workspaceId),
                getActivity(workspaceId)
            ])

            if (cancelled) {
                return
            }

            if (summariesResult.status === 'fulfilled') {
                const conversations = summariesResult.value?.data?.conversations || []

                setSummaries(
                    conversations.reduce((accumulator, conversation) => {
                        accumulator[String(conversation.user_id)] = conversation.last_message
                        return accumulator
                    }, {})
                )
            }

            if (activityResult.status === 'fulfilled') {
                setMentions(activityResult.value?.data?.mentions || [])
            }

            const summariesFailed = summariesResult.status === 'rejected'
            const activityFailed = activityResult.status === 'rejected'

            if (summariesFailed && activityFailed) {
                setActivityError('Could not load your activity.')
            } else {
                setActivityError(null)
            }

            setLoading(false)
        }

        loadActivity()

        return () => {
            cancelled = true
        }
    }, [workspaceId, refreshToken])

    // New channel messages that mention the user refresh the mention list.
    useEffect(() => {
        const socket = getSocket()

        if (!socket || !currentUser.username) {
            return
        }

        const mentionPattern = new RegExp(`@${escapeRegExp(currentUser.username)}\\b`, 'i')

        function handleMessageCreated(payload) {
            const message = payload?.message

            if (
                message?.message_type === 'channel' &&
                mentionPattern.test(message.content || '')
            ) {
                setRefreshToken((token) => token + 1)
            }
        }

        function handleMessageDeleted(payload) {
            if (payload?.message?.message_type === 'channel') {
                setRefreshToken((token) => token + 1)
            }
        }

        socket.on('message:created', handleMessageCreated)
        socket.on('message:deleted', handleMessageDeleted)

        return () => {
            socket.off('message:created', handleMessageCreated)
            socket.off('message:deleted', handleMessageDeleted)
        }
    }, [currentUser.username])

    const dmItems = directMessages
        .map((dm) => {
            const summary = summaries[String(dm.id)] || null
            const unread = Number(unreadByConversation[dm.id] || 0)

            if (showUnreadOnly && !unread) {
                return null
            }

            if (!showUnreadOnly && !summary) {
                return null
            }

            const isOwnMessage = Boolean(summary) && String(
                summary.sender_id?._id ?? summary.sender_id ?? ''
            ) === String(currentUser.id)

            return {
                id: `dm-${dm.id}`,
                createdAt: summary?.created_at || null,
                actorName: dm.username,
                actorPhoto: dm.photo,
                action: 'sent you a message',
                snippet: summary
                    ? (isOwnMessage ? `You: ${summary.content}` : summary.content)
                    : 'Open the conversation to read it.',
                unread,
                onClick: () => selectDm(dm.id)
            }
        })
        .filter(Boolean)

    const mentionItems = mentions
        .filter((mention) => mention.channel)
        .filter((mention) => !showUnreadOnly || mention.is_new)
        .map((mention) => ({
            id: `mention-${mention.id}`,
            createdAt: mention.created_at,
            actorName: mention.sender?.name || 'Someone',
            actorPhoto: mention.sender?.photo || null,
            action: `mentioned you in #${mention.channel.name}`,
            snippet: mention.content,
            unread: 0,
            isNew: Boolean(mention.is_new),
            onClick: () => selectChannel(mention.channel.id)
        }))

    const items = [...dmItems, ...mentionItems].sort((first, second) => {
        const firstTime = first.createdAt ? new Date(first.createdAt).getTime() : 0
        const secondTime = second.createdAt ? new Date(second.createdAt).getTime() : 0

        return secondTime - firstTime
    })

    const showEmptyState = !loading && !activityError && items.length === 0

    return (
        <main className='activity-view' aria-label='Activity'>
            {/* Header */}
            <header className='activity-view__header'>
                <h1 className='activity-view__title'>Activity</h1>

                <button
                    type='button'
                    className='activity-view__toggle'
                    role='switch'
                    aria-checked={showUnreadOnly}
                    onClick={() => setShowUnreadOnly((current) => !current)}
                >
                    <span>Unread messages</span>
                    <span
                        className={`activity-view__toggle-track${showUnreadOnly ? ' activity-view__toggle-track--on' : ''}`}
                        aria-hidden='true'
                    >
                        <span className='activity-view__toggle-thumb' />
                    </span>
                </button>
            </header>

            <div className='activity-view__body'>
                {loading && (
                    <p className='activity-view__notice'>Loading activity…</p>
                )}

                {!loading && activityError && (
                    <p className='activity-view__notice activity-view__notice--error' role='alert'>
                        {activityError}
                    </p>
                )}

                {showEmptyState && (
                    <div className='activity-view__empty'>
                        <span className='activity-view__empty-icon' aria-hidden='true'>
                            <IconCheck size={24} />
                        </span>
                        <h2 className='activity-view__empty-title'>All caught up</h2>
                        <p className='activity-view__empty-text'>
                            Looks like things are quiet for now. When there&apos;s new activity, it&apos;ll be here.
                        </p>
                    </div>
                )}

                {items.length > 0 && (
                    <ul className='activity-view__list'>
                        {items.map((item) => (
                            <li key={item.id}>
                                <button
                                    type='button'
                                    className='activity-view__row'
                                    onClick={item.onClick}
                                >
                                    <span className='activity-view__avatar'>
                                        {item.actorPhoto ? (
                                            <img
                                                className='activity-view__avatar-image'
                                                src={item.actorPhoto}
                                                alt=''
                                            />
                                        ) : (
                                            getInitials(item.actorName)
                                        )}
                                    </span>

                                    <span className='activity-view__content'>
                                        <span className='activity-view__headline'>
                                            <strong className='activity-view__actor'>
                                                {item.actorName}
                                            </strong>
                                            {' '}
                                            <span className='activity-view__action'>
                                                {item.action}
                                            </span>
                                        </span>
                                        <span className='activity-view__snippet'>
                                            {item.snippet}
                                        </span>
                                    </span>

                                    <span className='activity-view__meta'>
                                        {item.createdAt && (
                                            <span className='activity-view__time'>
                                                {formatConversationTimestamp(item.createdAt)}
                                            </span>
                                        )}
                                        {item.unread > 0 && (
                                            <span className='activity-view__badge'>
                                                {item.unread > 99 ? '99+' : item.unread}
                                            </span>
                                        )}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    )
}

export default ActivityView
