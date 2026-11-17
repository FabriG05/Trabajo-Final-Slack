import '../CSS/OnboardingProgress.css'

function OnboardingProgress({ currentStep, totalSteps = 3 }) {
    return (
        <div
            className='onboarding-progress'
            role='progressbar'
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={currentStep}
            aria-label={`Step ${currentStep} of ${totalSteps}`}
        >
            {Array.from({ length: totalSteps }, (_, index) => {
                const step = index + 1
                const isHighlighted = step <= currentStep

                return (
                    <span
                        key={step}
                        className={`onboarding-progress__pill${isHighlighted
                                ? ' onboarding-progress__pill--highlighted'
                                : ''
                            }`}
                    />
                )
            })}
        </div>
    )
}

export default OnboardingProgress
