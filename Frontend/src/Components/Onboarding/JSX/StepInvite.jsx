import { useEffect, useState } from 'react'
import '../CSS/OnboardingSteps.css'
import '../CSS/StepInvite.css'

/*
    Step 3 of the onboarding wizard: invite teammates by email.
    The textarea accepts comma/space separated emails. "Next" is
    disabled until there is at least one valid email. The copy
    button copies a join link for the created workspace.
*/
function StepInvite({
    value,
    onChange,
    workspaceId,
    submitting = false,
    error = null,
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
        const inviteLink = `${window.location.origin}/workspace/${workspaceId}/join`

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
                    <button
                        type='button'
                        className='step-invite__google'
                        tabIndex={-1}
                        title='Not available in this demo'
                    >
                        <svg
                            className='step-invite__google-icon'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <path
                                fill='#4285F4'
                                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                            />
                            <path
                                fill='#34A853'
                                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                            />
                            <path
                                fill='#FBBC05'
                                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                            />
                            <path
                                fill='#EA4335'
                                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                            />
                        </svg>
                        Add from Google Contacts
                    </button>
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
                        disabled={submitting}
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
