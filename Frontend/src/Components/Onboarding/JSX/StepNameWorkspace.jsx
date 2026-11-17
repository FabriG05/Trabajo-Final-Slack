import '../CSS/OnboardingSteps.css'
import '../CSS/StepNameWorkspace.css'

const NAME_MAX_LENGTH = 50

function StepNameWorkspace({
    value,
    onChange,
    submitting = false,
    error = null,
    onSubmit
}) {
    const remaining = NAME_MAX_LENGTH - value.length

    function handleSubmit(event) {
        event.preventDefault()
        onSubmit()
    }

    return (
        <div className='onboarding-step'>
            <h2 className='onboarding-step__title'>
                Name your Slack workspace
            </h2>
            <p className='onboarding-step__subtitle'>
                Choose something that your team will recognise, such as the
                name of your company or team. You can always update it later.
            </p>

            <form
                className='onboarding-step__form'
                onSubmit={handleSubmit}
            >
                <div className='onboarding-step__field onboarding-step__field--name'>
                    <input
                        className='onboarding-step__input'
                        id='workspace-name'
                        name='workspaceName'
                        type='text'
                        value={value}
                        onChange={onChange}
                        disabled={submitting}
                        maxLength={NAME_MAX_LENGTH}
                        autoComplete='off'
                        autoFocus
                    />
                    <span className='onboarding-step__counter'>
                        {remaining}
                    </span>
                </div>

                {error && (
                    <p
                        className='onboarding-step__error'
                        role='alert'
                    >
                        {error}
                    </p>
                )}

                <button
                    type='submit'
                    className='onboarding-step__next'
                    disabled={submitting || value.trim().length === 0}
                >
                    {submitting ? 'Next...' : 'Next'}
                </button>
            </form>
        </div>
    )
}

export default StepNameWorkspace
