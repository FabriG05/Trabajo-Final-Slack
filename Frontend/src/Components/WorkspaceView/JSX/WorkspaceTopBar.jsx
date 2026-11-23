import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { IconHistory, IconSearch, IconSparkle, IconHelp } from './SlackIcons'
import '../CSS/WorkspaceTopBar.css'

function getHistoryLabel(entry, channels, directMessages) {
    if (!entry) {
        return 'Unknown'
    }

    if (entry.navTab === 'starred') return 'Starred messages'
    if (entry.navTab === 'activity') return 'Activity'
    if (entry.navTab === 'directory') return 'Directories'
    if (entry.navTab === 'dms' && !entry.dmId) return 'Direct messages'

    if (entry.dmId) {
        const dm = directMessages.find((item) => String(item.id) === String(entry.dmId))
        return dm ? `DM: ${dm.username}` : 'Direct message'
    }

    if (entry.channelId) {
        const channel = channels.find((item) => String(item.id) === String(entry.channelId))
        return channel ? `#${channel.name}` : 'Channel'
    }

    return 'Home'
}

function WorkspaceTopBar() {
    const {
        searchQuery,
        setSearchQuery,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
        navHistory,
        goToHistoryIndex,
        channels,
        directMessages
    } = useWorkspace()
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const historyRef = useRef(null)

    useEffect(() => {
        function handlePointerDown(event) {
            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setIsHistoryOpen(false)
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsHistoryOpen(false)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    const entries = navHistory?.entries || []
    const activeIndex = navHistory?.index ?? -1

    return (
        <header className='workspace-topbar'>
            <div className='workspace-topbar__history'>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='Back'
                    title='Back'
                    onClick={goBack}
                    disabled={!canGoBack}
                >
                    ‹
                </button>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='Forward'
                    title='Forward'
                    onClick={goForward}
                    disabled={!canGoForward}
                >
                    ›
                </button>
                <div className='workspace-topbar__history-menu-wrapper' ref={historyRef}>
                    <button
                        type='button'
                        className='workspace-topbar__btn'
                        aria-label='History'
                        title='History'
                        onClick={() => setIsHistoryOpen((open) => !open)}
                    >
                        <IconHistory size={16} />
                    </button>
                    {isHistoryOpen && (
                        <div className='workspace-topbar__history-menu' role='menu' aria-label='Navigation history'>
                            <p className='workspace-topbar__history-title'>History</p>
                            {entries.length === 0 ? (
                                <p className='workspace-topbar__history-empty'>No history yet</p>
                            ) : (
                                <ul className='workspace-topbar__history-list'>
                                    {[...entries].map((entry, index) => ({ entry, index })).reverse().map(({ entry, index }) => (
                                        <li key={`${index}-${entry.navTab}-${entry.channelId || ''}-${entry.dmId || ''}`}>
                                            <button
                                                type='button'
                                                className={`workspace-topbar__history-item${index === activeIndex ? ' workspace-topbar__history-item--active' : ''}`}
                                                onClick={() => {
                                                    goToHistoryIndex(index)
                                                    setIsHistoryOpen(false)
                                                }}
                                            >
                                                {getHistoryLabel(entry, channels, directMessages)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className='workspace-topbar__search-container'>
                <div className='workspace-topbar__search'>
                    <span className='workspace-topbar__search-icon' aria-hidden='true'>
                        <IconSearch size={14} />
                    </span>
                    <input
                        type='text'
                        className='workspace-topbar__search-input'
                        placeholder='Describe what you are looking for'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <span className='workspace-topbar__search-sparkle' aria-hidden='true'>
                        <IconSparkle size={14} />
                    </span>
                </div>
            </div>

            <div className='workspace-topbar__help'>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='Help'
                    title='Help'
                >
                    <IconHelp size={16} />
                </button>
            </div>
        </header>
    )
}

export default WorkspaceTopBar
