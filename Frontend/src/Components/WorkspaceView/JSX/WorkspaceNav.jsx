import React, { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { compressPhoto } from '../../../Utils/compressPhoto'
import WorkspaceAdminMenu from './WorkspaceAdminMenu'
import CreateMoreMenu from './CreateMoreMenu'
import {
    IconHome,
    IconDMs,
    IconActivity,
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
    (Home, DMs, Activity, Admin), and bottom utilities
    (Add, Theme toggle, User Profile).
*/
const NAV_ITEMS = [
    { id: 'home', label: 'Home', Icon: IconHome },
    { id: 'dms', label: 'DMs', Icon: IconDMs },
    { id: 'activity', label: 'Activity', Icon: IconActivity },
    { id: 'divider', isDivider: true },
    { id: 'admin', label: 'Admin', Icon: IconAdmin, badge: true }
]

function WorkspaceNav() {
    const {
        activeNavTab,
        setActiveNavTab,
        openDmsTab,
        workspace,
        currentUser,
        currentUserRole,
        userStatus,
        setUserStatus,
        changeProfilePhoto
    } = useWorkspace()

    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false)
    const [photoError, setPhotoError] = useState(null)
    const [statusError, setStatusError] = useState(null)
    const [savingStatus, setSavingStatus] = useState(null)
    const profileMenuRef = useRef(null)
    const profileButtonRef = useRef(null)
    const photoInputRef = useRef(null)

    // Workspace badge abbreviation (e.g. "NW" for "New Workspace")
    const workspaceInitials = (workspace?.name || 'NW')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

    useEffect(() => {
        if (!isStatusMenuOpen) {
            return undefined
        }

        function handlePointerDown(event) {
            const menu = profileMenuRef.current
            const button = profileButtonRef.current
            if (menu?.contains(event.target) || button?.contains(event.target)) {
                return
            }
            setIsStatusMenuOpen(false)
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setIsStatusMenuOpen(false)
                profileButtonRef.current?.focus()
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isStatusMenuOpen])

    function toggleStatusMenu() {
        setIsAdminMenuOpen(false)
        setIsCreateMenuOpen(false)
        setPhotoError(null)
        setStatusError(null)
        setIsStatusMenuOpen((open) => !open)
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
        if (savingStatus || status === userStatus) {
            return
        }

        setStatusError(null)
        setSavingStatus(status)
        const changed = await setUserStatus(status)
        setSavingStatus(null)

        if (!changed) {
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
                {NAV_ITEMS.filter((item) => item.id !== 'admin' || ['Owner', 'Admin'].includes(currentUserRole)).map((item) => {
                    if (item.isDivider) {
                        return <li key={item.id} className='workspace-nav__divider' />
                    }

                    const isActive = item.id === 'admin' ? isAdminMenuOpen : activeNavTab === item.id
                    const IconComponent = item.Icon

                    return (
                        <li key={item.id} className='workspace-nav__item workspace-nav__item--relative'>
                            <button
                                type='button'
                                className={`workspace-nav__btn${isActive ? ' workspace-nav__btn--active' : ''}`}
                                onClick={() => {
                                    if (item.id === 'admin') {
                                        setIsCreateMenuOpen(false)
                                        setIsStatusMenuOpen(false)
                                        setIsAdminMenuOpen((open) => !open)
                                        return
                                    }

                                    setIsAdminMenuOpen(false)

                                    if (item.id === 'dms') {
                                        openDmsTab()
                                        return
                                    }

                                    setActiveNavTab(item.id)
                                }}
                                aria-label={item.label}
                                title={item.label}
                            >
                                <span className='workspace-nav__icon-wrapper'>
                                    <IconComponent size={20} className='workspace-nav__icon' />
                                    {item.badge && <span className='workspace-nav__dot' />}
                                </span>
                                <span className='workspace-nav__label'>{item.label}</span>
                            </button>
                            {item.id === 'admin' && isAdminMenuOpen && (
                                <WorkspaceAdminMenu onClose={() => setIsAdminMenuOpen(false)} />
                            )}
                        </li>
                    )
                })}
            </ul>

            {/* Bottom utility icons */}
            <div className='workspace-nav__bottom'>
                {['Owner', 'Admin'].includes(currentUserRole) && (
                    <div className='workspace-nav__create-more-wrapper'>
                        <button
                            type='button'
                            className={`workspace-nav__util-btn${isCreateMenuOpen ? ' workspace-nav__util-btn--active' : ''}`}
                            aria-label='Create more'
                            title='Create more'
                            onClick={() => {
                                setIsAdminMenuOpen(false)
                                setIsStatusMenuOpen(false)
                                setIsCreateMenuOpen((open) => !open)
                            }}
                        >
                            +
                        </button>
                        {isCreateMenuOpen && (
                            <CreateMoreMenu onClose={() => setIsCreateMenuOpen(false)} />
                        )}
                    </div>
                )}
                <button
                    type='button'
                    className='workspace-nav__util-btn'
                    aria-label='Toggle theme'
                    title='Theme'
                >
                    <IconMoon size={18} />
                </button>

                <div className='workspace-nav__profile-wrapper'>
                    <button
                        ref={profileButtonRef}
                        type='button'
                        className='workspace-nav__profile-btn'
                        onClick={toggleStatusMenu}
                        aria-label={`Profile: ${currentUser.username}`}
                        aria-haspopup='menu'
                        aria-expanded={isStatusMenuOpen}
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
                        <div
                            ref={profileMenuRef}
                            className='workspace-nav__status-menu'
                            role='menu'
                            aria-label='Profile menu'
                        >
                            <div className='workspace-nav__profile-card-header'>
                                <span className='workspace-nav__profile-card-avatar'>
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
                                <div className='workspace-nav__profile-card-info'>
                                    <span className='workspace-nav__profile-card-name'>
                                        {currentUser.displayName || currentUser.username || 'User'}
                                    </span>
                                    <span className='workspace-nav__profile-card-status'>
                                        {STATUS_OPTIONS.find((option) => option.value === userStatus)?.label || 'Online'}
                                    </span>
                                </div>
                            </div>

                            <div className='workspace-nav__menu-section'>
                                <p className='workspace-nav__menu-section-title'>Set status</p>
                                <ul className='workspace-nav__status-list'>
                                    {STATUS_OPTIONS.map((option) => {
                                        const isActive = userStatus === option.value
                                        const isSaving = savingStatus === option.value
                                        return (
                                            <li key={option.value}>
                                                <button
                                                    type='button'
                                                    className={'workspace-nav__status-option' + (isActive ? ' workspace-nav__status-option--active' : '')}
                                                    onClick={() => handleStatusChange(option.value)}
                                                    role='menuitemradio'
                                                    aria-checked={isActive}
                                                    disabled={Boolean(savingStatus)}
                                                >
                                                    <span className='workspace-nav__status-option-dot' data-status={option.value} aria-hidden='true' />
                                                    <span>{option.label}</span>
                                                    {isSaving && <span className='workspace-nav__status-saving'>Saving...</span>}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>

                            <div className='workspace-nav__menu-divider' />

                            <button
                                type='button'
                                className='workspace-nav__menu-action'
                                role='menuitem'
                                disabled
                                title='Coming soon'
                            >
                                Mute notifications
                                <span className='workspace-nav__menu-soon'>Coming soon</span>
                            </button>

                            <button
                                type='button'
                                className='workspace-nav__menu-action'
                                role='menuitem'
                                onClick={() => {
                                    setIsStatusMenuOpen(false)
                                    setActiveNavTab('profile')
                                }}
                            >
                                Profile
                            </button>

                            <input
                                ref={photoInputRef}
                                type='file'
                                accept='image/*'
                                onChange={handlePhotoChange}
                                tabIndex={-1}
                                aria-hidden='true'
                                className='workspace-nav__photo-input'
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
            </div>
        </nav>
    )
}

export default WorkspaceNav
