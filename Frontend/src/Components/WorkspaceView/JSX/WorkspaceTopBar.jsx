import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { searchWorkspace } from '../../../Services/WorkSpaceService'
import { IconHistory, IconSearch, IconSparkle } from './SlackIcons'
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
        workspaceId,
        goBack,
        goForward,
        canGoBack,
        canGoForward,
        navHistory,
        goToHistoryIndex,
        channels,
        directMessages,
        selectChannel,
        selectDm
    } = useWorkspace()
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState({ channels: [], members: [], messages: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchError, setSearchError] = useState(null)
    const historyRef = useRef(null)
    const searchRef = useRef(null)

    useEffect(() => {
        function handlePointerDown(event) {
            if (historyRef.current && !historyRef.current.contains(event.target)) {
                setIsHistoryOpen(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false)
            }
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsHistoryOpen(false)
                setIsSearchOpen(false)
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    useEffect(() => {
        const query = searchTerm.trim()

        if (query.length < 2) {
            setSearchResults({ channels: [], members: [], messages: [] })
            setSearchError(null)
            setIsSearching(false)
            return undefined
        }

        let cancelled = false
        setIsSearching(true)
        setSearchError(null)

        const timeoutId = setTimeout(async () => {
            try {
                const response = await searchWorkspace(workspaceId, query)
                if (cancelled) return
                setSearchResults(response?.data || { channels: [], members: [], messages: [] })
            } catch (error) {
                if (cancelled) return
                setSearchError(error.message || 'Could not search workspace.')
                setSearchResults({ channels: [], members: [], messages: [] })
            } finally {
                if (!cancelled) setIsSearching(false)
            }
        }, 300)

        return () => {
            cancelled = true
            clearTimeout(timeoutId)
        }
    }, [searchTerm, workspaceId])

    const entries = navHistory?.entries || []
    const activeIndex = navHistory?.index ?? -1
    const hasResults = searchResults.channels.length > 0 || searchResults.members.length > 0 || searchResults.messages.length > 0
    const showSearchPanel = isSearchOpen && searchTerm.trim().length >= 2

    function closeSearch() {
        setIsSearchOpen(false)
    }

    function handleSelectChannel(channelId) {
        selectChannel(channelId)
        setSearchTerm('')
        closeSearch()
    }

    function handleSelectMember(userId) {
        selectDm(userId)
        setSearchTerm('')
        closeSearch()
    }

    function handleSelectMessage(message) {
        if (message.message_type === 'direct' && message.dm?.user_id) {
            selectDm(message.dm.user_id)
        } else if (message.channel?.id) {
            selectChannel(message.channel.id)
        }
        setSearchTerm('')
        closeSearch()
    }

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

            <div className='workspace-topbar__search-container' ref={searchRef}>
                <div className='workspace-topbar__search'>
                    <span className='workspace-topbar__search-icon' aria-hidden='true'>
                        <IconSearch size={14} />
                    </span>
                    <input
                        type='text'
                        className='workspace-topbar__search-input'
                        placeholder='Search channels, people, or messages'
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setIsSearchOpen(true)
                        }}
                        onFocus={() => setIsSearchOpen(true)}
                    />
                    <span className='workspace-topbar__search-sparkle' aria-hidden='true'>
                        <IconSparkle size={14} />
                    </span>
                </div>

                {showSearchPanel && (
                    <div className='workspace-topbar__search-panel' role='dialog' aria-label='Search results'>
                        {isSearching && <p className='workspace-topbar__search-status'>Searching...</p>}
                        {!isSearching && searchError && <p className='workspace-topbar__search-status workspace-topbar__search-status--error'>{searchError}</p>}
                        {!isSearching && !searchError && !hasResults && <p className='workspace-topbar__search-status'>No results found</p>}

                        {!isSearching && !searchError && searchResults.channels.length > 0 && (
                            <div className='workspace-topbar__search-group'>
                                <p className='workspace-topbar__search-group-title'>Channels</p>
                                <ul className='workspace-topbar__search-list'>
                                    {searchResults.channels.map((channel) => (
                                        <li key={`channel-${channel.id}`}>
                                            <button type='button' className='workspace-topbar__search-item' onClick={() => handleSelectChannel(channel.id)}>
                                                <span className='workspace-topbar__search-item-title'>#{channel.name}</span>
                                                <span className='workspace-topbar__search-item-meta'>Channel</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!isSearching && !searchError && searchResults.members.length > 0 && (
                            <div className='workspace-topbar__search-group'>
                                <p className='workspace-topbar__search-group-title'>People</p>
                                <ul className='workspace-topbar__search-list'>
                                    {searchResults.members.map((member) => (
                                        <li key={`member-${member.id}`}>
                                            <button type='button' className='workspace-topbar__search-item' onClick={() => handleSelectMember(member.id)}>
                                                <span className='workspace-topbar__search-item-title'>{member.name}</span>
                                                <span className='workspace-topbar__search-item-meta'>{member.email || member.role}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!isSearching && !searchError && searchResults.messages.length > 0 && (
                            <div className='workspace-topbar__search-group'>
                                <p className='workspace-topbar__search-group-title'>Messages</p>
                                <ul className='workspace-topbar__search-list'>
                                    {searchResults.messages.map((message) => (
                                        <li key={`message-${message.id}`}>
                                            <button type='button' className='workspace-topbar__search-item workspace-topbar__search-item--message' onClick={() => handleSelectMessage(message)}>
                                                <span className='workspace-topbar__search-item-title'>
                                                    {message.message_type === 'direct'
                                                        ? `DM: ${message.dm?.name || 'Direct message'}`
                                                        : `#${message.channel?.name || 'channel'}`}
                                                </span>
                                                <span className='workspace-topbar__search-item-snippet'>{message.sender?.name}: {message.content}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className='workspace-topbar__spacer' aria-hidden='true' />
        </header>
    )
}

export default WorkspaceTopBar
