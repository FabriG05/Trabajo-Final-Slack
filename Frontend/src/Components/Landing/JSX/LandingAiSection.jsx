import { useRef, useState } from 'react'
import '../CSS/LandingAiSection.css'

/*
    Purple "AI and agents" section: feature pills on the left and
    the skills demo video on the right. The pause control from
    the original actually pauses / resumes the video.
*/
const FEATURE_PILLS = [
    { label: 'Turn data into action with Slackforce Surfaces', isNew: true },
    { label: 'Automate tasks using Slackbot skills', isNew: true },
    { label: 'Build together in channels with Slack Code', isNew: true },
    { label: 'Track and update sales pipelines with Slack CRM', isNew: false },
    { label: 'Get fast answers with Claude', isNew: false }
]

function LandingAiSection() {
    const videoRef = useRef(null)
    const [paused, setPaused] = useState(false)

    function togglePause() {
        const video = videoRef.current
        if (!video) {
            return
        }

        if (video.paused) {
            video.play()
            setPaused(false)
        }
        else {
            video.pause()
            setPaused(true)
        }
    }

    return (
        <section className='ai-section'>
            <h2 className='ai-section__title'>
                Reimagine what's possible with AI and agents
            </h2>
            <p className='ai-section__subtitle'>
                AI in Slack delivers action, not just answers. It's tapped into the
                full context of your business, making every connected app and agent
                smarter in the process.
            </p>

            <div className='ai-section__content'>
                <div className='ai-section__pills'>
                    {FEATURE_PILLS.map((pill) => (
                        <div key={pill.label} className='ai-pill'>
                            <span className='ai-pill__label'>{pill.label}</span>
                            {pill.isNew && <span className='ai-pill__badge'>New</span>}
                        </div>
                    ))}
                </div>

                <div className='ai-section__demo'>
                    <video
                        ref={videoRef}
                        className='ai-section__video'
                        src='/videos/skills.mp4'
                        autoPlay
                        muted
                        loop
                        playsInline
                    />

                    <button
                        className='ai-section__pause'
                        type='button'
                        onClick={togglePause}
                    >
                        <span className='ai-section__pause-button' aria-hidden='true'>
                            {paused
                                ? <span className='ai-section__pause-play'>▶</span>
                                : (
                                    <>
                                        <span />
                                        <span />
                                    </>
                                )}
                        </span>
                        {paused ? 'Play animation' : 'Pause animation'}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default LandingAiSection
