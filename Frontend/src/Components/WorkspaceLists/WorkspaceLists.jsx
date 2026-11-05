import React from 'react'
import { Link } from 'react-router'
import useWorkspaceList from '../../Hooks/useWorkspaceList'

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

        if (workspaces_error) {
            return (
                <div>
                    <span className='error-text'>Error: {workspaces_error}</span>
                    <button onClick={reloadWorkspaces}>Reload</button>
                </div>
            )
        }

            if (!workspaces_response || !workspaces_response.data) {
                return (
                    <div>
                        <span className='error-text'>Error: There was an error while getting the workspace list.</span>
                        <button onClick={reloadWorkspaces}>Reload</button>
                    </div>
                )
            }

                const workspaces = workspaces_response.data.workspaces || workspaces_response.data.obtainedWorkspaces || []

                if (workspaces.length === 0) {
                    return <p>You haven't created any workspace.</p>
                }

                        return (
                        <div>
                            {workspaces.map((item) => {
                                const workspace = item.FK_id_workspace || item
                                const workspaceId = workspace._id || workspace.id || item._id
                                const workspaceName = workspace.name || workspace.nombre || 'Workspace'

                                return (
                                    <div key={workspaceId}>
                                        <Link to={`/workspace/${workspaceId}`}>
                                            {workspaceName}
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                        )
}
