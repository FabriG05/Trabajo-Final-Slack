import { Link } from 'react-router'
import WorkspacePicPH from '../../../assets/WorkspacePicPH.png'
import WorkspacePicPH2 from '../../../assets/WorkspacePicPH2.png'
import '../CSS/WorkspaceCard.css'

/*
    One workspace row in the "Workspaces" card. The member count
    comes from the list of active members the backend returns next
    to the workspace. When the workspace has no photo, one of the
    two default placeholders is picked deterministically from its
    id, so each workspace keeps the same picture between reloads.
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

function WorkspaceCard({ workspaceId, name, description, memberCount, photo }) {
    const membersLabel = memberCount === 1 ? '1 member' : `${memberCount ?? 0} members`
    const avatarSrc = photo || placeholderFor(workspaceId)

    return (
        <Link
            className='workspace-card'
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
    )
}

export default WorkspaceCard
