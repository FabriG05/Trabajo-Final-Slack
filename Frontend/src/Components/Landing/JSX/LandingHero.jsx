import { Link } from 'react-router'
import '../CSS/LandingHero.css'

/*
    Landing hero: huge black headline, short subtitle and the
    two calls to action of the original, followed by the hero
    demo video (compressed copy served from public/videos).
*/
function LandingHero() {
    return (
        <section className='landing-hero'>
            <h1 className='landing-hero__title'>
                All your people and AI agents working together
            </h1>

            <p className='landing-hero__subtitle'>
                Slack connects your team. Slackbot multiplies what they can do.
            </p>

            <div className='landing-hero__actions'>
                <Link to='/register' className='landing-hero__cta landing-hero__cta--primary'>
                    Get started
                </Link>
                <Link to='/pricing' className='landing-hero__cta landing-hero__cta--secondary'>
                    Find your subscription
                    <span className='landing-hero__arrow' aria-hidden='true'>→</span>
                </Link>
            </div>

            <div className='landing-hero__video-wrapper'>
                <video
                    className='landing-hero__video'
                    src='/videos/hero.mp4'
                    poster='/videos/hero-poster.jpg'
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            </div>
        </section>
    )
}

export default LandingHero
