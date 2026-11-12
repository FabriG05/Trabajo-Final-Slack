import { Link } from 'react-router'
import slackHeroIcon from '../../../assets/SlackHeroIcon.svg'
import slugify from '../../../Utils/slugify'
import '../CSS/LandingFooter.css'

/*
    White footer copied from the original: region switcher and
    social icons on top, then the Slack mark and the link
    columns. Each link routes to its own placeholder path
    (caught by the router's fallback screen) until the real
    section exists.
*/
const LINK_GROUPS = {
    product: [
        'Watch demo',
        'Pricing',
        'Paid vs Free',
        'Accessibility',
        'Featured releases',
        'Change log',
        'Status'
    ],
    whySlack: [
        'Slack vs email',
        'Slack vs Teams',
        'Enterprise',
        'Small business',
        'Productivity',
        'Task management',
        'Scale',
        'Trust'
    ],
    features: [
        'Channels',
        'Slack Connect',
        'Workflow Builder',
        'Messaging',
        'Huddles',
        'Canvas',
        'Lists',
        'Clips',
        'Apps & Integrations',
        'File sharing',
        'Slack AI',
        'Agentforce',
        'Enterprise search',
        'Security',
        'Enterprise Key Management',
        'Slack Atlas',
        'See all features'
    ],
    solutions: [
        'Frontline',
        'Engineering',
        'IT',
        'Customer service',
        'Sales',
        'Project management',
        'Marketing',
        'Security',
        'Manufacturing, auto and energy',
        'Technology',
        'Media',
        'Financial services',
        'Retail',
        'Public sector',
        'Education',
        'Health and life sciences',
        'See all solutions'
    ],
    resources: [
        'Help Centre',
        "What's new",
        'Resources library',
        'Slack blog',
        'Community',
        'Customer stories',
        'Events',
        'Developers',
        'Partner programme',
        'Partner offers',
        'Slack Marketplace',
        'Slack Certified'
    ],
    company: [
        'About us',
        'News',
        'Media kit',
        'Brand centre',
        'Careers',
        'Slack shop',
        'Engineering blog',
        'Design blog',
        'Contact us'
    ]
}

function GlobeIcon() {
    return (
        <svg
            width='18'
            height='18'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            aria-hidden='true'
        >
            <circle cx='12' cy='12' r='9' />
            <path d='M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18' />
        </svg>
    )
}

const SOCIAL_ICONS = [
    {
        label: 'LinkedIn',
        path: 'M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z',
        filled: true
    },
    {
        label: 'Instagram',
        path: null
    },
    {
        label: 'Facebook',
        path: 'M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8v3h2.5v7h3z',
        filled: true
    },
    {
        label: 'X',
        path: 'M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L2 3h6.4l4.4 5.9L17.8 3zm-1.1 16.1h1.7L7.4 4.8H5.6l11.1 14.3z',
        filled: true
    },
    {
        label: 'YouTube',
        path: 'M22.5 7.2a2.8 2.8 0 0 0-2-2C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 4.8 2.8 2.8 0 0 0 2 2c1.6.4 8.5.4 8.5.4s6.9 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-4.8zM9.8 15.5v-7l6 3.5-6 3.5z',
        filled: true
    },
    {
        label: 'TikTok',
        path: 'M16.6 3c.4 2 1.8 3.6 3.9 3.9v3.1c-1.5 0-2.9-.5-3.9-1.3v6.1c0 3.4-2.7 6.2-6.2 6.2s-6.2-2.8-6.2-6.2 2.8-6.2 6.2-6.2c.3 0 .7 0 1 .1v3.3c-.3-.1-.7-.2-1-.2-1.6 0-3 1.3-3 3s1.4 3 3 3 3-1.4 3-3V3h3.2z',
        filled: true
    }
]

function SocialIcon({ icon }) {
    // Instagram is stroke-based; the rest are filled paths.
    if (!icon.path) {
        return (
            <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                aria-hidden='true'
            >
                <rect x='3' y='3' width='18' height='18' rx='5' />
                <circle cx='12' cy='12' r='4' />
                <circle cx='17.2' cy='6.8' r='1.1' fill='currentColor' stroke='none' />
            </svg>
        )
    }

    return (
        <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
            <path d={icon.path} />
        </svg>
    )
}

function FooterLinkGroup({ title, links }) {
    return (
        <div className='landing-footer__group'>
            <h3 className='landing-footer__group-title'>{title}</h3>
            <ul className='landing-footer__list'>
                {links.map((label) => (
                    <li key={label}>
                        <Link className='landing-footer__link' to={`/${slugify(label)}`}>
                            {label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function LandingFooter() {
    return (
        <footer className='landing-footer'>
            <div className='landing-footer__container'>
                <div className='landing-footer__top'>
                    <button className='landing-footer__region' type='button'>
                        <GlobeIcon />
                        Change region
                        <span className='landing-footer__caret' aria-hidden='true'>▾</span>
                    </button>

                    <div className='landing-footer__socials'>
                        {SOCIAL_ICONS.map((icon) => (
                            <a
                                key={icon.label}
                                className='landing-footer__social'
                                href='#'
                                aria-label={icon.label}
                            >
                                <SocialIcon icon={icon} />
                            </a>
                        ))}
                    </div>
                </div>

                <hr className='landing-footer__divider' />

                <div className='landing-footer__columns'>
                    <div className='landing-footer__brand'>
                        <img src={slackHeroIcon} alt='Slack' />
                    </div>

                    <div className='landing-footer__col'>
                        <FooterLinkGroup title='Product' links={LINK_GROUPS.product} />
                        <FooterLinkGroup title='Why Slack?' links={LINK_GROUPS.whySlack} />
                    </div>

                    <div className='landing-footer__col'>
                        <FooterLinkGroup title='Features' links={LINK_GROUPS.features} />
                    </div>

                    <div className='landing-footer__col'>
                        <FooterLinkGroup title='Solutions' links={LINK_GROUPS.solutions} />
                    </div>

                    <div className='landing-footer__col'>
                        <FooterLinkGroup title='Resources' links={LINK_GROUPS.resources} />
                    </div>

                    <div className='landing-footer__col'>
                        <FooterLinkGroup title='Company' links={LINK_GROUPS.company} />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default LandingFooter
