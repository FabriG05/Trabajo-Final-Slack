import { Link } from 'react-router'
import slackHeroIcon from '../../../assets/SlackHeroIcon.svg'
import '../CSS/PlaceholderScreen.css'

/*
    Generic stub for navbar/footer links whose real screen does
    not exist yet. Every unknown route falls back to this page,
    so placeholder navigation never shows a blank screen.
*/
function PlaceholderScreen() {
    return (
        <div className='placeholder-screen'>
            <img
                className='placeholder-screen__icon'
                src={slackHeroIcon}
                alt=''
                aria-hidden='true'
            />
            <h1 className='placeholder-screen__title'>This page is coming soon</h1>
            <p className='placeholder-screen__text'>
                We are still building this section. In the meantime, head back to Slack.
            </p>
            <Link to='/' className='placeholder-screen__link'>
                Back to Slack
            </Link>
        </div>
    )
}

export default PlaceholderScreen
