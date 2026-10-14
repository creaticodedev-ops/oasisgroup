import { ar } from '../i18n/dictionaries/ar'
import { en } from '../i18n/dictionaries/en'
import { fr } from '../i18n/dictionaries/fr'
import { getNested, numberLocale } from '../i18n/locales'

const PUBLIC = { fr, en, ar }

const SUBJECTS = {
  fr: { quote: 'demande de devis', contact: 'prise de contact', career: 'candidature' },
  en: { quote: 'quote request', contact: 'message', career: 'application' },
  ar: { quote: 'طلب عرض السعر', contact: 'طلب التواصل', career: 'طلب الترشح' },
}

/* Written in the language the visitor used on the form, whatever language the admin works in. */
const TEMPLATES = {
  fr: ({ name, subject, department, date, signature }) =>
    `Bonjour ${name},\n\nNous vous remercions pour votre ${subject} adressée à ${department}, reçue le ${date}. Elle est désormais prise en charge par notre équipe.\n\nNous revenons vers vous très prochainement pour en échanger. Vous pouvez également nous répondre directement ici, sur WhatsApp.\n\nOASIS GROUP\n${signature}`,
  en: ({ name, subject, department, date, signature }) =>
    `Hello ${name},\n\nThank you for your ${subject} to ${department}, received on ${date}. It is now being handled by our team.\n\nWe will get back to you shortly to discuss it. You can also reply to us directly here on WhatsApp.\n\nOASIS GROUP\n${signature}`,
  ar: ({ name, subject, department, date, signature }) =>
    `مرحباً ${name}،\n\nنشكركم على ${subject} الموجّه إلى ${department}، والذي تم استلامه بتاريخ ${date}. وقد أصبح الآن في عهدة فريقنا.\n\nسنعود إليكم قريباً جداً لمناقشته. يمكنكم أيضاً الرد علينا مباشرة هنا عبر واتساب.\n\nOASIS GROUP\n${signature}`,
}

export const messageLocale = (item) => (TEMPLATES[item.locale] ? item.locale : 'fr')

export const followUpMessage = (item) => {
  const locale = messageLocale(item)
  const text = (key) => getNested(PUBLIC[locale], key) ?? key
  const department = item.department && item.department !== 'group' ? text(`departments.${item.department}.name`) : 'OASIS GROUP'
  return TEMPLATES[locale]({
    name: item.firstName.trim(),
    subject: SUBJECTS[locale][item.type] || SUBJECTS[locale].contact,
    department,
    date: new Intl.DateTimeFormat(numberLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(item.createdAt)),
    signature: text('common.signature'),
  })
}

/** Number stored by the API in international format (+ country code); wa.me expects digits only. */
export const whatsappUrl = (phone, message) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`

/** Opens WhatsApp in a new tab; returns false when no window handle came back (popup blocked, or some embedded browsers). */
export const openWhatsApp = (phone, message) => {
  const win = window.open(whatsappUrl(phone, message), '_blank')
  if (!win) return false
  win.opener = null
  return true
}
