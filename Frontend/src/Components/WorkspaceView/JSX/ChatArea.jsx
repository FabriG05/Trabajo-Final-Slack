import React, { useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import useWorkspaceMemberCount from '../../../Hooks/useWorkspaceMemberCount'
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
    IconDMs
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
        typingUsers,
        notifyTyping,
        currentUser,
        workspaceId
    } = useWorkspace()
    const { memberCount } = useWorkspaceMemberCount(workspaceId)
    const [composerText, setComposerText] = useState('')
    const [activeTab, setActiveTab] = useState('messages')

    const displayName = activeDm ? `@${activeDm.username}` : `#${activeChannel?.name || 'channel'}`

    async function handleSend() {
        if (!composerText.trim()) {
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
            <div className='chat-messages'>
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

                {/* Date separator */}
                <div className='chat-date-separator'>
                    <button type='button' className='chat-date-separator__pill'>
                        <span>Sunday, 15 November</span>
                        <IconChevronDown size={11} />
                    </button>
                </div>

                {/* Message list */}
                <div className='chat-messages__list'>
                    {loadingMessages && messages.length === 0 && (
                        <p className='chat-messages__empty'>Loading messages…</p>
                    )}
                    {messages.map((msg) => {
                        if (msg.type === 'system') {
                            return (
                                <div key={msg.id} className='chat-message chat-message--system'>
                                    <span className='chat-message__system-icon'>
                                        <IconUser size={14} />
                                    </span>
                                    <span className='chat-message__system-text'>
                                        <strong>{msg.user}</strong> {msg.text}
                                    </span>
                                    <span className='chat-message__time'>{msg.time}</span>
                                </div>
                            )
                        }

                        return (
                            <div key={msg.id} className='chat-message chat-message--user'>
                                <div className='chat-message__avatar'>
                                    {msg.user.slice(0, 2).toUpperCase()}
                                </div>
                                <div className='chat-message__body'>
                                    <div className='chat-message__meta'>
                                        <span className='chat-message__author'>{msg.user}</span>
                                        <span className='chat-message__time'>{msg.time}</span>
                                    </div>
                                    <p className='chat-message__content'>{msg.text}</p>
                                </div>
                            </div>
                        )
                    })}
                    {messageError && (
                        <p className='chat-messages__empty' role='alert'>{messageError}</p>
                    )}
                </div>
            </div>

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
                        placeholder={`Message ${displayName}`}
                        rows={2}
                        value={composerText}
                        onChange={handleComposerChange}
                        onKeyDown={handleKeyDown}
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
                                className={`chat-composer__send-btn${composerText.trim() ? ' chat-composer__send-btn--active' : ''}`}
                                onClick={handleSend}
                                disabled={!composerText.trim()}
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
