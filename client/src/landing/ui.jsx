import { useRef } from 'react'
import logoUrl from '../assets/brand/oasis-group-logo.png'
import { useI18n } from '../i18n/I18nProvider'
import { LOCALES } from '../i18n/locales'
import { useFitText } from './hooks'
import { isPlainClick, navigate } from './navigation'

// Intrinsic size of the logo file, as printed by `npm run brand:assets`.
const LOGO_WIDTH = 100
const LOGO_HEIGHT = 39

/** The emblem of the logo (the "O"), painted in the current text colour — see `.brand-mark` in global.css. */
export const BrandMark = ({ className = '' }) => <span className={`brand-mark ${className}`.trim()} aria-hidden="true" />

/** Official logo (white on transparent). Never displayed above its intrinsic size. */
export const Logo = ({ className = '' }) => (
  <img className={`logo ${className}`.trim()} src={logoUrl} width={LOGO_WIDTH} height={LOGO_HEIGHT} alt="OASIS GROUP" decoding="async" />
)

/** Monumental "OASIS GROUP", fitted to its container width; letters rise one by one (`data-reveal="letters"`). */
export const Wordmark = ({ className = '', delay = 0 }) => {
  const ref = useRef(null)
  useFitText(ref)
  const letters = (word, offset) =>
    [...word].map((char, index) => (
      <span key={`${word}-${index}`} className="wordmark-cell" style={{ '--l': offset + index }}>
        <span>{char}</span>
      </span>
    ))

  return (
    <div ref={ref} className={`wordmark ${className}`.trim()} aria-hidden="true" dir="ltr" data-reveal="letters" style={{ '--d': delay }}>
      <span className="wordmark-inner">
        <span className="wordmark-word">{letters('OASIS', 0)}</span>
        <span className="wordmark-word is-light-weight">{letters('GROUP', 5)}</span>
      </span>
    </div>
  )
}

export const ArrowIcon = ({ size = 16 }) => (
  <svg className="icon-arrow" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.5 8h11M9.5 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
)

export const DiagonalArrow = ({ size = 16 }) => (
  <svg className="icon-diag" width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 12L12 4M5.5 4H12v6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
)

export const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.2 8.4l3 3.1 6.6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
  </svg>
)

/** Same-origin anchor that navigates without a full reload; modified clicks keep the browser behaviour. */
export const Link = ({ href, onClick, children, ...rest }) => (
  <a
    href={href}
    onClick={(event) => {
      onClick?.(event)
      if (!isPlainClick(event) || rest.target) return
      event.preventDefault()
      navigate(href)
    }}
    {...rest}
  >
    {children}
  </a>
)

export const ButtonLink = ({ href, variant = 'line', arrow = true, className = '', children, ...rest }) => (
  <Link href={href} className={`btn btn-${variant} ${className}`.trim()} {...rest}>
    <span>{children}</span>
    {arrow ? <ArrowIcon /> : null}
  </Link>
)

/** Heading lines revealed one by one from their own mask (`data-reveal="lines"` on the parent). */
export const Lines = ({ lines, accentLast = false }) =>
  lines.map((text, index) => (
    <span key={index} className={`line${accentLast && index === lines.length - 1 ? ' is-accent' : ''}`} style={{ '--l': index }}>
      <span>{text}</span>
    </span>
  ))

/** Section header: eyebrow, two-part title (plain + serif accent) and optional lead. */
export const SectionHead = ({ eyebrow, title, accent, lead, id, className = '', children }) => (
  <header className={`section-head ${className}`.trim()}>
    {eyebrow ? (
      <p className="eyebrow" data-reveal="fade">
        {eyebrow}
      </p>
    ) : null}
    <h2 className="h2" id={id} data-reveal="lines">
      <Lines lines={[title, accent].filter(Boolean)} accentLast={Boolean(accent)} />
    </h2>
    {lead ? (
      <p className="lead" data-reveal="up" style={{ '--d': 2 }}>
        {lead}
      </p>
    ) : null}
    {children}
  </header>
)

export const LangSwitch = ({ className = '' }) => {
  const { locale, setLocale, t } = useI18n()
  return (
    <div className={`lang ${className}`.trim()} role="group" aria-label={t('nav.language')}>
      {LOCALES.map((item) => (
        <button
          key={item.code}
          type="button"
          lang={item.htmlLang}
          className="lang-btn"
          aria-pressed={locale === item.code}
          aria-label={item.native}
          onClick={() => setLocale(item.code)}
        >
          {item.short}
        </button>
      ))}
    </div>
  )
}

const GLYPHS = {
  corporate: (
    <>
      <path d="M6 41h36" />
      <path d="M11 41V27h6v14M21 41V19h6v22M31 41V9h6v32" />
    </>
  ),
  performance: (
    <>
      <path d="M7 41A34 34 0 0 1 41 7" />
      <path d="M15 41a26 26 0 0 1 26-26" />
      <path d="M23 41a18 18 0 0 1 18-18" />
      <circle cx="40" cy="40" r="2.6" fill="currentColor" stroke="none" />
    </>
  ),
  facilities: (
    <>
      <rect x="8" y="8" width="14" height="14" />
      <rect x="26" y="8" width="14" height="14" fill="currentColor" />
      <rect x="8" y="26" width="14" height="14" />
      <rect x="26" y="26" width="14" height="14" />
    </>
  ),
  it: (
    <>
      <path d="M10 38L24 24h14V10" />
      {[10, 24, 38].flatMap((y) => [10, 24, 38].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill="currentColor" stroke="none" />))}
    </>
  ),
}

/** Line signature of each department — part of its visual identity, always monochrome. */
export const DepartmentGlyph = ({ id, className = '' }) => (
  <svg className={`glyph ${className}`.trim()} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true" focusable="false">
    {GLYPHS[id]}
  </svg>
)
