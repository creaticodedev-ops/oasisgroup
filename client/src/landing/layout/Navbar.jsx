import { useCallback, useState } from 'react'
import { NAV_ITEMS } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { useContact } from '../contact/context'
import { useActiveSection, useScrollDirection } from '../hooks'
import { sectionHref } from '../navigation'
import { LangSwitch, Link, Logo } from '../ui'
import { Menu } from './Menu'

const SECTION_IDS = NAV_ITEMS.map((item) => item.id)
const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => item.primary)
const NO_SECTIONS = []

export const Navbar = ({ route }) => {
  const { t } = useI18n()
  const { requestContact } = useContact()
  const [open, setOpen] = useState(false)
  const isHome = route.name === 'home'
  const department = route.name === 'department' ? route.slug : ''
  const active = useActiveSection(isHome ? SECTION_IDS : NO_SECTIONS)
  const { scrolled, hidden } = useScrollDirection()

  const close = useCallback(() => setOpen(false), [])
  const quote = useCallback(() => {
    setOpen(false)
    requestContact({ type: 'quote', department })
  }, [requestContact, department])

  return (
    <>
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <header className={`nav${scrolled ? ' is-scrolled' : ''}${hidden && !open ? ' is-hidden' : ''}`}>
        <div className="nav-inner container">
          <Link href="/" className="nav-logo" aria-label={t('nav.homeLink')}>
            <Logo />
          </Link>

          <nav className="nav-links" aria-label={t('nav.primary')}>
            {PRIMARY_ITEMS.map((item) => (
              <Link key={item.id} href={sectionHref(item.id)} aria-current={active === item.id ? 'true' : undefined}>
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <LangSwitch className="nav-lang" />
            <button type="button" className="btn btn-solid btn-sm nav-cta" onClick={quote}>
              <span>{t('nav.cta')}</span>
            </button>
            <button
              type="button"
              className="nav-menu-btn"
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={t('nav.open')}
              onClick={() => setOpen(true)}
            >
              <span className="nav-menu-label">{t('nav.menu')}</span>
              <span className="burger" aria-hidden="true">
                <i />
                <i />
              </span>
            </button>
          </div>
        </div>
        <span className="nav-progress" role="presentation" />
      </header>
      <Menu open={open} onClose={close} active={active} currentDepartment={department} onQuote={quote} />
    </>
  )
}

export default Navbar
