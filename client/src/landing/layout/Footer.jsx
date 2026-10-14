import { DEPARTMENTS, departmentPath } from '../../config/departments'
import { LEGAL_ITEMS, NAV_ITEMS, SITE } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { scrollToSection } from '../hooks'
import { sectionHref } from '../navigation'
import { LangSwitch, Link, Logo, Wordmark } from '../ui'
import { SocialLinks } from './SocialLinks'

const ContactList = () => {
  const { t } = useI18n()
  const { email, phone, whatsapp, address } = SITE.contact
  const items = [
    email && { key: 'email', href: `mailto:${email}`, value: email },
    phone && { key: 'phone', href: `tel:${phone.replace(/\s+/g, '')}`, value: phone },
    whatsapp && { key: 'whatsapp', href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, value: whatsapp, external: true },
    address && { key: 'address', value: address },
  ].filter(Boolean)

  return (
    <ul className="foot-list">
      {items.length ? (
        items.map((item) => (
          <li key={item.key}>
            <span className="foot-label">{t(`contact.${item.key}`)}</span>
            {item.href ? (
              <a className="link-line" href={item.href} dir="ltr" {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {item.value}
              </a>
            ) : (
              <span>{item.value}</span>
            )}
          </li>
        ))
      ) : (
        <li className="foot-muted">{t('footer.contactSoon')}</li>
      )}
      <li>
        <Link className="link-line" href={sectionHref('contact')}>
          {t('footer.contactForm')}
        </Link>
      </li>
    </ul>
  )
}

export const Footer = () => {
  const { t } = useI18n()
  const year = new Date().getFullYear()

  return (
    <footer className="foot" aria-labelledby="foot-title">
      <h2 id="foot-title" className="sr-only">
        OASIS GROUP
      </h2>
      <div className="container">
        <div className="foot-grid">
          <div className="foot-brand">
            <Logo />
            <p>{t('footer.statement')}</p>
            <SocialLinks />
          </div>
          <nav className="foot-col" aria-label={t('footer.navTitle')}>
            <h3>{t('footer.navTitle')}</h3>
            <ul className="foot-list">
              {NAV_ITEMS.filter((item) => item.id !== 'contact').map((item) => (
                <li key={item.id}>
                  <Link className="link-line" href={sectionHref(item.id)}>
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="foot-col" aria-label={t('footer.departmentsTitle')}>
            <h3>{t('footer.departmentsTitle')}</h3>
            <ul className="foot-list">
              {DEPARTMENTS.map((item) => (
                <li key={item.id}>
                  <Link className="link-line" href={departmentPath(item)}>
                    {t(`departments.${item.id}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="foot-col">
            <h3>{t('footer.contactTitle')}</h3>
            <ContactList />
          </div>
          <div className="foot-col">
            <h3>{t('footer.legalTitle')}</h3>
            {LEGAL_ITEMS.length ? (
              <dl className="foot-legal">
                {LEGAL_ITEMS.map((item) => (
                  <div key={item.key}>
                    <dt>{t(`footer.legal.${item.key}`)}</dt>
                    <dd dir="auto">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="foot-muted">{t('footer.legalSoon')}</p>
            )}
          </div>
        </div>

        <Wordmark className="foot-mark" withMark />

        <div className="foot-bottom">
          <p>{t('footer.rights', { year })}</p>
          <p className="foot-signature serif">{t('common.signature')}</p>
          <div className="foot-bottom-links">
            <LangSwitch />
            <a href="/admin" className="foot-admin" rel="nofollow" title={t('footer.adminLabel')}>
              {t('footer.admin')}
            </a>
            <a
              className="link-line"
              href="#top"
              onClick={(event) => {
                event.preventDefault()
                scrollToSection('top')
              }}
            >
              {t('footer.backToTop')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
