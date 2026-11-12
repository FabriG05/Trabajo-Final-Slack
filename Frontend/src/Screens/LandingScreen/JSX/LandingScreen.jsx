import LandingNavbar from '../../../Components/Landing/JSX/LandingNavbar'
import LandingHero from '../../../Components/Landing/JSX/LandingHero'
import LandingAiSection from '../../../Components/Landing/JSX/LandingAiSection'
import LandingNews from '../../../Components/Landing/JSX/LandingNews'
import LandingStats from '../../../Components/Landing/JSX/LandingStats'
import LandingSocialProof from '../../../Components/Landing/JSX/LandingSocialProof'
import LandingCta from '../../../Components/Landing/JSX/LandingCta'
import LandingFooter from '../../../Components/Landing/JSX/LandingFooter'
import '../CSS/LandingScreen.css'

/*
    Public landing page, section by section from the slack.com
    original: navbar, hero, AI section, news, stats, closing
    CTA and footer.
*/
function LandingScreen() {
    return (
        <div className='landing-screen'>
            <LandingNavbar />
            <LandingHero />
            <LandingAiSection />
            <LandingNews />
            <LandingStats />
            <LandingSocialProof />
            <LandingCta />
            <LandingFooter />
        </div>
    )
}

export default LandingScreen
