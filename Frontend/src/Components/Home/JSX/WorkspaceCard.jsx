import { Link } from 'react-router'
import '../CSS/WorkspaceCard.css'

/*
    One workspace row in the "Workspaces" card. The member count
    comes from the list of active members the backend returns next
    to the workspace. The avatar color is picked deterministically
    from the workspace name, Slack style.
*/
const AVATAR_COLORS = ['#36c5f0', '#2eb67d', '#ecb22e', '#e01e5a', '#611f69']

function avatarColor(name) {
    const text = String(name || '')
    let hash = 0
    for (let index = 0; index < text.length; index += 1) {
        hash = (hash * 31 + text.charCodeAt(index)) >>> 0
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function WorkspaceCard({ workspaceId, name, description, memberCount }) {
    const membersLabel = memberCount === 1 ? '1 member' : `${memberCount ?? 0} members`

    return (
        <Link
            className='workspace-card'
            to={`/workspace/${workspaceId}`}
        >
            <span
                className='workspace-card__avatar'
                style={{ backgroundColor: avatarColor(name) }}
                aria-hidden='true'
            >
                {name ? name.charAt(0).toUpperCase() : '#'}
            </span>

            <span className='workspace-card__info'>
                <span className='workspace-card__name'>{name || 'Workspace'}</span>
                <span className='workspace-card__members'>{membersLabel}</span>
                {description && (
                    <span className='workspace-card__description'>{description}</span>
                )}
            </span>

            <span className='workspace-card__arrow' aria-hidden='true'>
                <svg
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
