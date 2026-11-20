import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import slackLogo from '../../../assets/slackLogo.svg'
import slackLogoWhite from '../../../assets/slackLogoWhite.svg'
import slugify from '../../../Utils/slugify'
import '../CSS/LandingNavbar.css'

/*
    Top navigation of the landing. Product / Solutions /
    Resources open full-width dropdown panels copied from the
    original; every item inside routes to the placeholder
    screen. Plain links (Enterprise, Pricing) navigate directly.
*/

/* Dropdown menus. Items may be plain labels or
   { label, description, isNew } objects. */
const NAV_MENUS = [
    {
        label: 'Product',
        columns: [
            {
                title: 'Collaborate',
                items: [
                    { label: 'Channels', description: 'Chat and work together' },
                    { label: 'Slack Connect', description: 'Work with external partners' },
                    { label: 'Meetings & video', description: 'Video chat with your team' },
                    { label: 'Canvas', description: 'Create, edit and share docs' },
                    { label: 'Lists', description: 'Manage projects in Slack' }
                ]
            },
            {
                title: 'Work with AI',
                items: [
                    { label: 'Slackbot', description: 'Meet your new AI teammate' },
                    { label: 'Slack Code', description: 'Build with people and agents', isNew: true },
                    { label: 'Native AI', description: 'Save time with built-in AI' },
                    { label: 'Agentforce', description: 'Team up with Salesforce agents' }
                ]
            },
            {
                title: 'Connect',
                items: [
                    { label: 'Apps & integrations', description: 'Connect your favourite tools' },
                    { label: 'Native CRM', description: 'Grow customer relationships' },
                    { label: 'Salesforce in Slack', description: 'Put customer data to work' },
                    { label: 'Enterprise search', description: 'Find answers from anywhere' }
                ]
            },
            {
                title: 'Build',
                items: [
                    { label: 'Agentic platform', description: 'All your people, apps and agents' },
                    { label: 'Workflow Builder', description: 'Automate everyday tasks' },
                    { label: 'Trust & security', description: 'Keep work private and secure' }
                ]
            }
        ]
    },
    {
        label: 'Solutions',
        columns: [
            {
                title: 'By department',
                items: [
                    'Frontline',
                    'Engineering',
                    'IT',
                    'Customer service',
                    'Sales',
                    'Project management',
                    'Marketing',
                    'Human Resources',
                    'Security'
                ]
            },
            {
                title: 'By industry',
                items: [
                    'Manufacturing, auto and energy',
                    'Technology',
                    'Media',
                    'Small business',
                    'Financial services',
                    'Retail',
                    'Public sector',
                    'Education',
                    'Health and life sciences'
                ]
            }
        ]
    },
    {
        label: 'Resources',
        columns: [
            {
                title: 'Discover',
                items: ["What's new", 'Resources library', 'Customer stories', 'Events']
            },
            {
                title: 'Learn',
                items: ['Blog', 'Product tour', 'Help Centre', 'Slack vs Teams']
            },
            {
                title: 'Build',
                items: ['Developers', 'Slack Community', 'Partner programme', 'Partner offers']
            }
        ]
    }
]

/* Links without a dropdown panel. */
const PLAIN_LINKS = [
    { label: 'Enterprise', to: '/enterprise' },
    { label: 'Pricing', to: '/pricing' }
]

/* Bottom row shared by every dropdown panel. */
const DROPDOWN_FOOTER_LINKS = ['Watch demo', 'Download Slack']

/* Normalizes an item entry to { label, description, isNew }. */
function normalizeItem(item) {
    return typeof item === 'string' ? { label: item } : item
}

function DropdownColumn({ title, items }) {
    return (
        <div className='landing-navbar__column'>
            <p className='landing-navbar__column-title'>{title}</p>
            <ul className='landing-navbar__column-list'>
                {items.map((entry) => {
                    const { label, description, isNew } = normalizeItem(entry)
                    return (
                        <li key={label}>
                            <Link
                                to={`/${slugify(label)}`}
                                className='landing-navbar__dropdown-link'
                            >
                                <span className='landing-navbar__dropdown-label'>
                                    {label}
                                    {isNew && (
                                        <span className='landing-navbar__new-badge'>New</span>
                                    )}
                                </span>
                                {description && (
                                    <span className='landing-navbar__dropdown-description'>
                                        {description}
                                    </span>
                                )}
                            </Link>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

/*
    When `signedIn` is passed, the auth CTAs on the right are
    replaced by a single Sign out button (used by the home
    screen); the landing keeps the default behaviour.
    `theme='dark'` switches the background to Slack purple and
    nav items / logo to white (for pages with a purple hero).
*/
function LandingNavbar({ signedIn = false, onSignOut, theme = 'light' }) {
    const [openMenu, setOpenMenu] = useState(null)
    const location = useLocation()
    const logoSrc = theme === 'dark' ? slackLogoWhite : slackLogo

    // Close on outside click or Escape while a menu is open.
    useEffect(
        () => {
            if (!openMenu) {
                return
            }

            function handlePointer(event) {
                if (!event.target.closest('.landing-navbar__menu-wrapper')) {
                    setOpenMenu(null)
                }
            }

            function handleKey(event) {
                if (event.key === 'Escape') {
                    setOpenMenu(null)
                }
            }

            window.addEventListener('mousedown', handlePointer)
            window.addEventListener('keydown', handleKey)
            return () => {
                window.removeEventListener('mousedown', handlePointer)
                window.removeEventListener('keydown', handleKey)
            }
        },
        [openMenu]
    )

    return (
        <header className={`landing-navbar${theme === 'dark' ? ' landing-navbar--dark' : ''}`}>
            <div className='landing-navbar__left'>
                <Link to='/' className='landing-navbar__brand'>
                    <img
                        className='landing-navbar__logo'
                        src={logoSrc}
                        alt='Slack'
                    />
                </Link>

                <nav
                    className='landing-navbar__menu'
                    aria-label='Main'
                    onClick={(event) => {
                        // Close the dropdown after following a link, but
                        // leave trigger clicks alone so the panel opens.
                        if (event.target.closest('a')) {
                            setOpenMenu(null)
                        }
                    }}
                >
                    {NAV_MENUS.map((menu) => (
                        <div
                            key={menu.label}
                            className='landing-navbar__menu-wrapper'
                        >
                            <button
                                type='button'
                                className={`landing-navbar__link landing-navbar__trigger${openMenu === menu.label ? ' landing-navbar__trigger--open' : ''}`}
                                onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                                aria-expanded={openMenu === menu.label}
                            >
                                {menu.label}
                                <span
                                    className='landing-navbar__caret'
                                    aria-hidden='true'
                                >
                                    ▾
                                </span>
                            </button>

                            {openMenu === menu.label && (
                                <div className='landing-navbar__dropdown'>
                                    <div
                                        className='landing-navbar__dropdown-columns'
                                        style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}
                                    >
                                        {menu.columns.map((column) => (
                                            <DropdownColumn
                                                key={column.title}
                                                title={column.title}
                                                items={column.items}
                                            />
                                        ))}
                                    </div>

                                    <div className='landing-navbar__dropdown-footer'>
                                        {DROPDOWN_FOOTER_LINKS.map((label) => (
                                            <Link
                                                key={label}
                                                to={`/${slugify(label)}`}
                                                className='landing-navbar__dropdown-footer-link'
                                            >
                                                {label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {PLAIN_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className='landing-navbar__link'
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className='landing-navbar__right'>
                {signedIn ? (
                    <>
                        {location.pathname !== '/home' && (
                            <Link to='/home' className='landing-navbar__get-started'>
                                Go to workspaces
                            </Link>
                        )}

                        {onSignOut && (
                            <button
                                type='button'
                                className='landing-navbar__signout'
                                onClick={onSignOut}
                            >
                                Sign out
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <Link to='/login' className='landing-navbar__signin'>
                            Sign in
                        </Link>

                        <Link to='/demo' className='landing-navbar__demo'>
                            Request a demo
                        </Link>

                        <Link to='/register' className='landing-navbar__get-started'>
                            Get started
                        </Link>
                    </>
                )}
            </div>
        </header>
    )
}

export default LandingNavbar
