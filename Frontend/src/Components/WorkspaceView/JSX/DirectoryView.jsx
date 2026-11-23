import React from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import { IconUser } from './SlackIcons'
import '../CSS/DirectoryView.css'

function getMemberId(member) {
    return String(member?._id || member?.id || member?.FK_id_user?._id || '')
}

function getMemberUser(member) {
    return member?.FK_id_user || member?.user || null
}

function getMemberName(member) {
    const user = getMemberUser(member)
    return user?.name || user?.username || user?.email || 'Unknown user'
}

function getMemberRole(member) {
    return member?.role || member?.FK_id_workspace_role?.name || member?.FK_id_workspace_role?.role || 'User'
}

function getStatusLabel(status) {
    const normalized = String(status || 'offline').toLowerCase()
    if (normalized === 'do not disturb') return 'Do not disturb'
    if (normalized === 'away') return 'Away'
    if (normalized === 'online') return 'Online'
    return 'Offline'
}

function DirectoryView() {
    const { activeMembers, currentUser } = useWorkspace()

    const members = [...(activeMembers || [])].sort((a, b) => {
        const aName = getMemberName(a).toLowerCase()
        const bName = getMemberName(b).toLowerCase()
        return aName.localeCompare(bName)
    })

    return (
        <main className='directory-view' aria-label='Workspace directory'>
            <header className='directory-view__header'>
                <div>
                    <h2 className='directory-view__title'>Directory</h2>
                    <p className='directory-view__subtitle'>
                        {members.length} member{members.length === 1 ? '' : 's'} in this workspace
                    </p>
                </div>
            </header>

            <div className='directory-view__list' role='list'>
                {members.map((member) => {
                    const user = getMemberUser(member)
                    const memberId = getMemberId(member)
                    const name = getMemberName(member)
                    const role = getMemberRole(member)
                    const isSelf = String(user?._id || '') === String(currentUser?.id || '')
                    const status = isSelf ? (currentUser?.status || 'online') : (user?.status || 'offline')
                    const photo = isSelf ? (currentUser?.photo || user?.profile_photo) : user?.profile_photo
                    const statusLabel = getStatusLabel(status)

                    return (
                        <article key={memberId || name} className='directory-view__card' role='listitem'>
                            <div className='directory-view__avatar-wrap'>
                                {photo ? (
                                    <img className='directory-view__avatar' src={photo} alt={name} />
                                ) : (
                                    <div className='directory-view__avatar directory-view__avatar--fallback' aria-hidden='true'>
                                        <IconUser size={22} />
                                    </div>
                                )}
                                <span
                                    className='directory-view__status-dot'
                                    data-status={status}
                                    title={statusLabel}
                                    aria-label={statusLabel}
                                />
                            </div>

                            <div className='directory-view__info'>
                                <div className='directory-view__name-row'>
                                    <span className='directory-view__name'>{name}</span>
                                    {isSelf && <span className='directory-view__you'>you</span>}
                                </div>
                                <div className='directory-view__meta'>
                                    <span className='directory-view__role'>{role}</span>
                                    <span className='directory-view__meta-sep' aria-hidden='true'>•</span>
                                    <span className='directory-view__status' data-status={status}>{statusLabel}</span>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </main>
    )
}

export default DirectoryView
