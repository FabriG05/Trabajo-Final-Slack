import { Link } from 'react-router'
import { useSession } from '../../../Context/SessionContext'
import '../CSS/LandingCta.css'

/*
    Final purple call to action before the footer.
*/
function LandingCta() {
    const { signedIn } = useSession()

    return (
        <section className='cta-section'>
            <h2 className='cta-section__title'>
                See all you can accomplish in Slack
            </h2>

            <div className='cta-section__actions'>
                {signedIn ? (
                    <Link to='/home' className='cta-section__button cta-section__button--primary'>
                        Go to workspaces
                    </Link>
                ) : (
                    <Link to='/register' className='cta-section__button cta-section__button--primary'>
                        Get started
                    </Link>
                )}
                <Link to='/demo' className='cta-section__button cta-section__button--secondary'>
                    Request a demo
                </Link>
            </div>
        </section>
    )
}

export default LandingCta
