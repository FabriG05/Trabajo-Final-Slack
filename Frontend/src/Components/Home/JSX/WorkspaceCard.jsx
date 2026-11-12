import { Link } from 'react-router'
import '../CSS/WorkspaceCard.css'

/*
    One workspace tile in the "My Workspaces" grid. The role
    comes from the membership the backend returns next to the
    workspace (Owner / Admin / User).
*/
function WorkspaceCard({ workspaceId, name, description, role }) {
    return (
        <Link
            className='workspace-card'
            to={`/workspace/${workspaceId}`}
        >
            <span className='workspace-card__avatar' aria-hidden='true'>
                {name ? name.charAt(0).toUpperCase() : '#'}
            </span>

            <span className='workspace-card__info'>
                <span className='workspace-card__name'>{name || 'Workspace'}</span>
                {description && (
                    <span className='workspace-card__description'>{description}</span>
                )}
            </span>

            {role && (
                <span className={`workspace-card__role workspace-card__role--${String(role).toLowerCase()}`}>
                    {role}
                </span>
            )}
        </Link>
    )
}

export default WorkspaceCard
