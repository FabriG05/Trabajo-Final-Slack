import { Link } from 'react-router'
import slackLogo from '../../../assets/slackLogo.svg'
import '../CSS/AuthCard.css'

/*
    Full-screen white wrapper with minimal chrome: a slim header
    (logo and a way back to the landing page), the centered card
    shared by the Log In and Register screens, and a slim footer.
*/
function AuthCard({ title, subtitle, footer, children }) {
    return (
        <div className='auth-screen'>
            <header className='auth-header'>
                <Link to='/' className='auth-header__brand' aria-label='Slack home'>
                    <img
                        className='auth-header__logo'
                        src={slackLogo}
                        alt='Slack'
                        height='26'
                    />
                </Link>

                <Link to='/' className='auth-header__back'>
                    <span className='auth-header__arrow' aria-hidden='true'>←</span>
                    Back to Slack
                </Link>
            </header>

            <main className='auth-card'>
                <h1 className='auth-card__title'>{title}</h1>

                {subtitle && <p className='auth-card__subtitle'>{subtitle}</p>}

                <div className='auth-card__body'>
                    {children}
                </div>

                {
                    footer
                    &&
                    <footer className='auth-card__footer'>
                        {footer.text}
                        {' '}
                        <Link className='auth-card__footer-link' to={footer.to}>
                            {footer.linkText}
                        </Link>
                    </footer>
                }
            </main>

            <footer className='auth-footer'>
                <p className='auth-footer__copy'>© 2026 Slack</p>

                <nav className='auth-footer__links' aria-label='Legal'>
                    <Link className='auth-footer__link' to='/terms'>Terms</Link>
                    <Link className='auth-footer__link' to='/privacy'>Privacy</Link>
                    <Link className='auth-footer__link' to='/contact'>Contact</Link>
                </nav>
            </footer>
        </div>
    )
}

export default AuthCard
