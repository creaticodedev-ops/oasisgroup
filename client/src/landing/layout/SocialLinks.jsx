import { SOCIAL_LINKS } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'
import { DiagonalArrow } from '../ui'

/** Official brand glyphs (LinkedIn "in" bug, Instagram glyph), drawn monochrome on a 24px grid. */
const ICONS = {
  linkedin: (
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.948 1.637-2.182 3.37-2.182 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  ),
  instagram: (
    <>
      <rect x="1.08" y="1.08" width="21.84" height="21.84" rx="5.92" fill="none" stroke="currentColor" strokeWidth="2.16" />
      <circle cx="12" cy="12" r="5.08" fill="none" stroke="currentColor" strokeWidth="2.16" />
      <circle cx="18.41" cy="5.59" r="1.44" />
    </>
  ),
  facebook: <path d="M14.5 8.25h2.25V4.75H14.5c-2.35 0-3.75 1.6-3.75 3.9v2.1H8.25v3.4h2.5v6.1h3.5v-6.1h2.4l.6-3.4h-3V9.1c0-.55.3-.85.75-.85z" />,
}

export const SocialIcon = ({ network, size = 20, className = '' }) => (
  <svg className={`social-icon ${className}`.trim()} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    {ICONS[network]}
  </svg>
)

const external = (url) => ({ href: url, target: '_blank', rel: 'noopener noreferrer me' })

/** Arrow that leaves through the top corner while its twin slides in on hover. */
const ExitArrow = ({ className, size = 16 }) => (
  <span className={className} aria-hidden="true">
    <DiagonalArrow size={size} />
    <DiagonalArrow size={size} />
  </span>
)

/** Compact icon row — full-screen menu. */
export const SocialLinks = ({ className = '' }) => {
  const { t } = useI18n()
  if (!SOCIAL_LINKS.length) return null
  return (
    <ul className={`social ${className}`.trim()} aria-label={t('footer.social.label')}>
      {SOCIAL_LINKS.map(({ key, url }) => {
        const network = t(`footer.social.${key}`)
        return (
          <li key={key}>
            <a className="social-link" {...external(url)} aria-label={t('footer.social.follow', { network })} title={network}>
              <SocialIcon network={key} size={17} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}

/** Editorial list — footer. */
export const SocialRail = ({ className = '' }) => {
  const { t } = useI18n()
  if (!SOCIAL_LINKS.length) return null
  return (
    <div className={`social-rail ${className}`.trim()}>
      <p className="social-rail-title">{t('footer.social.title')}</p>
      <ul aria-label={t('footer.social.label')}>
        {SOCIAL_LINKS.map(({ key, url, handle }) => (
          <li key={key}>
            <a className="social-rail-link" {...external(url)}>
              <SocialIcon network={key} size={18} />
              <span className="social-rail-name">{t(`footer.social.${key}`)}</span>
              <span className="social-rail-handle" dir="ltr">
                {handle}
              </span>
              <ExitArrow className="social-arrow" size={14} />
              <span className="sr-only"> {t('common.newTab')}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Outlined cards — Contact section. */
export const SocialCards = ({ className = '' }) => {
  const { t } = useI18n()
  if (!SOCIAL_LINKS.length) return null
  return (
    <ul className={`social-cards ${className}`.trim()} aria-label={t('footer.social.label')}>
      {SOCIAL_LINKS.map(({ key, url, handle }, index) => (
        <li key={key}>
          <a className="social-card" {...external(url)}>
            <SocialIcon network={key} size={176} className="social-card-ghost" />
            <span className="social-card-top">
              <SocialIcon network={key} size={26} className="social-card-icon" />
              <span className="social-card-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
            </span>
            <span className="social-card-body">
              <span className="social-card-kind">{t(`footer.social.kinds.${key}`)}</span>
              <span className="social-card-name">{t(`footer.social.${key}`)}</span>
            </span>
            <span className="social-card-foot">
              <span className="social-card-handle" dir="ltr">
                {handle}
              </span>
              <ExitArrow className="social-arrow" />
            </span>
            <span className="sr-only"> {t('common.newTab')}</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export default SocialLinks
