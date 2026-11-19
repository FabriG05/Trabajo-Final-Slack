import React from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { IconHistory, IconSearch, IconSparkle, IconHelp } from './SlackIcons'
import '../CSS/WorkspaceTopBar.css'

/*
    WorkspaceTopBar: global top header with history navigation (<, >),
    centered search input, and help shortcut.
*/
function WorkspaceTopBar() {
    const { searchQuery, setSearchQuery } = useWorkspace()

    return (
        <header className='workspace-topbar'>
            <div className='workspace-topbar__history'>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='Back'
                    title='Back'
                >
                    ‹
                </button>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='Forward'
                    title='Forward'
                >
                    ›
                </button>
                <button
                    type='button'
                    className='workspace-topbar__btn'
                    aria-label='History'
                    title='History'
                >
                    <IconHistory size={16} />
                </button>
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
