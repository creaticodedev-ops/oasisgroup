const env = import.meta.env

/**
 * Public company details. Leave a value empty until it is confirmed —
 * empty fields are simply not rendered (nothing is invented).
 */
export const SITE = {
  name: 'OASIS GROUP',
  url: env.VITE_SITE_URL || '',
  contact: {
    address: 'N° 38, Lotissement Zitoun, Safi, Maroc',
    mobile: { display: '06 61 76 69 16', tel: '+212661766916' },
    landline: { display: '05 24 46 72 11', tel: '+212524467211' },
    email: env.VITE_CONTACT_EMAIL || '',
    whatsapp: env.VITE_CONTACT_WHATSAPP || '',
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
    linkedin: 'https://www.linkedin.com/company/oasisgroup-ma/',
    instagram: 'https://www.instagram.com/oasisgroup.ma?obrf=MWVybDNqb2ZwZ3NseQ==',
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

/** Public handle shown next to a network name, read from the profile URL itself. */
const socialHandle = (key, url) => {
  const segments = new URL(url).pathname.split('/').filter(Boolean)
  const name = segments.at(-1) || ''
  return key === 'instagram' ? `@${name}` : name
}

/** Official accounts. Only networks with a configured https:// URL are displayed. */
export const SOCIAL_LINKS = Object.keys(SITE.social)
  .map((key) => ({ key, url: httpsUrl(SITE.social[key]) }))
  .filter((item) => item.url)
  .map((item) => ({ ...item, handle: socialHandle(item.key, item.url) }))

const mapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

/** Contact details in display order, shared by the Contact section and the footer. */
export const CONTACT_ITEMS = (() => {
  const { address, mobile, landline, email, whatsapp, hours } = SITE.contact
  return [
    address && { key: 'address', value: address, href: mapsUrl(address), external: true },
    mobile && { key: 'mobile', value: mobile.display, href: `tel:${mobile.tel}`, ltr: true },
    landline && { key: 'landline', value: landline.display, href: `tel:${landline.tel}`, ltr: true },
    email && { key: 'email', value: email, href: `mailto:${email}`, ltr: true },
    whatsapp && { key: 'whatsapp', value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`, ltr: true, external: true },
    hours && { key: 'hours', value: hours },
  ].filter(Boolean)
})()

export const LEGAL_ITEMS = Object.entries(SITE.legal)
  .filter(([, value]) => value)
  .map(([key, value]) => ({ key, value }))
