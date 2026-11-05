import React from 'react'
import WorkspaceList from '../../Components/WorkspaceLists/WorkspaceLists'

function HomeScreeen() {
    return (
        <div>
            <h1>Welcome to Slack!</h1>
            <div>
                <h2>My Workspaces:</h2>
                <WorkspaceList />
            </div>
        </div>
    )
}

export default HomeScreeen
