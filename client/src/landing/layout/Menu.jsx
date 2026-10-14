import { useEffect, useRef } from 'react'
import { DEPARTMENTS, departmentPath } from '../../config/departments'
import { NAV_ITEMS } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { sectionHref } from '../navigation'
import { ArrowIcon, DepartmentGlyph, LangSwitch, Link, Logo } from '../ui'
import { SocialLinks } from './SocialLinks'

/** Full-screen menu (all breakpoints): focus trap, Escape, scroll lock, masked open / close. */
export const Menu = ({ open, onClose, active, currentDepartment, onQuote }) => {
  const { t } = useI18n()
  const panelRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60)

    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll('a[href], button:not([disabled])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true })
    }
  }, [open, onClose])

  return (
    <div
      ref={panelRef}
      id="site-menu"
      className={`menu${open ? ' is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('nav.menu')}
      inert={!open}
    >
      <div className="menu-top container">
        <Link href="/" className="menu-logo" aria-label={t('nav.homeLink')} onClick={onClose}>
          <Logo />
        </Link>
        <button ref={closeRef} type="button" className="menu-close" onClick={onClose}>
          <span>{t('nav.close')}</span>
          <span className="menu-close-icon" aria-hidden="true" />
        </button>
      </div>

      <div className="menu-body container">
        <nav className="menu-primary" aria-label={t('nav.sections')}>
          <p className="eyebrow">{t('nav.sections')}</p>
          <ol className="menu-links">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.id} style={{ '--i': index }}>
                <Link href={sectionHref(item.id)} aria-current={active === item.id ? 'true' : undefined} onClick={onClose}>
                  <span className="index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="menu-link-text">{t(`nav.${item.key}`)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="menu-side">
          <nav aria-label={t('nav.departments')}>
            <p className="eyebrow">{t('nav.departments')}</p>
            <ul className="menu-departments">
              {DEPARTMENTS.map((item, index) => (
                <li key={item.id} style={{ '--i': index + 3 }}>
                  <Link href={departmentPath(item)} aria-current={currentDepartment === item.id ? 'page' : undefined} onClick={onClose}>
                    <DepartmentGlyph id={item.id} />
                    <span>
                      <strong>{t(`departments.${item.id}.name`)}</strong>
                      <small>{t(`departments.${item.id}.domain`)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="menu-foot">
            <button type="button" className="btn btn-solid btn-block" onClick={onQuote}>
              <span>{t('nav.cta')}</span>
              <ArrowIcon />
            </button>
            <div className="menu-meta">
              <LangSwitch />
              <SocialLinks />
            </div>
            <p className="menu-signature serif">{t('common.signature')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Menu
