import React from 'react'
import { useParams } from 'react-router'
import { WorkspaceProvider, useWorkspace } from '../../../Context/WorkspaceContext'
import WorkspaceTopBar from '../../../Components/WorkspaceView/JSX/WorkspaceTopBar'
import WorkspaceNav from '../../../Components/WorkspaceView/JSX/WorkspaceNav'
import WorkspaceSidebar from '../../../Components/WorkspaceView/JSX/WorkspaceSidebar'
import ChatArea from '../../../Components/WorkspaceView/JSX/ChatArea'
import ActivityView from '../../../Components/WorkspaceView/JSX/ActivityView'
import StarredMessagesView from '../../../Components/WorkspaceView/JSX/StarredMessagesView'
import DmPlaceholderView from '../../../Components/WorkspaceView/JSX/DmPlaceholderView'
import DirectoryView from '../../../Components/WorkspaceView/JSX/DirectoryView'
import ProfileView from '../../../Components/WorkspaceView/JSX/ProfileView'
import '../CSS/WorkspaceScreen.css'

/*
    WorkspaceScreen: main shell for an active Slack workspace.
    Provides WorkspaceContext to coordinate the TopBar, left Nav,
    channels/DMs Sidebar, and the central ChatArea.
*/
function WorkspaceScreenContent() {
    const { activeNavTab, activeDm } = useWorkspace()

    return (
        <div className='workspace-layout'>
            <WorkspaceTopBar />
            <div className='workspace-body'>
                <WorkspaceNav />
                <WorkspaceSidebar />
                {activeNavTab === 'dms' && (activeDm ? <ChatArea /> : <DmPlaceholderView />)}
                {activeNavTab === 'activity' && <ActivityView />}
                {activeNavTab === 'starred' && <StarredMessagesView />}
                {activeNavTab === 'directory' && <DirectoryView />}
                {activeNavTab === 'profile' && <ProfileView />}
                {!['dms', 'activity', 'starred', 'directory', 'profile'].includes(activeNavTab) && <ChatArea />}
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
