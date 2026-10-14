import { useEffect, useRef, useState } from 'react'
import { DEPARTMENTS, departmentPath } from '../../config/departments'
import { useI18n } from '../../i18n/I18nProvider'
import { Photo } from '../Photo'
import { ButtonLink, DepartmentGlyph, SectionHead } from '../ui'

const HOVER_DELAY = 140

export const Expertises = () => {
  const { t, tm } = useI18n()
  const [active, setActive] = useState(DEPARTMENTS[0].id)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Hover opens a panel after a short intent delay, so sweeping across the row does not make it flicker.
  const hover = (id) => {
    window.clearTimeout(timer.current)
    if (id === active || !window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) return
    timer.current = window.setTimeout(() => setActive(id), HOVER_DELAY)
  }

  return (
    <section className="section xp" id="expertises" aria-labelledby="expertises-title">
      <div className="container">
        <SectionHead
          id="expertises-title"
          className="xp-head"
          eyebrow={t('expertises.eyebrow')}
          title={t('expertises.title')}
          accent={t('expertises.titleAccent')}
          lead={t('expertises.lead')}
        />

        <div className="xp-panels" onPointerLeave={() => window.clearTimeout(timer.current)}>
          {DEPARTMENTS.map((item, index) => {
            const isActive = item.id === active
            const name = t(`departments.${item.id}.name`)
            const services = tm(`departments.${item.id}.services`) || []
            return (
              <article
                key={item.id}
                className={`xp-panel${isActive ? ' is-active' : ''}`}
                aria-labelledby={`xp-${item.id}-name`}
                onPointerEnter={() => hover(item.id)}
                data-reveal="up"
                style={{ '--d': index }}
              >
                <div className="xp-media">
                  <Photo name={item.photo} alt={t(`departments.${item.id}.photoAlt`)} sizes="(min-width: 1024px) 62vw, 100vw" />
                </div>
                <div className="xp-shade" aria-hidden="true" />

                <button
                  type="button"
                  className="xp-tab"
                  aria-expanded={isActive}
                  aria-controls={`xp-${item.id}`}
                  aria-label={t('expertises.select', { name })}
                  onClick={() => setActive(item.id)}
                >
                  <span className="index">{item.number}</span>
                  <span className="xp-tab-name">{t(`departments.${item.id}.short`)}</span>
                  <DepartmentGlyph id={item.id} />
                </button>

                <div className="xp-content" id={`xp-${item.id}`}>
                  <div className="xp-top">
                    <span className="index">
                      {item.number} <span aria-hidden="true">/ 0{DEPARTMENTS.length}</span>
                    </span>
                    <DepartmentGlyph id={item.id} />
                  </div>
                  <div className="xp-text">
                    <h3 className="xp-name" id={`xp-${item.id}-name`}>
                      {name}
                    </h3>
                    <p className="xp-domain">{t(`departments.${item.id}.domain`)}</p>
                    <p className="xp-tagline serif">{t(`departments.${item.id}.tagline`)}</p>
                    <p className="xp-summary">{t(`departments.${item.id}.summary`)}</p>
                    <div className="xp-services">
                      <p className="xp-services-title">{t('expertises.services')}</p>
                      <ul>
                        {services.map((service) => (
                          <li key={service.title}>{service.title}</li>
                        ))}
                      </ul>
                    </div>
                    <ButtonLink href={departmentPath(item)} variant="solid" className="xp-cta" aria-label={t('expertises.discoverLabel', { name })}>
                      {t('expertises.discover')}
                    </ButtonLink>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Expertises
