import React from 'react'
import WorkspaceList from '../../Components/WorkspaceLists/WorkspaceLists'
import slackHeroIcon from '../../assets/SlackHeroIcon.svg'
import './HomeScreen.css'

function HomeScreeen() {
    return (
        <div className='home-screen'>
            {/* Hero: square Slack mark from the assets folder as the page's main visual. */}
            <header className='home-hero'>
                <img
                    className='home-hero__icon'
                    src={slackHeroIcon}
                    alt='Slack'
                />
                <h1 className='home-hero__title'>Welcome to Slack!</h1>
            </header>

            <div className='home-workspaces'>
                <h2>My Workspaces:</h2>
                <WorkspaceList />
            </div>
        </div>
    )
}

export default HomeScreeen
