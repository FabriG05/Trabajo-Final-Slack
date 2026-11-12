import { Link } from 'react-router'
import slackLogo from '../../../assets/slackLogo.svg'
import '../CSS/AuthCard.css'

/*
    Full-screen aubergine background with a centered white card.
    Shared shell used by the Log In and Register screens.
*/
function AuthCard({ title, subtitle, footer, children }) {
    return (
        <div className='auth-screen'>
            <main className='auth-card'>
                <img
                    className='auth-card__logo'
                    src={slackLogo}
                    alt='Slack'
                    height='26'
                />

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
        </div>
    )
}

export default AuthCard
