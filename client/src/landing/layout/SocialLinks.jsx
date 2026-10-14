import { SOCIAL_LINKS } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'

const ICONS = {
  linkedin: (
    <>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="2" />
      <path d="M7.75 10.5v6M7.75 7.6v.01M11.5 16.5v-6M11.5 13c0-1.6 1-2.6 2.4-2.6s2.35.95 2.35 2.6v3.5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: <path d="M14.5 8.25h2.25V4.75H14.5c-2.35 0-3.75 1.6-3.75 3.9v2.1H8.25v3.4h2.5v6.1h3.5v-6.1h2.4l.6-3.4h-3V9.1c0-.55.3-.85.75-.85z" />,
}

/** Official accounts — only networks with a configured URL are shown (nothing is linked by default). */
export const SocialLinks = ({ className = '' }) => {
  const { t } = useI18n()
  if (!SOCIAL_LINKS.length) return null
  return (
    <ul className={`social ${className}`.trim()} aria-label={t('footer.social.label')}>
      {SOCIAL_LINKS.map(({ key, url }) => {
        const network = t(`footer.social.${key}`)
        return (
          <li key={key}>
            <a className="social-link" href={url} target="_blank" rel="noopener noreferrer me" aria-label={t('footer.social.follow', { network })} title={network}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONS[key]}
              </svg>
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export default SocialLinks
