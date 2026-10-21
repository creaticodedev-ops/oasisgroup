import { CONTACT_ITEMS, SOCIAL_LINKS } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { DocumentCard } from '../layout/DocumentCard'
import { SocialCards } from '../layout/SocialLinks'
import { DiagonalArrow, SectionHead } from '../ui'
import { ContactForm } from './ContactForm'
import './contact.css'

const Coordinates = () => {
  const { t } = useI18n()
  if (!CONTACT_ITEMS.length) return <p className="contact-soon">{t('contact.coordinatesSoon')}</p>

  return (
    <dl className="contact-list">
      {CONTACT_ITEMS.map((item) => (
        <div key={item.key}>
          <dt>{t(`contact.${item.key}`)}</dt>
          <dd>
            {item.key === 'address' ? (
              <>
                <span className="contact-address">
                  <bdi>{item.value}</bdi>
                </span>
                <a className="contact-maps link-arrow" href={item.href} target="_blank" rel="noopener noreferrer">
                  <span>{t('contact.maps')}</span>
                  <DiagonalArrow size={12} />
                  <span className="sr-only"> {t('common.newTab')}</span>
                </a>
              </>
            ) : item.href ? (
              <a
                className="link-line"
                href={item.href}
                dir={item.ltr ? 'ltr' : undefined}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {item.value}
                {item.external ? <span className="sr-only"> {t('common.newTab')}</span> : null}
              </a>
            ) : (
              <span>{item.value}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export const ContactSection = ({ defaultDepartment = '' }) => {
  const { t } = useI18n()
  return (
    <section className="section contact is-light" id="contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <div className="contact-aside">
          <SectionHead id="contact-title" eyebrow={t('contact.eyebrow')} title={t('contact.title')} accent={t('contact.titleAccent')} lead={t('contact.lead')} />
          <div className="contact-coords" data-reveal="up" style={{ '--d': 3 }}>
            <h3 className="contact-coords-title">{t('contact.coordinates')}</h3>
            <Coordinates />
          </div>
          <div className="contact-doc" data-reveal="up" style={{ '--d': 4 }}>
            <h3 className="contact-coords-title">{t('documents.eyebrow')}</h3>
            <DocumentCard />
          </div>
          {SOCIAL_LINKS.length ? (
            <div className="contact-social" data-reveal="up" style={{ '--d': 5 }}>
              <h3 className="contact-coords-title">{t('contact.social')}</h3>
              <SocialCards />
            </div>
          ) : null}
          <p className="contact-signature serif" data-reveal="fade" style={{ '--d': 6 }}>
            {t('common.signature')}
          </p>
        </div>
        <div className="contact-main" data-reveal="up" style={{ '--d': 2 }}>
          <ContactForm defaultDepartment={defaultDepartment} />
        </div>
      </div>
    </section>
  )
}

export default ContactSection
