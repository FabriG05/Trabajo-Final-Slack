import React from 'react'
import { useNavigate } from 'react-router'
import LandingNavbar from '../../../Components/Landing/JSX/LandingNavbar'
import LandingFooter from '../../../Components/Landing/JSX/LandingFooter'
import WorkspaceList from '../../../Components/WorkspaceLists/JSX/WorkspaceLists'
import WorkspaceCard from '../../../Components/Home/JSX/WorkspaceCard'
import '../CSS/HomeScreen.css'

function HomeScreeen() {
    const navigate = useNavigate()

    function handleSignOut() {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('authToken')
        navigate('/login')
    }

    // The "create a workspace" action lives on its own onboarding
    // screen; this screen only links to it.
    function handleCreateWorkspace() {
        navigate('/create-workspace')
    }

    // Slack-style welcome back page: the landing navbar (with
    // Sign out), a purple hero closed by a gentle wave, the
    // workspace card floating over it and the landing footer at
    // the bottom. The list hook owns loading/error/empty states,
    // rendered through render props so everything stays inside
    // the card.
    return (
        <div className='home-screen'>
            <LandingNavbar
                signedIn
                onSignOut={handleSignOut}
            />

            <section className='home-hero'>
                <h1 className='home-hero__title'>Welcome back!</h1>
                <p className='home-hero__subtitle'>
                    Choose a workspace to get started.
                </p>
            </section>

            {/* Gentle wave closing the hero: the path starts at the
                top edge, so the purple fills down to the curve and
                merges seamlessly with the hero above. */}
            <svg
                className='home-hero__wave'
                viewBox='0 0 1440 60'
                preserveAspectRatio='none'
                aria-hidden='true'
            >
                <path d='M0,0 L1440,0 L1440,22 C1180,48 880,8 560,26 C360,38 140,34 0,14 Z' />
            </svg>

            <main className='home-content'>
                <div className='home-workspaces-card'>
                    <div className='home-workspaces-card__tabs'>
                        <span className='home-workspaces-card__tab'>
                            Workspaces
                        </span>
                    </div>

                    <div className='home-workspaces-card__body'>
                        <WorkspaceList
                            renderLoading={() => (
                                <div aria-hidden='true'>
                                    <div className='home-workspaces__skeleton' />
                                    <div className='home-workspaces__skeleton' />
                                    <div className='home-workspaces__skeleton' />
                                </div>
                            )}
                            renderError={(error, retry) => (
                                <div className='home-workspaces__state'>
                                    <p className='home-workspaces__state-error'>
                                        Error: {error}
                                    </p>
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
                                        Create your first workspace to start
                                        collaborating with your team.
                                    </p>
                                    <button
                                        className='home-workspaces__create home-workspaces__create--big'
                                        onClick={handleCreateWorkspace}
                                    >
                                        Create a workspace
                                    </button>
                                </div>
                            )}
                            renderItems={(workspaces) => (
                                <>
                                    <p className='home-workspaces-card__label'>
                                        Ready to get started
                                    </p>
                                    <div className='home-workspaces-card__list'>
                                        {workspaces.map((workspace) => (
                                            <WorkspaceCard
                                                key={workspace.id}
                                                workspaceId={workspace.id}
                                                name={workspace.name}
                                                description={workspace.description}
                                                memberCount={workspace.memberCount}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        />
                    </div>

                    <div className='home-workspaces-card__footer'>
                        <button
                            className='home-workspaces-card__create-link'
                            onClick={handleCreateWorkspace}
                        >
                            Create a new workspace
                        </button>
                        <p className='home-workspaces-card__hint'>
                            Can't find your workspace? Try another email address
                        </p>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}

export default HomeScreeen
