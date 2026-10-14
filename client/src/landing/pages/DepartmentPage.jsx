import { useEffect, useRef } from 'react'
import { DEPARTMENTS, departmentPath, findDepartment } from '../../config/departments'
import { useI18n } from '../../i18n/I18nProvider'
import { useContact } from '../contact/context'
import { ContactSection } from '../contact/ContactSection'
import { scrollToSection, useElementProgress, useParallax } from '../hooks'
import { sectionHref } from '../navigation'
import { FramedPhoto, Photo } from '../Photo'
import { ArrowIcon, BrandMark, DepartmentGlyph, Link, SectionHead } from '../ui'
import './department.css'

const DepartmentHero = ({ department }) => {
  const { t } = useI18n()
  const { requestContact } = useContact()
  const mediaRef = useRef(null)
  useParallax(mediaRef, -120)
  const key = `departments.${department.id}`
  const [prefix, ...rest] = t(`${key}.name`).split(' ')

  return (
    <section className="dpt-hero" id="top" aria-labelledby="dpt-title">
      <div className="dpt-hero-media" data-reveal="mask">
        <div className="dpt-hero-media-inner" ref={mediaRef}>
          <Photo name={department.photo} alt={t(`${key}.photoAlt`)} sizes="100vw" priority />
        </div>
        <div className="dpt-hero-veil" />
      </div>

      <div className="dpt-hero-body container">
        <nav className="dpt-breadcrumb" aria-label={t('department.breadcrumb')} data-reveal="fade" style={{ '--d': 3 }}>
          <ol>
            <li>
              <Link href="/">{t('nav.home')}</Link>
            </li>
            <li>
              <Link href={sectionHref('expertises')}>{t('department.expertises')}</Link>
            </li>
            <li aria-current="page">{t(`${key}.short`)}</li>
          </ol>
        </nav>

        <div className="dpt-hero-main">
          <div className="dpt-hero-index" data-reveal="fade" style={{ '--d': 4 }}>
            <span className="index">
              {department.number} / 0{DEPARTMENTS.length}
            </span>
            <DepartmentGlyph id={department.id} />
          </div>
          <h1 className="dpt-title" id="dpt-title" data-reveal="lines" style={{ '--d': 3 }}>
            <span className="line dpt-title-prefix" style={{ '--l': 0 }}>
              <span>{prefix}</span>
            </span>{' '}
            <span className="line" style={{ '--l': 1 }}>
              <span>{rest.join(' ')}</span>
            </span>
          </h1>
          <div className="dpt-hero-aside" data-reveal="up" style={{ '--d': 7 }}>
            <p className="dpt-domain">{t(`${key}.domain`)}</p>
            <p className="dpt-tagline serif">{t(`${key}.tagline`)}</p>
            <div className="dpt-hero-actions">
              <button type="button" className="btn btn-solid" onClick={() => requestContact({ type: 'quote', department: department.id })}>
                <span>{t('nav.cta')}</span>
                <ArrowIcon />
              </button>
              <a
                className="link-arrow"
                href="#services"
                onClick={(event) => {
                  event.preventDefault()
                  scrollToSection('services')
                }}
              >
                {t('department.services')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Approach = () => {
  const { t, tm } = useI18n()
  const ref = useRef(null)
  const steps = tm('department.steps') || []

  useElementProgress(ref, (progress) => {
    const value = Math.min(1, Math.max(0, (progress - 0.2) / 0.4))
    ref.current?.style.setProperty('--progress', value.toFixed(3))
  })

  return (
    <section className="section dpt-approach" aria-labelledby="dpt-approach-title">
      <div className="container">
        <SectionHead id="dpt-approach-title" eyebrow={t('department.approach')} title={t('common.signature')} />
        <div className="dpt-steps" ref={ref}>
          <span className="dpt-steps-track" aria-hidden="true" />
          <ol>
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="dpt-step"
                data-reveal="up"
                style={{ '--d': index, '--at': (index / steps.length).toFixed(3) }}
              >
                <span className="dpt-step-dot" aria-hidden="true" />
                <span className="index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="h3">{step.title}</h3>
                <p className="body-text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

const NextDepartment = ({ department }) => {
  const { t } = useI18n()
  const index = DEPARTMENTS.findIndex((item) => item.id === department.id)
  const next = DEPARTMENTS[(index + 1) % DEPARTMENTS.length]
  const others = DEPARTMENTS.filter((item) => item.id !== department.id && item.id !== next.id)

  return (
    <section className="dpt-next" aria-labelledby="dpt-next-title">
      <Link href={departmentPath(next)} className="dpt-next-link">
        <Photo className="dpt-next-photo" name={next.photo} alt="" sizes="100vw" />
        <span className="dpt-next-veil" aria-hidden="true" />
        <span className="dpt-next-body container">
          <span className="eyebrow" id="dpt-next-title">
            {t('department.next')}
          </span>
          <span className="dpt-next-name">
            {t(`departments.${next.id}.name`)}
            <ArrowIcon size={28} />
          </span>
          <span className="dpt-next-domain">{t(`departments.${next.id}.domain`)}</span>
        </span>
      </Link>
      <div className="dpt-others container">
        <p className="eyebrow is-bare">{t('department.others')}</p>
        <ul>
          {others.map((item) => (
            <li key={item.id}>
              <Link href={departmentPath(item)} className="dpt-other">
                <DepartmentGlyph id={item.id} />
                <span>{t(`departments.${item.id}.name`)}</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={sectionHref('about')} className="dpt-other">
              <BrandMark className="glyph" />
              <span>{t('department.group')}</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}

export const DepartmentPage = ({ slug }) => {
  const { t, tm, setPageMeta } = useI18n()
  const department = findDepartment(slug) || DEPARTMENTS[0]
  const key = `departments.${department.id}`
  const name = t(`${key}.name`)
  const domain = t(`${key}.domain`)
  const summary = t(`${key}.summary`)
  const services = tm(`${key}.services`) || []
  const galleryAlt = tm(`${key}.galleryAlt`) || []

  useEffect(() => {
    setPageMeta({ title: t('meta.department', { name, domain }), description: summary })
    return () => setPageMeta(null)
  }, [setPageMeta, t, name, domain, summary])

  return (
    <>
      <DepartmentHero department={department} />

      <section className="section dpt-intro is-light" aria-label={name}>
        <div className="container dpt-intro-grid">
          <p className="dpt-intro-text" data-reveal="up">
            {t(`${key}.intro`)}
          </p>
          <div className="dpt-intro-aside">
            <p className="lead" data-reveal="up" style={{ '--d': 1 }}>
              {summary}
            </p>
            <FramedPhoto className="dpt-intro-photo" name={department.gallery[0]} alt={galleryAlt[0] || ''} sizes="(min-width: 1024px) 34vw, 100vw" delay={2} />
          </div>
        </div>
      </section>

      <section className="section dpt-services is-light" id="services" aria-labelledby="dpt-services-title">
        <div className="container">
          <SectionHead id="dpt-services-title" eyebrow={t('department.services')} title={t(`${key}.tagline`)} lead={t('department.servicesLead')} />
          <ol className="dpt-service-list">
            {services.map((service, index) => (
              <li key={service.title} className="dpt-service" data-reveal="up" style={{ '--d': index % 2 }}>
                <span className="index">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="dpt-service-title">{service.title}</h3>
                <p className="body-text">{service.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="dpt-gallery">
        <FramedPhoto className="dpt-gallery-photo" name={department.gallery[1]} alt={galleryAlt[1] || ''} sizes="100vw" parallax={70} />
      </div>

      <Approach />
      <NextDepartment department={department} />
      <ContactSection defaultDepartment={department.id} />
    </>
  )
}

export default DepartmentPage
