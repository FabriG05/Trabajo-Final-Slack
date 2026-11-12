import '../CSS/LandingStats.css'

/*
    Purple stats band from the original: one bold claim plus
    three big numbers with their captions.
*/
const STATS = [
    { value: '94%', suffix: '1', caption: ['of users seeing', 'positive ROI'] },
    { value: '312%', suffix: '3', caption: ['ROI over', 'three years'] },
    { value: 'US$51M', suffix: '3', caption: ['in collaboration', 'gains'] }
]

function LandingStats() {
    return (
        <section className='stats-section'>
            <h2 className='stats-section__claim'>
                We're in the business of growing businesses
            </h2>

            <div className='stats-section__grid'>
                {STATS.map((stat) => (
                    <div key={stat.value} className='stats-section__item'>
                        <p className='stats-section__value'>
                            {stat.value}
                            <sup>{stat.suffix}</sup>
                        </p>
                        <p className='stats-section__caption'>
                            {stat.caption[0]}
                            <br />
                            {stat.caption[1]}
                            <sup>{stat.suffix}</sup>
                        </p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default LandingStats
