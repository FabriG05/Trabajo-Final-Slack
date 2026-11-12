import HP_G2_Best_Results from '../../../assets/HP_G2_Best_Results_fall_2026.png'
import HP_G2_Best_Usability from '../../../assets/HP_G2_Best_Usability_fall_2026.png'
import HP_G2_Highest_User_Adoption from '../../../assets/HP_G2_Highest_User_Adoption_fall_2026.png'
import HP_G2_Leader_SMB from '../../../assets/HPG2_Leader_SMB_fall_2026.png'
import HP_G2_Leader_MM from '../../../assets/HP_G2_Leader_MM_fall_2026.png'
import HP_G2_Leader_ENT from '../../../assets/HP_G2_Leader_ENT_fall_2026.png'
import '../CSS/LandingSocialProof.css'

/*
    White social-proof section from the original: adoption
    counters on the left, G2 award badges on the right, split
    by a vertical divider.
*/
const ADOPTION_STATS = [
    { value: '1B+', suffix: '4', caption: 'messages sent daily' },
    { value: '4M', suffix: '5', caption: 'Slack Connect users working directly with external teams each week' },
    { value: '3M', suffix: '5', caption: 'daily workflows' },
    { value: '1.7M', suffix: '5', caption: 'apps actively used each week' }
]

const G2_BADGES = [
    { image: HP_G2_Best_Results, alt: 'G2 Best Results Fall 2026' },
    { image: HP_G2_Best_Usability, alt: 'G2 Best Usability Fall 2026' },
    { image: HP_G2_Highest_User_Adoption, alt: 'G2 Highest User Adoption Fall 2026' },
    { image: HP_G2_Leader_SMB, alt: 'G2 Leader Small Business Fall 2026' },
    { image: HP_G2_Leader_MM, alt: 'G2 Leader Mid-Market Fall 2026' },
    { image: HP_G2_Leader_ENT, alt: 'G2 Leader Enterprise Fall 2026' }
]

function LandingSocialProof() {
    return (
        <section className='social-proof'>
            <h2 className='social-proof__title'>
                Millions of people love working in Slack
            </h2>

            <div className='social-proof__columns'>
                <div className='social-proof__stats'>
                    {ADOPTION_STATS.map((stat) => (
                        <div key={stat.value} className='social-proof__stat'>
                            <span className='social-proof__value'>{stat.value}</span>
                            <span className='social-proof__caption'>
                                {stat.caption}
                                <sup>{stat.suffix}</sup>
                            </span>
                        </div>
                    ))}
                </div>

                <div className='social-proof__awards'>
                    <h3 className='social-proof__claim'>Don't just take our word for it.</h3>
                    <p className='social-proof__text'>
                        Slack is a leader in over 290 G2 market reports.<sup>5</sup>
                    </p>

                    <div className='social-proof__badges'>
                        {G2_BADGES.map((badge) => (
                            <img
                                key={badge.alt}
                                className='social-proof__badge'
                                src={badge.image}
                                alt={badge.alt}
                                loading='lazy'
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default LandingSocialProof
