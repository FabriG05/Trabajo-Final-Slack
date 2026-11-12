import React from 'react'
import { useNavigate } from 'react-router'
import WorkspaceList from '../../../Components/WorkspaceLists/JSX/WorkspaceLists'
import WorkspaceCard from '../../../Components/Home/JSX/WorkspaceCard'
import CreateWorkspaceModal from '../../../Components/Home/JSX/CreateWorkspaceModal'
import useCreateWorkspace from '../../../Hooks/useCreateWorkspace'
import useWorkspaceList from '../../../Hooks/useWorkspaceList'
import slackLogo from '../../../assets/slackLogo.svg'
import '../CSS/HomeScreen.css'

function HomeScreeen() {
    const navigate = useNavigate()
    const {
        workspaces_error,
        workspaces_loading,
        reloadWorkspaces
    } = useWorkspaceList()
    const {
        create_loading,
        create_error,
        submitCreateWorkspace
    } = useCreateWorkspace(reloadWorkspaces)

    const [modalOpen, setModalOpen] = React.useState(false)

    function handleSignOut() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('authToken')
        navigate('/login')
    }

    async function handleCreateWorkspace(name, description) {
        const response = await submitCreateWorkspace(name, description)
        if (response) {
            setModalOpen(false)
        }
    }

    // The list hook already owns loading/error/empty rendering;
    // the grid of cards is rendered through a render prop so the
    // card layout stays in this screen.
    return (
        <div className='home-screen'>
            <header className='home-header'>
                <img
                    className='home-header__logo'
                    src={slackLogo}
                    alt='Slack'
                />
                <button
                    className='home-header__signout'
                    onClick={handleSignOut}
                >
                    Sign out
                </button>
            </header>

            <main className='home-content'>
                <div className='home-workspaces__head'>
                    <h1 className='home-workspaces__title'>My Workspaces</h1>
                    <button
                        className='home-workspaces__create'
                        onClick={() => setModalOpen(true)}
                    >
                        + Create a workspace
                    </button>
                </div>

                <WorkspaceList
                    renderLoading={() => (
                        <div className='home-workspaces__grid' aria-hidden='true'>
                            <div className='home-workspaces__skeleton' />
                            <div className='home-workspaces__skeleton' />
                            <div className='home-workspaces__skeleton' />
                        </div>
                    )}
                    renderError={(error, retry) => (
                        <div className='home-workspaces__state'>
                            <p className='home-workspaces__state-error'>Error: {error}</p>
                            <button
                                className='home-workspaces__retry'
                                onClick={retry}
                            >
                                Try again
                            </button>
                        </div>
                    )}
                    renderEmpty={() => (
                        <div className='home-workspaces__state'>
                            <h2 className='home-workspaces__empty-title'>
                                You don't have any workspace yet
                            </h2>
                            <p className='home-workspaces__empty-text'>
                                Create your first workspace to start collaborating with your team.
                            </p>
                            <button
                                className='home-workspaces__create home-workspaces__create--big'
                                onClick={() => setModalOpen(true)}
                            >
                                Create a workspace
                            </button>
                        </div>
                    )}
                    renderItems={(workspaces) => (
                        <div className='home-workspaces__grid'>
                            {workspaces.map((workspace) => (
                                <WorkspaceCard
                                    key={workspace.id}
                                    workspaceId={workspace.id}
                                    name={workspace.name}
                                    description={workspace.description}
                                    role={workspace.role}
                                />
                            ))}
                        </div>
                    )}
                />
            </main>

            <CreateWorkspaceModal
                open={modalOpen}
                submitting={create_loading}
                error={create_error}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateWorkspace}
            />
        </div>
    )
}

export default HomeScreeen
