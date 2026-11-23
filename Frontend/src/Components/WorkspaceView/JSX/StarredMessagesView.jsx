import React from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { formatConversationTimestamp } from '../../../Utils/formatDate'
import { IconStar } from './SlackIcons'
import '../CSS/StarredMessagesView.css'

function getMessagePreview(message) {
    if (message?.content) {
        return message.content
    }

    if (message?.attachment?.name) {
        return `Attachment: ${message.attachment.name}`
    }

    return 'Message'
}

function StarredMessagesView() {
    const {
        starredMessages,
        loadingStarred,
        currentUser,
        selectChannel,
        selectDm,
        toggleStarMessage
    } = useWorkspace()

    return (
        <main className='starred-view' aria-label='Starred messages'>
            <header className='starred-view__header'>
                <div className='starred-view__title'>
                    <IconStar size={16} />
                    <h2>Starred messages</h2>
                </div>
                <p className='starred-view__subtitle'>Messages you saved from channels and direct messages.</p>
            </header>

            <div className='starred-view__body'>
                {loadingStarred && <p className='starred-view__notice'>Loading starred messages…</p>}
                {!loadingStarred && starredMessages.length === 0 && (
                    <p className='starred-view__notice'>No starred messages yet. Star any message to save it here.</p>
                )}

                <ul className='starred-view__list'>
                    {starredMessages.map((item) => {
                        const message = item?.message_id
                        if (!message?._id) {
                            return null
                        }

                        const sender = message.sender_id
                        const channel = message.channel_id
                        const isDirect = message.message_type === 'direct'
                        const currentUserId = String(currentUser.id || '')
                        const senderId = String(sender?._id || sender || '')
                        const receiverId = String(message.receiver_id?._id || message.receiver_id || '')
                        const dmPartnerId = senderId === currentUserId ? receiverId : senderId
                        const dmPartnerName = senderId === currentUserId
                            ? (message.receiver_id?.name || message.receiver_id?.email || 'Direct message')
                            : (sender?.name || sender?.email || 'Direct message')
                        const originLabel = isDirect ? `DM: ${dmPartnerName}` : `#${channel?.name || 'channel'}`
                        const author = sender?.name || sender?.email || 'Unknown user'

                        return (
                            <li key={String(item._id || message._id)} className='starred-view__item'>
                                <button
                                    type='button'
                                    className='starred-view__open'
                                    onClick={() => {
                                        if (isDirect && dmPartnerId) {
                                            selectDm(dmPartnerId)
                                        } else if (channel?._id) {
                                            selectChannel(channel._id)
                                        }
                                    }}
                                >
                                    <div className='starred-view__meta'>
                                        <span className='starred-view__origin'>{originLabel}</span>
                                        <span className='starred-view__time'>{formatConversationTimestamp(message.created_at)}</span>
                                    </div>
                                    <div className='starred-view__author'>{author}</div>
                                    <div className='starred-view__preview'>{getMessagePreview(message)}</div>
                                </button>
                                <button
                                    type='button'
                                    className='starred-view__unstar'
                                    title='Unstar message'
                                    aria-label='Unstar message'
                                    onClick={() => toggleStarMessage(message._id)}
                                >
                                    <IconStar size={14} />
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </main>
    )
}

export default StarredMessagesView
