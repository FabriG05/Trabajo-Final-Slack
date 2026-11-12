import { Link } from 'react-router'
import slackHeroIcon from '../../../assets/SlackHeroIcon.svg'
import HP_GenerateMeeting from '../../../assets/HP_Generate-meeting.png'
import HP_SlackbotInLightning from '../../../assets/HP_Slackbot-in-Lightning.png'
import '../CSS/LandingNews.css'

/*
    "What's new in Slack" section: heading, updates link, arrows
    (visual for now) and three feature cards. Cards 1 and 2 use
    the real screenshots; card 3 keeps a placeholder until we
    get its image.
*/
const NEWS_CARDS = [
    {
        title: 'Slack CRM: Generate meeting insights & Salesforce tasks',
        text: 'Your CRM meetings now write their own notes, and their own to-do list.',
        image: HP_GenerateMeeting,
        alt: 'Slack CRM meeting agenda with insights'
    },
    {
        title: 'Slackbot in Lightning',
        text: 'Slackbot now lives inside Salesforce Lightning, not just inside Slack.',
        image: HP_SlackbotInLightning,
        alt: 'Slackbot working inside Salesforce Lightning'
    },
    {
        title: 'Work object embeds',
        text: 'Your apps now live inside Slack, fully interactive, not just a preview.',
        image: null,
        alt: '',
        theme: 'purple',
        showIcon: true
    }
]

function LandingNews() {
    return (
        <section className='news-section'>
            <div className='news-section__head'>
                <div>
                    <h2 className='news-section__title'>What's new in Slack</h2>
                    <Link to='/whats-new' className='news-section__updates'>
                        See all updates <span aria-hidden='true'>→</span>
                    </Link>
                </div>

                <div className='news-section__arrows' aria-hidden='true'>
                    <button className='news-section__arrow' type='button' aria-label='Previous'>←</button>
                    <button className='news-section__arrow' type='button' aria-label='Next'>→</button>
                </div>
            </div>

            <div className='news-section__grid'>
                {NEWS_CARDS.map((card) => (
                    <article key={card.title} className='news-card'>
                        {card.image
                            ? (
                                <img
                                    className='news-card__image'
                                    src={card.image}
                                    alt={card.alt}
                                    loading='lazy'
                                />
                            )
                            : (
                                <div className={`news-card__image news-card__image--${card.theme}`}>
                                    {card.showIcon && (
                                        <img
                                            className='news-card__image-icon'
                                            src={slackHeroIcon}
                                            alt=''
                                            aria-hidden='true'
                                        />
                                    )}
                                </div>
                            )}

                        <div className='news-card__body'>
                            <span className='news-card__badge'>New feature</span>
                            <h3 className='news-card__title'>{card.title}</h3>
                            <p className='news-card__text'>{card.text}</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default LandingNews
