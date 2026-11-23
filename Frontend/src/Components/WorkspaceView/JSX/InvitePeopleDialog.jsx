import React, { useState } from 'react'
import { useWorkspace } from '../../../Context/WorkspaceContext'
import useInviteMembers from '../../../Hooks/useInviteMembers'
import '../CSS/WorkspaceAdminMenu.css'
import '../CSS/CreateMoreMenu.css'

function InvitePeopleDialog({ onClose }) {
    const { workspaceId } = useWorkspace()
    const { submitInviteMembers, invitations_loading, invitations_error } = useInviteMembers()
    const [inviteEmails, setInviteEmails] = useState('')
    const [inviteResult, setInviteResult] = useState(null)

    async function handleInvite(event) {
        event.preventDefault()
        setInviteResult(null)

        const emails = inviteEmails
            .split(/[\n,; ]+/)
            .map((email) => email.trim())
            .filter(Boolean)

        if (emails.length === 0) {
            return
        }

        const response = await submitInviteMembers(workspaceId, emails)
        const summary = response?.data?.invitationSummary

        if (summary) {
            setInviteResult(summary)
            setInviteEmails('')
        }
    }

    return (
        <div className='workspace-admin-dialog__overlay' onMouseDown={(event) => event.target === event.currentTarget && !invitations_loading && onClose()}>
            <div className='workspace-admin-dialog' role='dialog' aria-modal='true' aria-label='Invite people'>
                <h2 className='workspace-admin-dialog__title'>Invite people</h2>
                <form onSubmit={handleInvite}>
                    <label className='workspace-admin-dialog__label' htmlFor='invite-emails-dialog'>Email addresses</label>
                    <textarea
                        id='invite-emails-dialog'
                        className='workspace-admin-dialog__input workspace-admin-dialog__textarea'
                        value={inviteEmails}
                        onChange={(event) => setInviteEmails(event.target.value)}
                        placeholder='name@example.com, other@example.com'
                        rows={4}
                        disabled={invitations_loading}
                        autoFocus
                    />
                    {invitations_error && <p className='workspace-admin-dialog__error' role='alert'>{invitations_error.message || 'Could not send invitations.'}</p>}
                    {inviteResult && (
                        <div className='create-more-menu__invite-result'>
                            {inviteResult.invited?.length > 0 && <p>Invited: {inviteResult.invited.join(', ')}</p>}
                            {inviteResult.already_members?.length > 0 && <p>Already members: {inviteResult.already_members.join(', ')}</p>}
                            {inviteResult.email_failed?.length > 0 && <p>Email failed: {inviteResult.email_failed.join(', ')}</p>}
                        </div>
                    )}
                    <div className='workspace-admin-dialog__actions'>
                        <button type='button' className='workspace-admin-dialog__btn' onClick={onClose} disabled={invitations_loading}>Close</button>
                        <button type='submit' className='workspace-admin-dialog__btn workspace-admin-dialog__btn--primary' disabled={invitations_loading || !inviteEmails.trim()}>
                            {invitations_loading ? 'Sending…' : 'Send invites'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InvitePeopleDialog
