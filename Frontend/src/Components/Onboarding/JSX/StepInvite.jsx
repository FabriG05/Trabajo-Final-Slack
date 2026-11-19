import { useEffect, useState } from 'react'
import '../CSS/OnboardingSteps.css'
import '../CSS/StepInvite.css'

/*
    Step 3 of the onboarding wizard: invite teammates by email.
    The textarea accepts comma/space separated emails. "Next" is
    disabled until there is at least one valid email. The copy
    button copies the join link of the created workspace, which
    carries the workspace-level invite link token. "Skip this step"
    asks for confirmation before finishing the wizard without
    inviting anyone.
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
    const [skipConfirmOpen, setSkipConfirmOpen] = useState(false)

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

    // Close the "skip" confirmation with Escape, like a native dialog.
    useEffect(
        () => {
            if (!skipConfirmOpen) {
                return undefined
            }

            function handleKeyDown(event) {
                if (event.key === 'Escape') {
                    setSkipConfirmOpen(false)
                }
            }

            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        },
        [skipConfirmOpen]
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

                    <button
                        type='button'
                        className='step-invite__skip'
                        onClick={() => setSkipConfirmOpen(true)}
                        disabled={submitting}
                    >
                        Skip this step
                    </button>
                </div>
            </form>

            {skipConfirmOpen && (
                <div
                    className='step-invite__modal-backdrop'
                    role='presentation'
                    onClick={(event) => {
                        if (event.target === event.currentTarget) {
                            setSkipConfirmOpen(false)
                        }
                    }}
                >
                    <div
                        className='step-invite__modal'
                        role='dialog'
                        aria-modal='true'
                        aria-labelledby='skip-invite-title'
                    >
                        <button
                            type='button'
                            className='step-invite__modal-close'
                            onClick={() => setSkipConfirmOpen(false)}
                            aria-label='Close'
                        >
                            <svg
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                aria-hidden='true'
                            >
                                <path d='M6 6l12 12' />
                                <path d='M18 6L6 18' />
                            </svg>
                        </button>

                        <h3
                            className='step-invite__modal-title'
                            id='skip-invite-title'
                        >
                            Skip without inviting?
                        </h3>

                        <p className='step-invite__modal-text'>
                            Are you sure? Without someone else here,
                            you&rsquo;ll be missing out on what makes
                            Slack great, including:
                        </p>

                        <ul className='step-invite__benefits'>
                            <li className='step-invite__benefit'>
                                <svg
                                    className='step-invite__benefit-icon'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    aria-hidden='true'
                                >
                                    <path d='M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4-1L3 20l1.1-4.1a8.4 8.4 0 0 1-1.1-4.4 8.4 8.4 0 0 1 9-8.4 8.4 8.4 0 0 1 9 8.4Z' />
                                </svg>
                                Real-time messaging
                            </li>
                            <li className='step-invite__benefit'>
                                <svg
                                    className='step-invite__benefit-icon'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    aria-hidden='true'
                                >
                                    <path d='M4 14v-2a8 8 0 0 1 16 0v2' />
                                    <rect x='2' y='14' width='5' height='7' rx='2' />
                                    <rect x='17' y='14' width='5' height='7' rx='2' />
                                </svg>
                                Video calls
                            </li>
                            <li className='step-invite__benefit'>
                                <svg
                                    className='step-invite__benefit-icon'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    aria-hidden='true'
                                >
                                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z' />
                                    <path d='M14 2v6h6' />
                                    <path d='M8 13h8' />
                                    <path d='M8 17h5' />
                                </svg>
                                Document sharing
                            </li>
                        </ul>

                        <div className='step-invite__modal-actions'>
                            <button
                                type='button'
                                className='step-invite__modal-back'
                                onClick={() => setSkipConfirmOpen(false)}
                            >
                                Back
                            </button>
                            <button
                                type='button'
                                className='step-invite__modal-confirm'
                                onClick={onFinish}
                            >
                                Don&rsquo;t invite anyone
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StepInvite
