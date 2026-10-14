import { useI18n } from '../../i18n/I18nProvider'
import { FramedPhoto } from '../Photo'
import { SectionHead } from '../ui'

export const Commitments = () => {
  const { t, tm } = useI18n()
  const items = tm('commitments.items') || []

  return (
    <section className="section commitments is-light" id="commitments" aria-labelledby="commitments-title">
      <div className="container commitments-grid">
        <div className="commitments-aside">
          <SectionHead
            id="commitments-title"
            eyebrow={t('commitments.eyebrow')}
            title={t('commitments.title')}
            accent={t('commitments.titleAccent')}
          />
          <FramedPhoto
            className="commitments-photo"
            name="commitments"
            alt={t('commitments.photoAlt')}
            sizes="(min-width: 1024px) 34vw, 100vw"
            parallax={36}
            delay={2}
          />
        </div>

        <ol className="commitments-list">
          {items.map((item, index) => (
            <li key={item.title} className="commitment" data-reveal="up">
              <span className="rule" data-reveal="rule" aria-hidden="true" />
              <span className="commitment-number" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="commitment-body">
                <h3 className="commitment-title">{item.title}</h3>
                <p className="body-text">{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Commitments
