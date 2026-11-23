import React, { useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import ConfirmDialog from '../../Common/JSX/ConfirmDialog'
import InvitePeopleDialog from './InvitePeopleDialog'
import NewMessageDialog from './NewMessageDialog'
import {
    IconSettingsSliders,
    IconCompose,
    IconRocket,
    IconSearch,
    IconDirectories,
    IconSectionCollapse,
    IconChevronDown,
    IconUser,
    IconSprout,
    IconExternalLink,
    IconStar,
    IconTrash
} from './SlackIcons'
import slackIcon from '../../../assets/SlackHeroIcon.svg'
import googleCalendarIcon from '../../../assets/GoogleCalendar.png'
import googleDriveIcon from '../../../assets/GoggleDrive.png'
import '../CSS/WorkspaceSidebar.css'

const APP_ICONS = {
    slack: slackIcon,
    gcal: googleCalendarIcon,
    gdrive: googleDriveIcon
}

/*
    WorkspaceSidebar: secondary vertical panel (~250px wide).
    Displays the workspace header with dropdown, promo banner, search filter,
    and sections for Starred, Channels, Direct Messages, and Apps.
*/
function WorkspaceSidebar() {
    const {
        workspace,
        channels,
        activeChannel,
        selectChannel,
        addChannel,
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
        apps
    } = useWorkspace()

    const [isCreatingChannel, setIsCreatingChannel] = useState(false)
    const [newChannelName, setNewChannelName] = useState('')
    const [filterQuery, setFilterQuery] = useState('')
    const [channelToDelete, setChannelToDelete] = useState(null)
    const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
    const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
    const [collapsedSections, setCollapsedSections] = useState({
        starred: false,
        channels: false,
        dms: false,
        apps: false
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

    async function handleCreateChannel(e) {
        e.preventDefault()

        const created = await addChannel(newChannelName)

        if (created) {
            setNewChannelName('')
            setIsCreatingChannel(false)
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

                <div className='workspace-sidebar__header-actions'>
                    <button
                        type='button'
                        className='workspace-sidebar__icon-btn'
                        title='Preferences'
                        aria-label='Preferences'
                    >
                        <IconSettingsSliders size={15} />
                    </button>
                    <button
                        type='button'
                        className='workspace-sidebar__icon-btn'
                        title='New message'
                        aria-label='New message'
                        onClick={() => setIsNewMessageOpen(true)}
                    >
                        <IconCompose size={15} />
                    </button>
                </div>
            </div>

            {/* Promo card */}
            <div className='workspace-sidebar__promo'>
                <div className='workspace-sidebar__promo-icon' aria-hidden='true'>
                    <IconRocket size={20} />
                </div>
                <div className='workspace-sidebar__promo-content'>
                    <p className='workspace-sidebar__promo-title'>Get 50% off paid subscriptions</p>
                    <p className='workspace-sidebar__promo-subtitle'>Offer valid for 3 days</p>
                </div>
            </div>

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
                        onClick={() => toggleSection('starred')}
                        aria-expanded={isSectionOpen('starred')}
                        aria-controls='workspace-sidebar-starred'
                    >
                        <span
                            className={`workspace-sidebar__section-arrow${isSectionOpen('starred') ? ' workspace-sidebar__section-arrow--open' : ''}`}
                            aria-hidden='true'
                        >
                            <IconSectionCollapse size={10} />
                        </span>
                        <span className='workspace-sidebar__section-star' aria-hidden='true'>
                            <IconStar size={13} />
                        </span>
                        <span className='workspace-sidebar__section-title'>Starred</span>
                    </button>

                    {isSectionOpen('starred') && (
                        <div id='workspace-sidebar-starred'>
                            <p className='workspace-sidebar__section-empty'>
                                Drag and drop important stuff here
                            </p>
                        </div>
                    )}
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
                                                <button
                                                    type='button'
                                                    className='workspace-sidebar__item-delete'
                                                    title={`Delete #${channel.name}`}
                                                    aria-label={`Delete #${channel.name}`}
                                                    onClick={() => setChannelToDelete(channel)}
                                                >
                                                    <IconTrash size={13} />
                                                </button>
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
                                        <button type='submit' className='workspace-sidebar__add-save'>Add</button>
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
                                                    <IconUser size={13} />
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

                {/* Apps */}
                <section className='workspace-sidebar__section'>
                    <button
                        type='button'
                        className='workspace-sidebar__section-header'
                        onClick={() => toggleSection('apps')}
                        aria-expanded={isSectionOpen('apps')}
                        aria-controls='workspace-sidebar-apps'
                    >
                        <span
                            className={`workspace-sidebar__section-arrow${isSectionOpen('apps') ? ' workspace-sidebar__section-arrow--open' : ''}`}
                            aria-hidden='true'
                        >
                            <IconSectionCollapse size={10} />
                        </span>
                        <span className='workspace-sidebar__section-title'>Apps</span>
                    </button>

                    {isSectionOpen('apps') && (
                        <div id='workspace-sidebar-apps'>
                            <ul className='workspace-sidebar__list'>
                                {apps.map((app) => (
                                    <li key={app.id}>
                                        <button
                                            type='button'
                                            className='workspace-sidebar__item-btn'
                                        >
                                            {APP_ICONS[app.id] && (
                                                <img
                                                    className='workspace-sidebar__app-icon'
                                                    src={APP_ICONS[app.id]}
                                                    alt=''
                                                />
                                            )}
                                            <span className='workspace-sidebar__item-name'>{app.name}</span>
                                            {app.badge && (
                                                <span className='workspace-sidebar__item-badge'>{app.badge}</span>
                                            )}
                                            {app.external && (
                                                <span className='workspace-sidebar__external-icon' aria-hidden='true'>
                                                    <IconExternalLink size={12} />
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type='button'
                                className='workspace-sidebar__add-btn'
                            >
                                + Connect apps
                            </button>
                        </div>
                    )}
                </section>
            </div>

            {/* Bottom task tracker widget */}
            <div className='workspace-sidebar__footer-task'>
                <div className='workspace-sidebar__task-header'>
                    <span className='workspace-sidebar__task-icon' aria-hidden='true'>
                        <IconSprout size={16} />
                    </span>
                    <span className='workspace-sidebar__task-title'>4 tasks remaining</span>
                    <span className='workspace-sidebar__task-arrow'>˄</span>
                </div>
                <div className='workspace-sidebar__task-body'>
                    <span className='workspace-sidebar__task-circle' />
                    <span className='workspace-sidebar__task-text'>Set up your first channel</span>
                </div>
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

            {isInviteOpen && <InvitePeopleDialog onClose={() => setIsInviteOpen(false)} />}
            {isNewMessageOpen && <NewMessageDialog onClose={() => setIsNewMessageOpen(false)} />}
        </aside>
    )
}

export default WorkspaceSidebar
