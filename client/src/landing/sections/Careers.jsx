import { OPENINGS } from '../../config/careers'
import { useI18n } from '../../i18n/I18nProvider'
import { localized } from '../../i18n/localized'
import { useContact } from '../contact/context'
import { FramedPhoto } from '../Photo'
import { ArrowIcon, CheckIcon, SectionHead } from '../ui'

export const Careers = () => {
  const { t, tm, locale } = useI18n()
  const { requestContact } = useContact()
  const points = tm('careers.points') || []

  return (
    <section className="section careers" id="careers" aria-labelledby="careers-title">
      <div className="container careers-grid">
        <FramedPhoto className="careers-photo" name="careers" alt={t('careers.photoAlt')} sizes="(min-width: 1024px) 46vw, 100vw" parallax={44} />

        <div className="careers-content">
          <SectionHead id="careers-title" eyebrow={t('careers.eyebrow')} title={t('careers.title')} accent={t('careers.titleAccent')} lead={t('careers.lead')} />

          <ul className="careers-points">
            {points.map((point, index) => (
              <li key={point} data-reveal="up" style={{ '--d': index }}>
                <CheckIcon />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <div className="careers-openings" data-reveal="up">
            <h3 className="eyebrow is-bare">{t('careers.openings')}</h3>
            {OPENINGS.length ? (
              <ul className="openings">
                {OPENINGS.map((opening) => (
                  <li key={opening.id} className="opening">
                    <div>
                      <p className="opening-title">{localized(opening.title, locale)}</p>
                      <p className="fine-print">
                        {[t(`departments.${opening.department}.name`), opening.location, localized(opening.contract, locale)].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="link-arrow"
                      onClick={() => requestContact({ type: 'career', department: opening.department })}
                    >
                      {t('careers.apply')}
                      <ArrowIcon />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="body-text">{t('careers.noOpenings')}</p>
            )}
          </div>

          <button type="button" className="btn btn-solid careers-cta" data-reveal="up" onClick={() => requestContact({ type: 'career' })}>
            <span>{t('careers.cta')}</span>
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

export default Careers
