import { useEffect, useState } from 'react'
import '../CSS/OnboardingSteps.css'
import '../CSS/StepInvite.css'

/*
    Step 3 of the onboarding wizard: invite teammates by email.
    The textarea accepts comma/space separated emails. "Next" is
    disabled until there is at least one valid email. The copy
    button copies the join link of the created workspace, which
    carries the workspace-level invite link token.
*/
function StepInvite({
    value,
    onChange,
    workspaceId,
    inviteLinkToken,
    submitting = false,
    error = null,
    invitationSummary = null,
    onFinish,
    onSubmit
}) {
    const [invalidEmails, setInvalidEmails] = useState([])
    const [copied, setCopied] = useState(false)

    // Rebuild the button label once the "copied" feedback ends.
    useEffect(
        () => {
            if (!copied) {
                return undefined
            }

            const timer = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timer)
        },
        [copied]
    )

    function parseEmails(rawValue) {
        return rawValue
            .split(/[,;\s]+/)
            .map((email) => email.trim().toLowerCase())
            .filter((email) => email.length > 0)
    }

    const emails = parseEmails(value)
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const hasValidEmail = emails.some((email) => EMAIL_REGEX.test(email))

    async function handleCopyLink() {
        const inviteLink =
            `${window.location.origin}/workspace/${workspaceId}/join?token=${inviteLinkToken}`

        try {
            await navigator.clipboard.writeText(inviteLink)
            setCopied(true)
        }
        catch {
            setCopied(false)
        }
    }

    function handleSubmit(event) {
        event.preventDefault()

        const invalid = emails.filter((email) => !EMAIL_REGEX.test(email))
        setInvalidEmails(invalid)

        if (invalid.length > 0 || emails.length === 0) {
            return
        }

        onSubmit(emails)
    }

    if (invitationSummary) {
        return (
            <div className='onboarding-step'>
                <h2 className='onboarding-step__title'>Invitations sent</h2>
                <p className='onboarding-step__subtitle'>
                    Each invited email received a message with a join link.
                </p>

                <div className='step-invite__summary'>
                    {invitationSummary.invited?.length > 0 && (
                        <p className='step-invite__summary-row step-invite__summary-row--ok'>
                            Invited: {invitationSummary.invited.join(', ')}
                        </p>
                    )}

                    {invitationSummary.email_failed?.length > 0 && (
                        <p className='step-invite__summary-row step-invite__summary-row--warn'>
                            Invited, but the email could not be sent: {invitationSummary.email_failed.join(', ')}
                        </p>
                    )}

                    {invitationSummary.already_members?.length > 0 && (
                        <p className='step-invite__summary-row step-invite__summary-row--warn'>
                            Already invited or members: {invitationSummary.already_members.join(', ')}
                        </p>
                    )}

                    {invitationSummary.not_found?.length > 0 && (
                        <p className='step-invite__summary-row step-invite__summary-row--warn'>
                            Could not be invited: {invitationSummary.not_found.join(', ')}
                        </p>
                    )}
                </div>

                <div className='step-invite__actions'>
                    <button
                        type='button'
                        className='onboarding-step__next'
                        onClick={onFinish}
                    >
                        Go to your workspaces
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='onboarding-step'>
            <h2 className='onboarding-step__title'>
                Invite your teammates
            </h2>
            <p className='onboarding-step__subtitle'>
                Slack works better with more people. Add your core
                collaborators.
            </p>

            <form
                className='onboarding-step__form'
                onSubmit={handleSubmit}
            >
                <div className='step-invite__head'>
                    <p className='step-invite__label'>
                        Add teammate by email address
                    </p>
                </div>

                <textarea
                    className='step-invite__textarea'
                    id='invite-emails'
                    name='inviteEmails'
                    value={value}
                    onChange={onChange}
                    disabled={submitting}
                    placeholder='Example ellis@gmail.com, maria@gmail.com'
                    rows={4}
                    autoFocus
                />

                {invalidEmails.length > 0 && (
                    <p
                        className='onboarding-step__error'
                        role='alert'
                    >
                        Please enter valid email addresses: {invalidEmails.join(', ')}
                    </p>
                )}

                {error && (
                    <p
                        className='onboarding-step__error'
                        role='alert'
                    >
                        {error}
                    </p>
                )}

                <div className='step-invite__actions'>
                    <button
                        type='submit'
                        className='onboarding-step__next'
                        disabled={submitting || !hasValidEmail}
                    >
                        {submitting ? 'Inviting...' : 'Next'}
                    </button>

                    <button
                        type='button'
                        className='step-invite__copy'
                        onClick={handleCopyLink}
                        disabled={submitting || !inviteLinkToken}
                    >
                        <svg
                            className='step-invite__copy-icon'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <path d='M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z' />
                        </svg>
                        {copied ? 'Link copied!' : 'Copy invitation link'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default StepInvite
