import React from 'react'
import { useParams } from 'react-router'
import { WorkspaceProvider, useWorkspace } from '../../../Context/WorkspaceContext'
import WorkspaceTopBar from '../../../Components/WorkspaceView/JSX/WorkspaceTopBar'
import WorkspaceNav from '../../../Components/WorkspaceView/JSX/WorkspaceNav'
import WorkspaceSidebar from '../../../Components/WorkspaceView/JSX/WorkspaceSidebar'
import ChatArea from '../../../Components/WorkspaceView/JSX/ChatArea'
import DirectMessagesView from '../../../Components/WorkspaceView/JSX/DirectMessagesView'
import ActivityView from '../../../Components/WorkspaceView/JSX/ActivityView'
import '../CSS/WorkspaceScreen.css'

/*
    WorkspaceScreen: main shell for an active Slack workspace.
    Provides WorkspaceContext to coordinate the TopBar, left Nav,
    channels/DMs Sidebar, and the central ChatArea.
*/
function WorkspaceScreenContent() {
    const { activeNavTab } = useWorkspace()

    return (
        <div className='workspace-layout'>
            <WorkspaceTopBar />
            <div className='workspace-body'>
                <WorkspaceNav />
                <WorkspaceSidebar />
                {activeNavTab === 'dms' && <DirectMessagesView />}
                {activeNavTab === 'activity' && <ActivityView />}
                {activeNavTab !== 'dms' && activeNavTab !== 'activity' && <ChatArea />}
            </div>
        </div>
    )
}

function WorkspaceScreen() {
    const { workspaceId } = useParams()

    return (
        <WorkspaceProvider key={workspaceId} workspaceId={workspaceId}>
            <WorkspaceScreenContent />
        </WorkspaceProvider>
    )
}

export default WorkspaceScreen
