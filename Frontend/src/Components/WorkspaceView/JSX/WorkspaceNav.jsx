import React from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import {
    IconHome,
    IconDMs,
    IconActivity,
    IconFiles,
    IconAgents,
    IconAdmin,
    IconMoon,
    IconUser
} from './SlackIcons'
import '../CSS/WorkspaceNav.css'

/*
    WorkspaceNav: slim vertical left navigation bar (approx 65px wide).
    Displays the active workspace icon, primary section shortcuts
    (Home, DMs, Activity, Files, Agents, Admin), and bottom utilities
    (Add, Theme toggle, User Profile).
*/
const NAV_ITEMS = [
    { id: 'home', label: 'Home', Icon: IconHome },
    { id: 'dms', label: 'DMs', Icon: IconDMs },
    { id: 'activity', label: 'Activity', Icon: IconActivity },
    { id: 'files', label: 'Files', Icon: IconFiles },
    { id: 'agents', label: 'Agents & tools', Icon: IconAgents },
    { id: 'divider', isDivider: true },
    { id: 'admin', label: 'Admin', Icon: IconAdmin, badge: true }
]

function WorkspaceNav() {
    const { activeNavTab, setActiveNavTab, workspace, currentUser } = useWorkspace()

    // Workspace badge abbreviation (e.g. "NW" for "New Workspace")
    const workspaceInitials = (workspace?.name || 'NW')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    return (
        <nav className='workspace-nav' aria-label='Primary workspace navigation'>
            {/* Top workspace avatar */}
            <div className='workspace-nav__top'>
                <button
                    type='button'
                    className='workspace-nav__workspace-badge'
                    title={workspace?.name || 'Workspace'}
                >
                    {workspaceInitials}
                </button>
            </div>

            {/* Navigation links */}
            <ul className='workspace-nav__list'>
                {NAV_ITEMS.map((item) => {
                    if (item.isDivider) {
                        return <li key={item.id} className='workspace-nav__divider' />
                    }

                    const isActive = activeNavTab === item.id
                    const IconComponent = item.Icon

                    return (
                        <li key={item.id} className='workspace-nav__item'>
                            <button
                                type='button'
                                className={`workspace-nav__btn${isActive ? ' workspace-nav__btn--active' : ''}`}
                                onClick={() => setActiveNavTab(item.id)}
                                aria-label={item.label}
                                title={item.label}
                            >
                                <span className='workspace-nav__icon-wrapper'>
                                    <IconComponent size={20} className='workspace-nav__icon' />
                                    {item.badge && <span className='workspace-nav__dot' />}
                                </span>
                                <span className='workspace-nav__label'>{item.label}</span>
                            </button>
                        </li>
                    )
                })}
            </ul>

            {/* Bottom utility icons */}
            <div className='workspace-nav__bottom'>
                <button
                    type='button'
                    className='workspace-nav__util-btn'
                    aria-label='Add more'
                    title='Add'
                >
                    +
                </button>
                <button
                    type='button'
                    className='workspace-nav__util-btn'
                    aria-label='Toggle theme'
                    title='Theme'
                >
                    <IconMoon size={18} />
                </button>
                <button
                    type='button'
                    className='workspace-nav__profile-btn'
                    aria-label={`Profile: ${currentUser.username}`}
                    title={currentUser.username}
                >
                    <span className='workspace-nav__profile-avatar'>
                        <IconUser size={18} />
                        <span className='workspace-nav__status-dot' />
                    </span>
                </button>
            </div>
        </nav>
    )
}

export default WorkspaceNav
