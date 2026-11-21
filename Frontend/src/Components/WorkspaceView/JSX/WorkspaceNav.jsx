import React, { useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { compressPhoto } from '../../../Utils/compressPhoto'
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

const STATUS_OPTIONS = [
    { value: 'online', label: 'Online' },
    { value: 'away', label: 'Away' },
    { value: 'offline', label: 'Offline' },
    { value: 'do not disturb', label: 'Do not disturb' }
]

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
    const { activeNavTab, setActiveNavTab, workspace, currentUser, userStatus, setUserStatus, changeProfilePhoto } = useWorkspace()

    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
    const photoInputRef = useRef(null)
    const [photoError, setPhotoError] = useState(null)
    const [statusError, setStatusError] = useState(null)

    // Workspace badge abbreviation (e.g. "NW" for "New Workspace")
    const workspaceInitials = (workspace?.name || 'NW')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    function toggleStatusMenu() {
        setIsStatusMenuOpen((open) => !open)
    }

    function handlePickPhoto() {
        setIsStatusMenuOpen(false)
        photoInputRef.current?.click()
    }

    async function handlePhotoChange(event) {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) {
            return
        }

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please choose an image file.')
            return
        }

        try {
            const compressedPhoto = await compressPhoto(file)
            setPhotoError(null)
            await changeProfilePhoto(compressedPhoto)
        } catch {
            setPhotoError('The image could not be read. Please try again.')
        }
    }

    async function handleStatusChange(status) {
        setStatusError(null)
        const changed = await setUserStatus(status)

        if (changed) {
            setIsStatusMenuOpen(false)
        } else {
            setStatusError('Could not update your status. Please try again.')
        }
    }

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
                    onClick={toggleStatusMenu}
                    aria-label={`Profile: ${currentUser.username}`}
                    title={currentUser.username}
                >
                    <span className='workspace-nav__profile-avatar'>
                        {currentUser.photo ? (
                            <img
                                className='workspace-nav__profile-photo'
                                src={currentUser.photo}
                                alt=''
                            />
                        ) : (
                            <IconUser size={18} />
                        )}
                        <span className='workspace-nav__status-dot' data-status={userStatus} />
                    </span>
                </button>

                {isStatusMenuOpen && (
                    <div className='workspace-nav__status-menu' role='menu'>
                        <ul className='workspace-nav__status-list'>
                            {STATUS_OPTIONS.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type='button'
                                        className={'workspace-nav__status-option' + (userStatus === option.value ? ' workspace-nav__status-option--active' : '')}
                                        onClick={() => handleStatusChange(option.value)}
                                        role='menuitemradio'
                                        aria-checked={userStatus === option.value}
                                    >
                                        {option.label}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <button
                            type='button'
                            className='workspace-nav__status-photo-btn'
                            onClick={handlePickPhoto}
                        >
                            Change photo
                        </button>

                        <input
                            ref={photoInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handlePhotoChange}
                            tabIndex={-1}
                            aria-hidden='true'
                        />

                        {photoError && (
                            <p className='workspace-nav__photo-error' role='alert'>
                                {photoError}
                            </p>
                        )}

                        {statusError && (
                            <p className='workspace-nav__photo-error' role='alert'>
                                {statusError}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default WorkspaceNav
