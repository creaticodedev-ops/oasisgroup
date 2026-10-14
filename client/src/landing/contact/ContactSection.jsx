import { SITE } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { SectionHead } from '../ui'
import { ContactForm } from './ContactForm'
import './contact.css'

const Coordinates = () => {
  const { t } = useI18n()
  const { email, phone, whatsapp, address, hours } = SITE.contact
  const items = [
    email && { key: 'email', href: `mailto:${email}`, value: email, ltr: true },
    phone && { key: 'phone', href: `tel:${phone.replace(/\s+/g, '')}`, value: phone, ltr: true },
    whatsapp && { key: 'whatsapp', href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, value: whatsapp, ltr: true, external: true },
    address && { key: 'address', value: address },
    hours && { key: 'hours', value: hours },
  ].filter(Boolean)

  if (!items.length) return <p className="contact-soon">{t('contact.coordinatesSoon')}</p>

  return (
    <dl className="contact-list">
      {items.map((item) => (
        <div key={item.key}>
          <dt>{t(`contact.${item.key}`)}</dt>
          <dd>
            {item.href ? (
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
          <p className="contact-signature serif" data-reveal="fade" style={{ '--d': 4 }}>
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
