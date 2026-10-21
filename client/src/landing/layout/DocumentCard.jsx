import { BROCHURE } from '../../config/site'
import { useI18n } from '../../i18n/I18nProvider'

/** Minimal document glyph — outline only, matches the site’s monochrome icons. */
const DocumentIcon = ({ size = 28 }) => (
  <svg className="doc-icon" width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    <path d="M9 3.5h9.5L25 10v18.5H9V3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M18.5 3.5V10H25" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    <path d="M13 16.5h6M13 20.5h6M13 24.5h3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
)

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M1.5 8s2.4-4.5 6.5-4.5S14.5 8 14.5 8s-2.4 4.5-6.5 4.5S1.5 8 1.5 8z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="square" />
  </svg>
)

/** Editorial brochure card — Contact section. Opens the PDF only when the visitor chooses. */
export const DocumentCard = ({ className = '' }) => {
  const { t } = useI18n()
  const doc = BROCHURE

  return (
    <article className={`doc-card ${className}`.trim()}>
      <div className="doc-card-mark" aria-hidden="true">
        <DocumentIcon />
        <span className="doc-card-format">PDF</span>
      </div>
      <div className="doc-card-body">
        <p className="doc-card-kind">{t('documents.brochure.kind')}</p>
        <h4 className="doc-card-title">{t('documents.brochure.title')}</h4>
        <p className="doc-card-text">{t('documents.brochure.text')}</p>
        <p className="doc-card-meta">
          <span>{t('documents.brochure.meta', { year: doc.year, pages: doc.pages })}</span>
        </p>
      </div>
      <div className="doc-card-actions">
        <a className="doc-action doc-action-view" href={doc.href} target="_blank" rel="noopener noreferrer">
          <EyeIcon />
          <span>{t('documents.view')}</span>
          <span className="sr-only"> {t('common.newTab')}</span>
        </a>
        <a className="doc-action doc-action-download" href={doc.href} download={doc.downloadName}>
          <DownloadIcon />
          <span>{t('documents.download')}</span>
        </a>
      </div>
    </article>
  )
}

/** Compact inline cue for the quotation form — does not load the PDF until clicked. */
export const BrochureHint = ({ className = '' }) => {
  const { t } = useI18n()
  const doc = BROCHURE

  return (
    <p className={`doc-hint ${className}`.trim()}>
      <DocumentIcon size={18} />
      <span>{t('documents.brochure.hint')}</span>
      <a className="link-line" href={doc.href} target="_blank" rel="noopener noreferrer">
        {t('documents.brochure.hintLink')}
        <span className="sr-only"> {t('common.newTab')}</span>
      </a>
    </p>
  )
}

/** Footer / secondary text link. */
export const BrochureLink = ({ className = '' }) => {
  const { t } = useI18n()
  const doc = BROCHURE

  return (
    <a className={`link-line ${className}`.trim()} href={doc.href} target="_blank" rel="noopener noreferrer">
      {t('documents.brochure.footer')}
      <span className="sr-only"> {t('common.newTab')}</span>
    </a>
  )
}

export default DocumentCard
