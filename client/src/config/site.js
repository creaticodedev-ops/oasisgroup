const env = import.meta.env

/**
 * Public company details. Leave a value empty until it is confirmed —
 * empty fields are simply not rendered (nothing is invented).
 */
export const SITE = {
  name: 'OASIS GROUP',
  url: env.VITE_SITE_URL || '',
  contact: {
    email: env.VITE_CONTACT_EMAIL || '',
    phone: env.VITE_CONTACT_PHONE || '',
    whatsapp: env.VITE_CONTACT_WHATSAPP || '',
    address: env.VITE_COMPANY_ADDRESS || '',
    hours: env.VITE_CONTACT_HOURS || '',
  },
  legal: {
    company: env.VITE_LEGAL_NAME || '',
    form: env.VITE_LEGAL_FORM || '',
    rc: env.VITE_LEGAL_RC || '',
    ice: env.VITE_LEGAL_ICE || '',
    taxId: env.VITE_LEGAL_IF || '',
  },
  social: {
    linkedin: env.VITE_SOCIAL_LINKEDIN || '',
    instagram: env.VITE_SOCIAL_INSTAGRAM || '',
    facebook: env.VITE_SOCIAL_FACEBOOK || '',
  },
}

/** Home page sections, in display order. `primary` items are shown in the desktop bar; the full menu lists them all. */
export const NAV_ITEMS = [
  { id: 'about', key: 'about', primary: true },
  { id: 'expertises', key: 'expertises', primary: true },
  { id: 'why', key: 'why', primary: true },
  { id: 'commitments', key: 'commitments' },
  { id: 'projects', key: 'projects', primary: true },
  { id: 'careers', key: 'careers', primary: true },
  { id: 'contact', key: 'contact' },
]

const httpsUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:' ? value : ''
  } catch {
    return ''
  }
}

/** Official accounts. Only networks with a configured https:// URL are displayed. */
export const SOCIAL_LINKS = Object.keys(SITE.social)
  .map((key) => ({ key, url: httpsUrl(SITE.social[key]) }))
  .filter((item) => item.url)

export const LEGAL_ITEMS = Object.entries(SITE.legal)
  .filter(([, value]) => value)
  .map(([key, value]) => ({ key, value }))
