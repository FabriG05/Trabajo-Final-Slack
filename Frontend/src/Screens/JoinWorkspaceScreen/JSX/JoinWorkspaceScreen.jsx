import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { joinWorkspace } from '../../../Services/WorkSpaceService'
import '../CSS/JoinWorkspaceScreen.css'

/*
    Target of the workspace invitation links (the "copy invitation link"
    button and the invitation emails):

        /workspace/:workspaceId/join?token=<invitation token>

    The token is either the workspace-level invite link token, the
    personal token of a pending invitation, or the token of an invitation
    for an email without an account. A logged-in user joins the
    workspace right away; a guest chooses between logging in (they come
    back to this link) and creating an account.
*/
function JoinWorkspaceScreen() {
    const { workspaceId } = useParams()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const location = useLocation()
    const joinCalled = useRef(false)

    const invitationToken = searchParams.get('token')
    const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')

    const [state, setState] = useState(
        !authToken
            ? 'guest'
            : !invitationToken
                ? 'missing_token'
                : 'joining'
    )
    const [workspaceName, setWorkspaceName] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    // Where to come back after logging in: this very link.
    const joinPath = location.pathname + location.search

    useEffect(
        () => {
            if (state !== 'joining' || joinCalled.current) {
                return undefined
            }

            joinCalled.current = true

            async function performJoin() {
                try {
                    const response = await joinWorkspace(workspaceId, invitationToken)
                    setWorkspaceName(response.data.joinSummary.workspace_name)
                    setState('joined')
                }
                catch (error) {
                    setErrorMessage(error.message)
                    setState('error')
                }
            }

            performJoin()
            return undefined
        },
        [state, workspaceId, invitationToken]
    )

    return (
        <div className='join-workspace-screen'>
            <div className='join-workspace-card'>
                {state === 'guest' && (
                    <>
                        <h1 className='join-workspace-card__title'>Log in to join</h1>
                        <p className='join-workspace-card__message'>
                            To join this workspace, log in with the email address the
                            invitation was sent to, or create an account if you do not
                            have one yet. Right after, open this invitation link again.
                        </p>
                        <div className='join-workspace-card__actions'>
                            <Link
                                className='join-workspace-card__button'
                                to='/login'
                                state={{ redirectTo: joinPath }}
                            >
                                Log in
                            </Link>
                            <Link
                                className='join-workspace-card__button'
                                to='/register'
                            >
                                Create account
                            </Link>
                        </div>
                    </>
                )}

                {state === 'joining' && (
                    <>
                        <h1 className='join-workspace-card__title'>Joining workspace...</h1>
                        <p className='join-workspace-card__message'>
                            We are processing your invitation, please wait a moment.
                        </p>
                    </>
                )}

                {state === 'joined' && (
                    <>
                        <h1 className='join-workspace-card__title'>Welcome to {workspaceName}!</h1>
                        <p className='join-workspace-card__message'>
                            You joined the workspace successfully. You will find it in your
                            workspace list.
                        </p>
                        <div className='join-workspace-card__actions'>
                            <Link className='join-workspace-card__button' to='/home'>
                                Go to your workspaces
                            </Link>
                        </div>
                    </>
                )}

                {state === 'missing_token' && (
                    <>
                        <h1 className='join-workspace-card__title'>Invalid invitation link</h1>
                        <p className='join-workspace-card__message'>
                            This link does not carry an invitation token. Ask for a new
                            invitation link.
                        </p>
                        <div className='join-workspace-card__actions'>
                            <Link className='join-workspace-card__button' to='/home'>
                                Go to your workspaces
                            </Link>
                        </div>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <h1 className='join-workspace-card__title'>We could not join the workspace</h1>
                        <p className='join-workspace-card__message'>{errorMessage}</p>
                        <div className='join-workspace-card__actions'>
                            <Link className='join-workspace-card__button' to='/home'>
                                Go to your workspaces
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default JoinWorkspaceScreen
