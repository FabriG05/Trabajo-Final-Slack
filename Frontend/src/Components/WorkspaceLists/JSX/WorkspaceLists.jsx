import useWorkspaceList from '../../../Hooks/useWorkspaceList'

/*
    Data component for the workspace list. Owns loading, error
    and empty states and delegates the actual rendering through
    render props, so screens decide how everything looks.

    Defaults provide a minimal fallback if no render prop is given.
*/
export default function WorkspaceList({
    renderLoading,
    renderError,
    renderEmpty,
    renderItems
}) {
    const {
        workspaces_error,
        workspaces_loading,
        workspaces_response,
        reloadWorkspaces
    } = useWorkspaceList()

    if (workspaces_loading) {
        return renderLoading
            ? renderLoading()
            : <span>Loading...</span>
    }

    if (workspaces_error) {
        return renderError
            ? renderError(workspaces_error, reloadWorkspaces)
            : (
                <div>
                    <span className='error-text'>Error: {workspaces_error}</span>
                    <button onClick={reloadWorkspaces}>Reload</button>
                </div>
            )
    }

    if (!workspaces_response || !workspaces_response.data) {
        const message = 'There was an error while getting the workspace list.'
        return renderError
            ? renderError(message, reloadWorkspaces)
            : (
                <div>
                    <span className='error-text'>Error: {message}</span>
                    <button onClick={reloadWorkspaces}>Reload</button>
                </div>
            )
    }

    // Each item is a workspace directly, carrying its list of
    // active members (name and role) under `members`.
    const obtainedWorkspaces = workspaces_response.data.obtainedWorkspaces || []

    if (obtainedWorkspaces.length === 0) {
        return renderEmpty
            ? renderEmpty()
            : <p>You haven't created any workspace.</p>
    }

    const workspaces = obtainedWorkspaces.map((workspace) => ({
        id: workspace._id,
        name: workspace.name,
        description: workspace.description,
        memberCount: workspace.members?.length ?? 0,
        photo: workspace.photo || workspace.photo_url || workspace.profile_photo || null
    })).filter((workspace) => workspace.id)

    return renderItems
        ? renderItems(workspaces)
        : (
            <div>
                {workspaces.map((item) => (
                    <div key={item.id}>
                        <a href={`/workspace/${item.id}`}>
                            {item.name || 'Workspace'}
                        </a>
                    </div>
                ))}
            </div>
        )
}
