import useWorkspaceList from "../../Hooks/useWorkspaceList";

export default function WorkspaceList() {

    const {
        workspaces_error,
        workspaces_loading,
        workspaces_response,
        reloadWorkspaces
    } = useWorkspaceList()



    if (workspaces_loading) {
        return <span>Loading...</span>
    }
    else if (workspaces_error) {
        return <div>
            <span className='error-text'>Error: {workspaces_error}</span>
            <button onClick={reloadWorkspaces}> Reload </button>
        </div>
    }
    else if (!workspaces_response) {
        return <div>
            <span className='error-text'>Error: There was an error while getting the workspace list.</span>
            <button onClick={reloadWorkspaces}> Reload </button>
        </div>
    }
    else if (workspaces_response.data.workspaces.length === 0) {
        return <p>You haven't created any workspace.</p>
    }
    else {
        return <div>
            {workspaces_response.data.workspaces.map((workspace) => (
                <Link key={workspace.id} to={`/workspace/${workspace._id}`}>
                    {workspace.nombre}
                </Link>
            ))}
        </div>
    }
}