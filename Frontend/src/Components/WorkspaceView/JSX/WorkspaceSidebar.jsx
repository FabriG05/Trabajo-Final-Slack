import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import ConfirmDialog from '../../Common/JSX/ConfirmDialog'
import InvitePeopleDialog from './InvitePeopleDialog'
import {
    IconSearch,
    IconDirectories,
    IconSectionCollapse,
    IconChevronDown,
    IconUser,
    IconStar,
    IconTrash,
    IconHash,
    IconDMs,
    IconMore
} from './SlackIcons'
import slackIcon from '../../../assets/SlackHeroIcon.svg'
import '../CSS/WorkspaceSidebar.css'

/*
    WorkspaceSidebar: secondary vertical panel (~250px wide).
    Displays the workspace header with dropdown, promo banner, search filter,
    and sections for Starred, Channels, Direct Messages, and Apps.
*/
function WorkspaceSidebar() {
    const navigate = useNavigate()
    const {
        workspace,
        channels,
        activeChannel,
        selectChannel,
        addChannel,
        renameChannel,
        deleteChannel,
        deleteWorkspace,
        canManageChannels,
        canManageWorkspace,
        loadingChannels,
        channelError,
        clearChannelError,
        unreadByConversation,
        directMessages,
        activeDm,
        selectDm,
        activeNavTab,
        setActiveNavTab,
        starredMessages
    } = useWorkspace()

    const [isCreatingChannel, setIsCreatingChannel] = useState(false)
    const [isSubmittingChannel, setIsSubmittingChannel] = useState(false)
    const [newChannelName, setNewChannelName] = useState('')
    const [filterQuery, setFilterQuery] = useState('')
    const [channelToDelete, setChannelToDelete] = useState(null)
    const [channelMenu, setChannelMenu] = useState(null)
    const [channelToRename, setChannelToRename] = useState(null)
    const [renameChannelName, setRenameChannelName] = useState('')
    const [isRenamingChannel, setIsRenamingChannel] = useState(false)
    const [renameChannelError, setRenameChannelError] = useState(null)
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
    const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const channelMenuRef = useRef(null)
    const [collapsedSections, setCollapsedSections] = useState({
        starred: false,
        channels: false,
        dms: false
    })

    const filteredChannels = channels.filter((c) =>
        c.name.toLowerCase().includes(filterQuery.toLowerCase())
    )

    const filteredDms = directMessages.filter((dm) =>
        dm.username.toLowerCase().includes(filterQuery.toLowerCase())
    )

    const isFiltering = filterQuery.trim().length > 0
    const isSectionOpen = (section) => isFiltering || !collapsedSections[section]

    function toggleSection(section) {
        const willCollapse = !collapsedSections[section]

        setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }))

        if (section === 'channels' && willCollapse) {
            setIsCreatingChannel(false)
            setNewChannelName('')
            clearChannelError()
        }
    }

    useEffect(() => {
        if (!channelMenu) return undefined

        function handlePointerDown(event) {
            if (channelMenuRef.current?.contains(event.target)) return
            if (event.target.closest?.('.workspace-sidebar__item-menu-btn')) return
            setChannelMenu(null)
        }

        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                setChannelMenu(null)
            }
        }

        function closeMenu() {
            setChannelMenu(null)
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        window.addEventListener('resize', closeMenu)
        document.querySelector('.workspace-sidebar__sections')?.addEventListener('scroll', closeMenu)

        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('resize', closeMenu)
            document.querySelector('.workspace-sidebar__sections')?.removeEventListener('scroll', closeMenu)
        }
    }, [channelMenu])

    function openRenameChannelDialog(channel) {
        setChannelMenu(null)
        setRenameChannelError(null)
        setRenameChannelName(channel.name)
        setChannelToRename(channel)
    }

    async function handleRenameChannel(event) {
        event.preventDefault()
        if (!channelToRename || isRenamingChannel) return

        setIsRenamingChannel(true)
        setRenameChannelError(null)
        try {
            await renameChannel(channelToRename.id, renameChannelName)
            setChannelToRename(null)
            setRenameChannelName('')
        } catch (error) {
            setRenameChannelError(error.message || 'Could not rename channel.')
        } finally {
            setIsRenamingChannel(false)
        }
    }

    async function handleCreateChannel(e) {
        e.preventDefault()

        if (isSubmittingChannel) {
            return
        }

        setIsSubmittingChannel(true)
        try {
            const created = await addChannel(newChannelName)

            if (created) {
                setNewChannelName('')
                setIsCreatingChannel(false)
            }
        } finally {
            setIsSubmittingChannel(false)
        }
    }

    return (
        <aside className='workspace-sidebar'>
            {/* Header: Workspace switcher & Actions */}
            <div className='workspace-sidebar__header'>
                <div className='workspace-sidebar__workspace-menu-wrapper'>
                    <button
                        type='button'
                        className='workspace-sidebar__workspace-btn'
                        title={workspace?.name || 'New Workspace'}
                        onClick={() => {
                            if (canManageWorkspace) {
                                setIsWorkspaceMenuOpen((open) => !open)
                            }
                        }}
                        aria-haspopup={canManageWorkspace ? 'menu' : undefined}
                        aria-expanded={canManageWorkspace ? isWorkspaceMenuOpen : undefined}
                    >
                        <span className='workspace-sidebar__workspace-name'>
                            {workspace?.name || 'New Workspace'}
                        </span>
                        {canManageWorkspace && (
                            <span className='workspace-sidebar__chevron' aria-hidden='true'>
                                <IconChevronDown size={12} />
                            </span>
                        )}
                    </button>

                    {canManageWorkspace && isWorkspaceMenuOpen && (
                        <div className='workspace-sidebar__workspace-menu' role='menu'>
                            <button
                                type='button'
                                className='workspace-sidebar__workspace-menu-item'
                                role='menuitem'
                                onClick={() => {
                                    setIsWorkspaceMenuOpen(false)
                                    setIsDeleteWorkspaceOpen(true)
                                }}
                            >
                                <IconTrash size={13} />
                                <span>Delete workspace</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {activeNavTab === 'dms' ? (
                <div className='workspace-sidebar__sections workspace-sidebar__sections--dms'>
                    <div className='workspace-sidebar__search workspace-sidebar__search--dms'>
                        <div className='workspace-sidebar__search-box'>
                            <span className='workspace-sidebar__search-icon' aria-hidden='true'>
                                <IconSearch size={13} />
                            </span>
                            <input
                                type='text'
                                className='workspace-sidebar__search-input'
                                placeholder='Find a DM...'
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <section className='workspace-sidebar__section'>
                        <div className='workspace-sidebar__section-header workspace-sidebar__section-header--static'>
                            <span className='workspace-sidebar__section-icon' aria-hidden='true'>
                                <IconDMs size={14} />
                            </span>
                            <span className='workspace-sidebar__section-title'>Direct messages</span>
                        </div>
                        <ul className='workspace-sidebar__list'>
                            {filteredDms.map((dm) => {
                                const isActive = activeDm?.id === dm.id
                                const unreadCount = Number(unreadByConversation[dm.id] || 0)

                                return (
                                    <li key={dm.id}>
                                        <button
                                            type='button'
                                            className={`workspace-sidebar__item-btn${isActive ? ' workspace-sidebar__item-btn--active' : ''}`}
                                            onClick={() => selectDm(dm.id)}
                                        >
                                            <span className='workspace-sidebar__dm-avatar'>
                                                {dm.photo ? (
                                                    <img
                                                        className='workspace-sidebar__dm-avatar-image'
                                                        src={dm.photo}
                                                        alt=''
                                                    />
                                                ) : (
                                                    <IconUser size={13} />
                                                )}
                                                {dm.status && (<span className='workspace-sidebar__status-badge' data-status={dm.status} />)}
                                            </span>
                                            <span className='workspace-sidebar__item-name'>
                                                {dm.username}
                                                {dm.isSelf && <span className='workspace-sidebar__you-badge'> you</span>}
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className='workspace-sidebar__item-badge workspace-sidebar__item-badge--unread'>
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                            {filteredDms.length === 0 && (
                                <li className='workspace-sidebar__section-empty'>No DMs found</li>
                            )}
                        </ul>
                    </section>
                </div>
            ) : (
                <>

                    {/* Quick find */}
                    <div className='workspace-sidebar__search'>
                        <div className='workspace-sidebar__search-box'>
                            <span className='workspace-sidebar__search-icon' aria-hidden='true'>
                                <IconSearch size={13} />
                            </span>
                            <input
                                type='text'
                                className='workspace-sidebar__search-input'
                                placeholder='Find a conversation...'
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                            />
                        </div>
                        <button
                            type='button'
                            className='workspace-sidebar__directories-btn'
                            onClick={() => setActiveNavTab('directory')}
                        >
                            <IconDirectories size={15} />
                            <span>Directories</span>
                        </button>
                    </div>

                    {/* Scrollable sections list */}
                    <div className='workspace-sidebar__sections'>
                        {/* Starred */}
                        <section className='workspace-sidebar__section'>
                            <button
                                type='button'
                                className='workspace-sidebar__section-header'
                                onClick={() => setActiveNavTab('starred')}
                            >
                                <span className='workspace-sidebar__section-star' aria-hidden='true'>
                                    <IconStar size={13} />
                                </span>
                                <span className='workspace-sidebar__section-title'>Starred</span>
                                {starredMessages.length > 0 && (
                                    <span className='workspace-sidebar__item-badge workspace-sidebar__item-badge--unread'>
                                        {starredMessages.length > 99 ? '99+' : starredMessages.length}
                                    </span>
                                )}
                            </button>
                        </section>

                        {/* Channels */}
                        <section className='workspace-sidebar__section'>
                            <button
                                type='button'
                                className='workspace-sidebar__section-header'
                                onClick={() => toggleSection('channels')}
                                aria-expanded={isSectionOpen('channels')}
                                aria-controls='workspace-sidebar-channels'
                            >
                                <span
                                    className={`workspace-sidebar__section-arrow${isSectionOpen('channels') ? ' workspace-sidebar__section-arrow--open' : ''}`}
                                    aria-hidden='true'
                                >
                                    <IconSectionCollapse size={10} />
                                </span>
                                <span className='workspace-sidebar__section-icon' aria-hidden='true'>
                                    <IconHash size={14} />
                                </span>
                                <span className='workspace-sidebar__section-title'>Channels</span>
                            </button>

                            {isSectionOpen('channels') && (
                                <div id='workspace-sidebar-channels'>
                                    <ul className='workspace-sidebar__list'>
                                        {loadingChannels && (
                                            <li className='workspace-sidebar__section-empty'>Loading channels…</li>
                                        )}
                                        {!loadingChannels && filteredChannels.length === 0 && (
                                            <li className='workspace-sidebar__section-empty'>No channels yet</li>
                                        )}
                                        {filteredChannels.map((channel) => {
                                            const isActive = !activeDm && activeChannel?.id === channel.id
                                            const unreadCount = Number(unreadByConversation[channel.id] || 0)

                                            return (
                                                <li key={channel.id} className='workspace-sidebar__item'>
                                                    <button
                                                        type='button'
                                                        className={`workspace-sidebar__item-btn${isActive ? ' workspace-sidebar__item-btn--active' : ''}`}
                                                        onClick={() => selectChannel(channel.id)}
                                                    >
                                                        <span className='workspace-sidebar__item-prefix'>#</span>
                                                        <span className='workspace-sidebar__item-name'>{channel.name}</span>
                                                        {unreadCount > 0 && (
                                                            <span className='workspace-sidebar__item-badge workspace-sidebar__item-badge--unread'>
                                                                {unreadCount > 99 ? '99+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {canManageChannels && channel.name !== 'general' && (
                                                        <div className='workspace-sidebar__item-menu-wrap'>
                                                            <button
                                                                type='button'
                                                                className='workspace-sidebar__item-menu-btn'
                                                                title={`Channel options for #${channel.name}`}
                                                                aria-label={`Channel options for #${channel.name}`}
                                                                aria-haspopup='menu'
                                                                aria-expanded={channelMenu?.channelId === channel.id}
                                                                onClick={(event) => {
                                                                    event.stopPropagation()
                                                                    const rect = event.currentTarget.getBoundingClientRect()
                                                                    setChannelMenu((current) => (
                                                                        current?.channelId === channel.id
                                                                            ? null
                                                                            : {
                                                                                channelId: channel.id,
                                                                                channel,
                                                                                top: rect.bottom + 4,
                                                                                left: Math.min(Math.max(8, rect.right - 104), window.innerWidth - 112)
                                                                            }
                                                                    ))
                                                                }}
                                                            >
                                                                <IconMore size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </li>
                                            )
                                        })}
                                    </ul>

                                    {isCreatingChannel ? (
                                        <form onSubmit={handleCreateChannel} className='workspace-sidebar__add-form'>
                                            <input
                                                type='text'
                                                className='workspace-sidebar__add-input'
                                                placeholder='channel-name'
                                                value={newChannelName}
                                                onChange={(e) => setNewChannelName(e.target.value)}
                                                autoFocus
                                            />
                                            <div className='workspace-sidebar__add-actions'>
                                                <button type='submit' className='workspace-sidebar__add-save' disabled={isSubmittingChannel}>{isSubmittingChannel ? 'Adding...' : 'Add'}</button>
                                                <button
                                                    type='button'
                                                    className='workspace-sidebar__add-cancel'
                                                    onClick={() => {
                                                        setIsCreatingChannel(false)
                                                        setNewChannelName('')
                                                        clearChannelError()
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            {channelError && (
                                                <p className='workspace-sidebar__section-empty' role='alert'>
                                                    {channelError}
                                                </p>
                                            )}
                                        </form>
                                    ) : (
                                        <button
                                            type='button'
                                            className='workspace-sidebar__add-btn'
                                            onClick={() => {
                                                setIsCreatingChannel(true)
                                                clearChannelError()
                                            }}
                                        >
                                            + Add channels
                                        </button>
                                    )}
                                </div>
                            )}
                        </section>

                        {/* Direct messages */}
                        <section className='workspace-sidebar__section'>
                            <button
                                type='button'
                                className='workspace-sidebar__section-header'
                                onClick={() => toggleSection('dms')}
                                aria-expanded={isSectionOpen('dms')}
                                aria-controls='workspace-sidebar-dms'
                            >
                                <span
                                    className={`workspace-sidebar__section-arrow${isSectionOpen('dms') ? ' workspace-sidebar__section-arrow--open' : ''}`}
                                    aria-hidden='true'
                                >
                                    <IconSectionCollapse size={10} />
                                </span>
                                <span className='workspace-sidebar__section-icon' aria-hidden='true'>
                                    <IconDMs size={14} />
                                </span>
                                <span className='workspace-sidebar__section-title'>Direct messages</span>
                            </button>

                            {isSectionOpen('dms') && (
                                <div id='workspace-sidebar-dms'>
                                    <ul className='workspace-sidebar__list'>
                                        {filteredDms.map((dm) => {
                                            const isActive = activeDm?.id === dm.id
                                            const unreadCount = Number(unreadByConversation[dm.id] || 0)

                                            return (
                                                <li key={dm.id}>
                                                    <button
                                                        type='button'
                                                        className={`workspace-sidebar__item-btn${isActive ? ' workspace-sidebar__item-btn--active' : ''}`}
                                                        onClick={() => selectDm(dm.id)}
                                                    >
                                                        <span className='workspace-sidebar__dm-avatar'>
                                                            {dm.photo ? (
                                                                <img
                                                                    className='workspace-sidebar__dm-avatar-image'
                                                                    src={dm.photo}
                                                                    alt=''
                                                                />
                                                            ) : (
                                                                <IconUser size={13} />
                                                            )}
                                                            {dm.status && (<span className='workspace-sidebar__status-badge' data-status={dm.status} />)}
                                                        </span>
                                                        <span className='workspace-sidebar__item-name'>
                                                            {dm.username}
                                                            {dm.isSelf && <span className='workspace-sidebar__you-badge'> you</span>}
                                                        </span>
                                                        {unreadCount > 0 && (
                                                            <span className='workspace-sidebar__item-badge workspace-sidebar__item-badge--unread'>
                                                                {unreadCount > 99 ? '99+' : unreadCount}
                                                            </span>
                                                        )}
                                                    </button>
                                                </li>
                                            )
                                        })}
                                    </ul>

                                    <button
                                        type='button'
                                        className='workspace-sidebar__add-btn'
                                        onClick={() => setIsInviteOpen(true)}
                                    >
                                        + Invite people
                                    </button>
                                </div>
                            )}
                        </section>


                    </div>
                </>
            )}

            <div className='workspace-sidebar__footer'>
                <button
                    type='button'
                    className='workspace-sidebar__slack-btn'
                    onClick={() => navigate('/')}
                    title='Open Slack landing'
                >
                    <img src={slackIcon} alt='' className='workspace-sidebar__slack-icon' />
                    <span>Slack</span>
                </button>
            </div>

            {channelToDelete && (
                <ConfirmDialog
                    title={`Delete #${channelToDelete.name}?`}
                    description='This permanently deletes the channel and all of its messages. Members will lose access immediately.'
                    confirmLabel='Delete channel'
                    onCancel={() => setChannelToDelete(null)}
                    onConfirm={async () => {
                        await deleteChannel(channelToDelete.id)
                        setChannelToDelete(null)
                    }}
                />
            )}

            {isDeleteWorkspaceOpen && (
                <ConfirmDialog
                    title={`Delete ${workspace?.name || 'this workspace'}?`}
                    description='This permanently deletes the workspace, its channels, messages and memberships. This action cannot be undone.'
                    confirmLabel='Delete workspace'
                    requireText={workspace?.name || ''}
                    onCancel={() => setIsDeleteWorkspaceOpen(false)}
                    onConfirm={async () => {
                        await deleteWorkspace()
                    }}
                />
            )}

            {channelMenu && createPortal(
                <div
                    ref={channelMenuRef}
                    className='workspace-sidebar__item-menu workspace-sidebar__item-menu--portal'
                    role='menu'
                    style={{ top: `${channelMenu.top}px`, left: `${Math.max(8, channelMenu.left)}px` }}
                >
                    <button
                        type='button'
                        className='workspace-sidebar__item-menu-item'
                        role='menuitem'
                        onClick={() => openRenameChannelDialog(channelMenu.channel)}
                    >
                        Rename channel
                    </button>
                    <button
                        type='button'
                        className='workspace-sidebar__item-menu-item workspace-sidebar__item-menu-item--danger'
                        role='menuitem'
                        onClick={() => {
                            setChannelToDelete(channelMenu.channel)
                            setChannelMenu(null)
                        }}
                    >
                        Delete channel
                    </button>
                </div>,
                document.body
            )}

            {channelToRename && (
                <div
                    className='workspace-admin-dialog__overlay'
                    onMouseDown={(event) => event.target === event.currentTarget && !isRenamingChannel && setChannelToRename(null)}
                >
                    <div className='workspace-admin-dialog' role='dialog' aria-modal='true' aria-label='Rename channel'>
                        <h2 className='workspace-admin-dialog__title'>Rename channel</h2>
                        <form onSubmit={handleRenameChannel}>
                            <label className='workspace-admin-dialog__label' htmlFor='rename-channel-name'>Channel name</label>
                            <input
                                id='rename-channel-name'
                                className='workspace-admin-dialog__input'
                                value={renameChannelName}
                                onChange={(event) => setRenameChannelName(event.target.value)}
                                placeholder='channel-name'
                                disabled={isRenamingChannel}
                                autoFocus
                            />
                            {renameChannelError && <p className='workspace-admin-dialog__error' role='alert'>{renameChannelError}</p>}
                            <div className='workspace-admin-dialog__actions'>
                                <button type='button' className='workspace-admin-dialog__btn' onClick={() => setChannelToRename(null)} disabled={isRenamingChannel}>Cancel</button>
                                <button type='submit' className='workspace-admin-dialog__btn workspace-admin-dialog__btn--primary' disabled={isRenamingChannel || !renameChannelName.trim()}>
                                    {isRenamingChannel ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isInviteOpen && <InvitePeopleDialog onClose={() => setIsInviteOpen(false)} />}
        </aside>
    )
}

export default WorkspaceSidebar
