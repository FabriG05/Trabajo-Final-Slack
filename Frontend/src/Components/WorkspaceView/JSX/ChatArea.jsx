import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import useWorkspaceMemberCount from '../../../Hooks/useWorkspaceMemberCount'
import { formatDayLabel, getDayKey } from '../../../Utils/formatDate'
import {
    IconStar,
    IconMembers,
    IconHuddle,
    IconFiles,
    IconBell,
    IconSearch,
    IconMore,
    IconSend,
    IconUser,
    IconChevronDown,
    IconDMs,
    IconTrash
} from './SlackIcons'
import '../CSS/ChatArea.css'

/*
    ChatArea: main conversation panel for the active channel or direct message.
    Composed of ChatHeader, ChatMessages (with empty/welcome state cards),
    and ChatComposer.
*/

/* Human readable typing indicator: one, two or several people. */
function formatTypingNames(names) {
    const uniqueNames = [...new Set(names)]

    if (uniqueNames.length === 1) {
        return `${uniqueNames[0]} is typing…`
    }

    if (uniqueNames.length === 2) {
        return `${uniqueNames[0]} and ${uniqueNames[1]} are typing…`
    }

    return 'Several people are typing…'
}

function ChatArea() {
    const {
        activeChannel,
        activeDm,
        messages,
        loadingMessages,
        messageError,
        sendMessage,
        deleteMessage,
        canDeleteAnyMessage,
        typingUsers,
        notifyTyping,
        currentUser,
        workspaceId
    } = useWorkspace()
    const { memberCount } = useWorkspaceMemberCount(workspaceId)
    const [composerText, setComposerText] = useState('')
    const [activeTab, setActiveTab] = useState('messages')
    const [deletingMessageId, setDeletingMessageId] = useState(null)
    const [collapsedDays, setCollapsedDays] = useState({})

    // Auto-scroll state: the feed sticks to the bottom unless the user
    // scrolled up to read older messages.
    const messagesContainerRef = useRef(null)
    const [showJumpToLatest, setShowJumpToLatest] = useState(false)
    const stickToBottomRef = useRef(true)
    const previousConversationRef = useRef(null)
    const previousCountRef = useRef(0)

    const conversationKey = activeDm?.id || activeChannel?.id || null
    const isConversationOpen = Boolean(activeDm || activeChannel)
    const displayName = activeDm ? `@${activeDm.username}` : `#${activeChannel?.name || 'channel'}`

    const scrollToBottom = useCallback((behavior = 'auto') => {
        const container = messagesContainerRef.current

        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior })
        }
    }, [])

    /*
        When the conversation changes, start at the bottom and forget any
        pending "jump to latest" notice from the previous channel.
    */
    useEffect(() => {
        stickToBottomRef.current = true

        const frame = requestAnimationFrame(() => {
            setShowJumpToLatest(false)
            setDeletingMessageId(null)
            setCollapsedDays({})
            scrollToBottom('auto')
        })

        return () => cancelAnimationFrame(frame)
    }, [conversationKey, scrollToBottom])

    /*
        Follow new messages: always when they are yours, and when the user
        is already near the bottom. If they scrolled up, keep the position
        and offer the floating "Jump to latest" button instead.
    */
    useEffect(() => {
        const isNewConversation = previousConversationRef.current !== conversationKey

        if (isNewConversation) {
            previousConversationRef.current = conversationKey
            previousCountRef.current = messages.length
            stickToBottomRef.current = true
            setShowJumpToLatest(false)
            return
        }

        if (messages.length === previousCountRef.current) {
            return
        }

        const grew = messages.length > previousCountRef.current
        previousCountRef.current = messages.length

        if (!grew) {
            return
        }

        const lastMessage = messages[messages.length - 1]
        const isOwnMessage = String(lastMessage?.senderId || '') === String(currentUser.id)

        if (isOwnMessage || stickToBottomRef.current) {
            scrollToBottom('smooth')
            setShowJumpToLatest(false)
        } else {
            setShowJumpToLatest(true)
        }
    }, [messages, conversationKey, currentUser.id, scrollToBottom])

    function handleMessagesScroll() {
        const container = messagesContainerRef.current

        if (!container) {
            return
        }

        const distanceToBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight
        const isNearBottom = distanceToBottom < 80

        stickToBottomRef.current = isNearBottom

        if (isNearBottom) {
            setShowJumpToLatest(false)
        }
    }

    function handleJumpToLatest() {
        stickToBottomRef.current = true
        setShowJumpToLatest(false)
        scrollToBottom('smooth')
    }

    function toggleDay(dayKey) {
        setCollapsedDays((previous) => ({
            ...previous,
            [dayKey]: !previous[dayKey]
        }))
    }

    function canDeleteMessage(message) {
        if (!message?.senderId) {
            return false
        }

        return canDeleteAnyMessage
            || String(message.senderId) === String(currentUser.id)
    }

    async function handleDeleteMessage(messageId) {
        if (deletingMessageId) {
            return
        }

        setDeletingMessageId(messageId)
        await deleteMessage(messageId)
        setDeletingMessageId(null)
    }

    async function handleSend() {
        if (!composerText.trim() || !isConversationOpen) {
            return
        }

        // The input is only cleared once the server stored the message.
        const sent = await sendMessage(composerText)

        if (sent) {
            setComposerText('')
        }
    }

    function handleComposerChange(event) {
        setComposerText(event.target.value)

        if (event.target.value) {
            notifyTyping()
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <main className='chat-area' aria-label={`Conversation: ${displayName}`}>
            {/* Header: Title, Tabs and Channel actions */}
            <header className='chat-header'>
                <div className='chat-header__top'>
                    <div className='chat-header__title-group'>
                        <button type='button' className='chat-header__star-btn' title='Star'>
                            <IconStar size={16} />
                        </button>
                        <h1 className='chat-header__title'>{displayName}</h1>
                    </div>

                    <div className='chat-header__actions'>
                        <button type='button' className='chat-header__members-btn' title='Members'>
                            <IconMembers size={15} />
                            <span>{memberCount}</span>
                        </button>
                        <button type='button' className='chat-header__huddle-btn'>
                            <IconHuddle size={15} />
                            <span>Huddle</span>
                            <IconChevronDown size={10} className='chat-header__caret' />
                        </button>
                        <button type='button' className='chat-header__icon-btn' title='Canvas'>
                            <IconFiles size={15} />
                        </button>
                        <button type='button' className='chat-header__icon-btn' title='Notifications'>
                            <IconBell size={15} />
                        </button>
                        <button type='button' className='chat-header__icon-btn' title='Search in conversation'>
                            <IconSearch size={15} />
                        </button>
                        <button type='button' className='chat-header__icon-btn' title='More options'>
                            <IconMore size={16} />
                        </button>
                    </div>
                </div>

                <div className='chat-header__tabs'>
                    <button
                        type='button'
                        className={`chat-header__tab${activeTab === 'messages' ? ' chat-header__tab--active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <IconDMs size={14} />
                        <span>Messages</span>
                    </button>
                    <button
                        type='button'
                        className={`chat-header__tab${activeTab === 'canvas' ? ' chat-header__tab--active' : ''}`}
                        onClick={() => setActiveTab('canvas')}
                    >
                        <IconFiles size={14} />
                        <span>Add canvas</span>
                    </button>
                    <button
                        type='button'
                        className='chat-header__tab-add'
                        title='Add tab'
                    >
                        +
                    </button>
                </div>
            </header>

            {/* Scrollable conversation message feed */}
            <div
                className='chat-messages'
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
            >
                {!isConversationOpen ? (
                    <div className='chat-empty'>
                        <h2 className='chat-empty__title'>No conversation selected</h2>
                        <p className='chat-empty__text'>
                            Choose a channel or a direct message to start talking.
                        </p>
                    </div>
                ) : (
                    <>
                {/* Welcome banner with Slack template cards */}
                <div className='chat-welcome'>
                    <h2 className='chat-welcome__title'>
                        👋 Welcome to your first channel, {currentUser.username}!
                    </h2>
                    <p className='chat-welcome__subtitle'>
                        Channels in Slack keep work focused around a specific topic. You can keep all your
                        information-related projects attached to the channel so that everyone can access.
                    </p>

                    <div className='chat-welcome__cards'>
                        <div className='chat-welcome__card chat-welcome__card--template'>
                            <div className='chat-welcome__card-header'>
                                <p className='chat-welcome__card-title'>Start from a template</p>
                                <p className='chat-welcome__card-desc'>Browse channel templates</p>
                            </div>
                            <div className='chat-welcome__card-graphic chat-welcome__card-graphic--template'>
                                <div className='chat-welcome__mini-sheet'>
                                    <span className='chat-welcome__check'>✓</span>
                                    <div className='chat-welcome__lines'>
                                        <div className='chat-welcome__line' />
                                        <div className='chat-welcome__line' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='chat-welcome__card chat-welcome__card--apps'>
                            <div className='chat-welcome__card-header'>
                                <p className='chat-welcome__card-title'>Connect your apps</p>
                                <p className='chat-welcome__card-desc'>Bring your work into Slack</p>
                            </div>
                            <div className='chat-welcome__card-graphic chat-welcome__card-graphic--apps'>
                                <div className='chat-welcome__mini-isometric'>
                                    <span className='chat-welcome__app-badge'>📊</span>
                                    <span className='chat-welcome__app-badge'>📁</span>
                                </div>
                            </div>
                        </div>

                        <div className='chat-welcome__card chat-welcome__card--invite'>
                            <div className='chat-welcome__card-header'>
                                <p className='chat-welcome__card-title'>Invite teammates</p>
                                <p className='chat-welcome__card-desc'>Add your whole team</p>
                            </div>
                            <div className='chat-welcome__card-graphic chat-welcome__card-graphic--invite'>
                                <div className='chat-welcome__mini-avatars'>
                                    <span className='chat-welcome__avatar'>👩</span>
                                    <span className='chat-welcome__avatar'>👨</span>
                                    <span className='chat-welcome__avatar'>🧑</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Message list with one date separator per day */}
                <div className='chat-messages__list'>
                    {loadingMessages && messages.length === 0 && (
                        <p className='chat-messages__empty'>Loading messages…</p>
                    )}
                    {messages.map((msg, index) => {
                        const dayKey = getDayKey(msg.createdAt)
                        const dayLabel = formatDayLabel(msg.createdAt)
                        const previousDayLabel = index > 0
                            ? formatDayLabel(messages[index - 1].createdAt)
                            : null
                        const showDaySeparator = Boolean(dayLabel) && dayLabel !== previousDayLabel
                        const isCollapsed = Boolean(dayKey && collapsedDays[dayKey])

                        const messageContent = msg.type === 'system' ? (
                            <div key={msg.id} className='chat-message chat-message--system'>
                                <span className='chat-message__system-icon'>
                                    <IconUser size={14} />
                                </span>
                                <span className='chat-message__system-text'>
                                    <strong>{msg.user}</strong> {msg.text}
                                </span>
                                <span className='chat-message__time'>{msg.time}</span>
                            </div>
                        ) : (
                            <div key={msg.id} className='chat-message chat-message--user'>
                                <div className='chat-message__avatar'>
                                    {String(msg.senderId) === String(currentUser.id) && currentUser.photo ? (
                                        <img
                                            className='chat-message__avatar-image'
                                            src={currentUser.photo}
                                            alt=''
                                        />
                                    ) : (
                                        msg.user.slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div className='chat-message__body'>
                                    <div className='chat-message__meta'>
                                        <span className='chat-message__author'>{msg.user}</span>
                                        <span className='chat-message__time'>{msg.time}</span>
                                    </div>
                                    <p className='chat-message__content'>{msg.text}</p>
                                </div>
                                {canDeleteMessage(msg) && (
                                    <button
                                        type='button'
                                        className='chat-message__delete'
                                        title='Delete message'
                                        aria-label='Delete message'
                                        onClick={() => handleDeleteMessage(msg.id)}
                                        disabled={String(deletingMessageId) === String(msg.id)}
                                    >
                                        <IconTrash size={14} />
                                    </button>
                                )}
                            </div>
                        )

                        return (
                            <React.Fragment key={msg.id}>
                                {showDaySeparator && (
                                    <div className='chat-date-separator'>
                                        <button
                                            type='button'
                                            className='chat-date-separator__pill'
                                            onClick={() => dayKey && toggleDay(dayKey)}
                                            aria-expanded={!isCollapsed}
                                            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${dayLabel} messages`}
                                        >
                                            <span>{dayLabel}</span>
                                            <IconChevronDown
                                                size={11}
                                                className={`chat-date-separator__chevron${isCollapsed ? ' chat-date-separator__chevron--collapsed' : ''}`}
                                            />
                                        </button>
                                    </div>
                                )}
                                {!isCollapsed && messageContent}
                            </React.Fragment>
                        )
                    })}
                    {messageError && (
                        <p className='chat-messages__empty' role='alert'>{messageError}</p>
                    )}
                </div>
                    </>
                )}
            </div>

            {showJumpToLatest && (
                <div className='chat-jump-latest'>
                    <button
                        type='button'
                        className='chat-jump-latest__btn'
                        onClick={handleJumpToLatest}
                    >
                        Jump to latest
                    </button>
                </div>
            )}

            {typingUsers.length > 0 && (
                <div className='chat-typing' aria-live='polite'>
                    <span className='chat-typing__dots' aria-hidden='true'>•••</span>
                    <span>{formatTypingNames(typingUsers)}</span>
                </div>
            )}

            {/* Message composer box */}
            <div className='chat-composer'>
                <div className='chat-composer__box'>
                    {/* Formatting bar */}
                    <div className='chat-composer__toolbar'>
                        <button type='button' className='chat-composer__tool' title='Bold'><b>B</b></button>
                        <button type='button' className='chat-composer__tool' title='Italic'><i>I</i></button>
                        <button type='button' className='chat-composer__tool' title='Strikethrough'><s>S</s></button>
                        <span className='chat-composer__separator' />
                        <button type='button' className='chat-composer__tool' title='Link'>🔗</button>
                        <button type='button' className='chat-composer__tool' title='Bullet list'>•</button>
                        <button type='button' className='chat-composer__tool' title='Numbered list'>1.</button>
                        <span className='chat-composer__separator' />
                        <button type='button' className='chat-composer__tool' title='Code'>&lt;/&gt;</button>
                    </div>

                    {/* Text area */}
                    <textarea
                        className='chat-composer__input'
                        placeholder={isConversationOpen ? `Message ${displayName}` : 'Select a conversation to write'}
                        rows={2}
                        value={composerText}
                        onChange={handleComposerChange}
                        onKeyDown={handleKeyDown}
                        disabled={!isConversationOpen}
                    />

                    {/* Action utilities & Send button */}
                    <div className='chat-composer__footer'>
                        <div className='chat-composer__actions-left'>
                            <button type='button' className='chat-composer__action-btn' title='Add attachment'>+</button>
                            <button type='button' className='chat-composer__action-btn' title='Format'>Aa</button>
                            <button type='button' className='chat-composer__action-btn' title='Emoji'>☺</button>
                            <button type='button' className='chat-composer__action-btn' title='Mention'>@</button>
                            <button type='button' className='chat-composer__action-btn' title='Record video'>📹</button>
                            <button type='button' className='chat-composer__action-btn' title='Record audio'>🎤</button>
                        </div>

                        <div className='chat-composer__actions-right'>
                            <button
                                type='button'
                                className={`chat-composer__send-btn${composerText.trim() && isConversationOpen ? ' chat-composer__send-btn--active' : ''}`}
                                onClick={handleSend}
                                disabled={!composerText.trim() || !isConversationOpen}
                                aria-label='Send message'
                            >
                                <IconSend size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default ChatArea
