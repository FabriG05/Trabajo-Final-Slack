import React, { useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
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
    IconStar
} from './SlackIcons'
import '../CSS/WorkspaceSidebar.css'

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

    const filteredChannels = channels.filter((c) =>
        c.name.toLowerCase().includes(filterQuery.toLowerCase())
    )

    const filteredDms = directMessages.filter((dm) =>
        dm.username.toLowerCase().includes(filterQuery.toLowerCase())
    )

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
                <button
                    type='button'
                    className='workspace-sidebar__workspace-btn'
                    title={workspace?.name || 'New Workspace'}
                >
                    <span className='workspace-sidebar__workspace-name'>
                        {workspace?.name || 'New Workspace'}
                    </span>
                    <span className='workspace-sidebar__chevron' aria-hidden='true'>
                        <IconChevronDown size={12} />
                    </span>
                </button>

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
                    <div className='workspace-sidebar__section-header'>
                        <span className='workspace-sidebar__section-arrow' aria-hidden='true'>
                            <IconSectionCollapse size={10} />
                        </span>
                        <span className='workspace-sidebar__section-star' aria-hidden='true'>
                            <IconStar size={13} />
                        </span>
                        <span className='workspace-sidebar__section-title'>Starred</span>
                    </div>
                    <p className='workspace-sidebar__section-empty'>
                        Drag and drop important stuff here
                    </p>
                </section>

                {/* Channels */}
                <section className='workspace-sidebar__section'>
                    <div className='workspace-sidebar__section-header'>
                        <span className='workspace-sidebar__section-arrow' aria-hidden='true'>
                            <IconSectionCollapse size={10} />
                        </span>
                        <span className='workspace-sidebar__section-title'>Channels</span>
                    </div>

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
                                <li key={channel.id}>
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
                </section>

                {/* Direct messages */}
                <section className='workspace-sidebar__section'>
                    <div className='workspace-sidebar__section-header'>
                        <span className='workspace-sidebar__section-arrow' aria-hidden='true'>
                            <IconSectionCollapse size={10} />
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
                    >
                        + Invite people
                    </button>
                </section>

                {/* Apps */}
                <section className='workspace-sidebar__section'>
                    <div className='workspace-sidebar__section-header'>
                        <span className='workspace-sidebar__section-arrow' aria-hidden='true'>
                            <IconSectionCollapse size={10} />
                        </span>
                        <span className='workspace-sidebar__section-title'>Apps</span>
                    </div>

                    <ul className='workspace-sidebar__list'>
                        {apps.map((app) => (
                            <li key={app.id}>
                                <button
                                    type='button'
                                    className='workspace-sidebar__item-btn'
                                >
                                    <span className='workspace-sidebar__item-prefix'>⚡</span>
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
        </aside>
    )
}

export default WorkspaceSidebar
