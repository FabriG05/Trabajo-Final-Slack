import { useState } from 'react'
import { Link } from 'react-router'
import ConfirmDialog from '../../Common/JSX/ConfirmDialog'
import { deleteWorkspace } from '../../../Services/WorkSpaceService'
import WorkspacePicPH from '../../../assets/WorkspacePicPH.png'
import WorkspacePicPH2 from '../../../assets/WorkspacePicPH2.png'
import '../CSS/WorkspaceCard.css'

/*
    One workspace row in the "Workspaces" card. The member count
    comes from the list of active members the backend returns next
    to the workspace. When the workspace has no photo, one of the
    two default placeholders is picked deterministically from its
    id, so each workspace keeps the same picture between reloads.

    Owners also get a small menu on the right to delete the whole
    workspace. The confirmation requires typing its exact name.
*/
const WORKSPACE_PLACEHOLDERS = [WorkspacePicPH, WorkspacePicPH2]

function placeholderFor(workspaceId) {
    const text = String(workspaceId || '')
    let hash = 0
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0
    }
    return WORKSPACE_PLACEHOLDERS[hash % WORKSPACE_PLACEHOLDERS.length]
}

function WorkspaceCard({
    workspaceId,
    name,
    description,
    memberCount,
    photo,
    canDelete = false,
    onDeleted
}) {
    const membersLabel = memberCount === 1 ? '1 member' : `${memberCount ?? 0} members`
    const avatarSrc = photo || placeholderFor(workspaceId)

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)

    return (
        <div className='workspace-card'>
            <Link
                className='workspace-card__link'
                to={`/workspace/${workspaceId}`}
            >
                <span className='workspace-card__avatar' aria-hidden='true'>
                    <img
                        className='workspace-card__avatar-image'
                        src={avatarSrc}
                        alt=''
                    />
                </span>

                <span className='workspace-card__info'>
                    <span className='workspace-card__name'>{name || 'Workspace'}</span>
                    <span className='workspace-card__members'>{membersLabel}</span>
                    {description && (
                        <span className='workspace-card__description'>{description}</span>
                    )}
                </span>

                <span className='workspace-card__action' aria-hidden='true'>
                    <span className='workspace-card__launch'>Launch</span>
                    <svg
                        className='workspace-card__arrow'
                        width='20'
                        height='20'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    >
                        <path d='M4 12h16' />
                        <path d='M13 5l7 7-7 7' />
                    </svg>
                </span>
            </Link>

            {canDelete && (
                <div className='workspace-card__menu-wrapper'>
                    <button
                        type='button'
                        className='workspace-card__menu-btn'
                        aria-label={`Options for ${name || 'workspace'}`}
                        aria-haspopup='menu'
                        aria-expanded={isMenuOpen}
                        onClick={() => setIsMenuOpen((open) => !open)}
                    >
                        ⋮
                    </button>

                    {isMenuOpen && (
                        <div className='workspace-card__menu' role='menu'>
                            <button
                                type='button'
                                role='menuitem'
                                className='workspace-card__menu-item'
                                onClick={() => {
                                    setIsMenuOpen(false)
                                    setIsConfirmOpen(true)
                                }}
                            >
                                Delete workspace
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isConfirmOpen && (
                <ConfirmDialog
                    title={`Delete ${name || 'this workspace'}?`}
                    description='This permanently deletes the workspace, its channels, messages and memberships. This action cannot be undone.'
                    confirmLabel='Delete workspace'
                    requireText={name || ''}
                    onCancel={() => setIsConfirmOpen(false)}
                    onConfirm={async () => {
                        await deleteWorkspace(workspaceId)
                        setIsConfirmOpen(false)
                        onDeleted?.()
                    }}
                />
            )}
        </div>
    )
}

export default WorkspaceCard
