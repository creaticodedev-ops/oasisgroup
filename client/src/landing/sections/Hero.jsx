import { useRef, useState } from 'react'
import { DEPARTMENTS, departmentPath } from '../../config/departments'
import { useI18n } from '../../i18n/I18nProvider'
import { useContact } from '../contact/context'
import { scrollToSection, useParallax } from '../hooks'
import { sectionHref } from '../navigation'
import { Photo } from '../Photo'
import { ButtonLink, DiagonalArrow, Lines, Link, Wordmark } from '../ui'

export const Hero = () => {
  const { t, tm } = useI18n()
  const { requestContact } = useContact()
  const mediaRef = useRef(null)
  const [preview, setPreview] = useState(null)
  // Department photographs are only requested once the visitor reaches for the rail.
  const [armed, setArmed] = useState(false)
  useParallax(mediaRef, -140)

  const leaveRail = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPreview(null)
  }

  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-media" data-reveal="mask">
        <div className="hero-media-inner" ref={mediaRef}>
          <Photo className="hero-layer is-base" name="hero" alt={t('hero.photoAlt')} sizes="100vw" priority />
          {armed
            ? DEPARTMENTS.map((item) => (
                <Photo
                  key={item.id}
                  className={`hero-layer${preview === item.id ? ' is-active' : ''}`}
                  name={item.photo}
                  alt=""
                  sizes="100vw"
                />
              ))
            : null}
        </div>
        <div className="hero-veil" />
      </div>

      <div className="hero-body container">
        <div className="hero-top">
          <p className="eyebrow" data-reveal="fade" style={{ '--d': 4 }}>
            {t('hero.eyebrow')}
          </p>
          <p className="hero-caption" data-reveal="fade" style={{ '--d': 5 }}>
            <span className="hero-caption-rule" aria-hidden="true" />
            {t('hero.caption')}
          </p>
        </div>

        <div className="hero-main">
          <h1 id="hero-title" className="hero-title" data-reveal="lines" style={{ '--d': 3 }}>
            <span className="sr-only">OASIS GROUP — </span>
            <Lines lines={tm('hero.titleLines')} accentLast />
          </h1>
          <div className="hero-aside" data-reveal="up" style={{ '--d': 8 }}>
            <p className="hero-lead">{t('hero.lead')}</p>
            <div className="hero-actions">
              <ButtonLink href={sectionHref('expertises')} variant="solid">
                {t('hero.ctaPrimary')}
              </ButtonLink>
              <button type="button" className="btn" onClick={() => requestContact({ type: 'quote' })}>
                <span>{t('hero.ctaSecondary')}</span>
              </button>
            </div>
          </div>
        </div>

        <Wordmark className="hero-wordmark" delay={5} />

        <div className="hero-foot">
          <nav
            className="hero-rail"
            aria-label={t('hero.railLabel')}
            onPointerEnter={() => setArmed(true)}
            onFocus={() => setArmed(true)}
            onPointerLeave={() => setPreview(null)}
            onBlur={leaveRail}
          >
            <ol>
              {DEPARTMENTS.map((item, index) => (
                <li key={item.id} data-reveal="up" style={{ '--d': 9 + index }}>
                  <Link
                    href={departmentPath(item)}
                    className={preview === item.id ? 'is-previewed' : undefined}
                    onPointerEnter={() => setPreview(item.id)}
                    onFocus={() => setPreview(item.id)}
                  >
                    <span className="index">{item.number}</span>
                    <span className="hero-rail-text">
                      <strong>{t(`departments.${item.id}.short`)}</strong>
                      <small>{t(`departments.${item.id}.domain`)}</small>
                    </span>
                    <DiagonalArrow />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <a
            className="hero-scroll"
            href="#about"
            onClick={(event) => {
              event.preventDefault()
              scrollToSection('about')
            }}
            data-reveal="fade"
            style={{ '--d': 13 }}
          >
            <span className="hero-scroll-line" aria-hidden="true" />
            <span>{t('hero.scroll')}</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default Hero
