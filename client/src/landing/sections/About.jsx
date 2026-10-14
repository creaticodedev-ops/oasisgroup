import { useI18n } from '../../i18n/I18nProvider'
import { FramedPhoto } from '../Photo'

export const About = () => {
  const { t, tm } = useI18n()
  const pillars = tm('about.pillars') || []
  const values = tm('about.values') || []

  return (
    <section className="section about is-light" id="about" aria-labelledby="about-title">
      <div className="container">
        <div className="about-intro">
          <h2 className="eyebrow" id="about-title" data-reveal="fade">
            {t('about.eyebrow')}
          </h2>
          <p className="about-statement" data-reveal="up" style={{ '--d': 1 }}>
            {t('about.statement')}
          </p>
        </div>

        <div className="about-grid">
          <figure className="about-figure">
            <FramedPhoto className="about-photo" name="about" alt={t('about.photoAlt')} sizes="(min-width: 1024px) 40vw, 100vw" delay={1} />
            <figcaption className="about-figure-caption serif" data-reveal="fade" style={{ '--d': 3 }}>
              {t('common.signature')}
            </figcaption>
          </figure>

          <div className="about-content">
            <p className="body-text about-body" data-reveal="up">
              {t('about.body')}
            </p>

            <div className="about-pillars">
              {pillars.map((pillar, index) => (
                <article key={pillar.title} className="about-pillar" data-reveal="up" style={{ '--d': index + 1 }}>
                  <span className="rule" data-reveal="rule" style={{ '--d': index + 1 }} aria-hidden="true" />
                  <p className="index">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="h3">{pillar.title}</h3>
                  <p className="body-text">{pillar.text}</p>
                </article>
              ))}
            </div>

            <div className="about-values">
              <h3 className="eyebrow is-bare" data-reveal="fade">
                {t('about.valuesTitle')}
              </h3>
              <ol className="about-values-list">
                {values.map((value, index) => (
                  <li key={value.title} data-reveal="up" style={{ '--d': index }}>
                    <span className="index">{String(index + 1).padStart(2, '0')}</span>
                    <strong className="about-value-title serif">{value.title}</strong>
                    <span className="about-value-text">{value.text}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
