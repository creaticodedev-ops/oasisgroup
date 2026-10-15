/**
 * Contact form endpoint — a Vercel Function: it only runs when a request arrives, no server to keep online.
 *
 *   GET  /api/contact  → { enabled }  whether e-mail delivery is configured (the site hides the form otherwise)
 *   POST /api/contact  → validates the request and e-mails it to the company through Resend (resend.com)
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   RESEND_API_KEY      API key of the Resend account
 *   CONTACT_TO_EMAIL    address(es) receiving the requests, comma-separated
 *   CONTACT_FROM_EMAIL  sender, on a domain verified in Resend — e.g. "OASIS GROUP <site@your-domain.ma>".
 *                       Defaults to Resend's test sender, which only delivers to the Resend account's own address.
 */

const TYPES = { quote: 'Demande de devis', contact: 'Prise de contact', career: 'Candidature' }
const DEPARTMENTS = {
  group: 'OASIS GROUP — plusieurs expertises / non précisé',
  corporate: 'OASIS CORPORATE',
  performance: 'OASIS PERFORMANCE',
  facilities: 'OASIS FACILITIES',
  it: 'OASIS IT',
}
const LOCALES = { fr: 'Français', en: 'English', ar: 'العربية' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const E164 = /^\+[1-9]\d{6,14}$/
const COUNTRY = /^[A-Z]{2}$/
const MESSAGE_MIN = 20
const MESSAGE_MAX = 4000
const BODY_MAX = 20_000
const DEFAULT_FROM = 'OASIS GROUP <onboarding@resend.dev>'

// Best effort only: each function instance keeps its own counters.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map()

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const recipients = () =>
  (process.env.CONTACT_TO_EMAIL || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => EMAIL.test(value))

const isConfigured = () => Boolean(process.env.RESEND_API_KEY?.trim()) && recipients().length > 0

const rateLimited = (ip) => {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((time) => now - time < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
}

const clientIp = (request) => request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'

/** Browsers always send Origin on cross-site POSTs: only the site's own pages may submit. */
const sameOrigin = (request) => {
  const origin = request.headers.get('origin')
  if (!origin) return true
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

const text = (value, max) => (typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '')

/** Keeps the paragraphs of a message, without runs of blank lines or trailing spaces. */
const paragraphs = (value, max) =>
  typeof value === 'string'
    ? value
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.replace(/[^\S\n]+/g, ' ').trim())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, max)
    : ''

/** The browser validates the phone number against its country and sends it in E.164 ("+212612345678"). */
const validate = (body) => {
  const data = {
    type: text(body.type, 12),
    department: text(body.department, 16) || 'group',
    firstName: text(body.firstName, 60),
    lastName: text(body.lastName, 60),
    company: text(body.company, 120),
    city: text(body.city, 80),
    email: text(body.email, 254).toLowerCase(),
    phone: text(body.phone, 16),
    phoneCountry: COUNTRY.test(body.phoneCountry) ? body.phoneCountry : '',
    message: paragraphs(body.message, MESSAGE_MAX),
    locale: Object.hasOwn(LOCALES, body.locale) ? body.locale : 'fr',
  }
  const errors = {}
  if (!Object.hasOwn(TYPES, data.type)) errors.type = 'invalid'
  if (!Object.hasOwn(DEPARTMENTS, data.department)) errors.department = 'invalid'
  if (data.firstName.length < 2) errors.firstName = 'required'
  if (data.lastName.length < 2) errors.lastName = 'required'
  if (!EMAIL.test(data.email)) errors.email = 'invalid'
  if (!E164.test(data.phone)) errors.phone = 'invalid'
  if (data.message.length < MESSAGE_MIN) errors.message = 'invalid'
  if (body.consent !== true) errors.consent = 'required'
  return { data, errors }
}

const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])

const buildEmail = (data) => {
  const name = `${data.firstName} ${data.lastName}`
  const received = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Casablanca' }).format(new Date())
  const rows = [
    ['Objet', TYPES[data.type]],
    ['Département', DEPARTMENTS[data.department]],
    ['Nom', name],
    [data.type === 'career' ? 'Poste ou domaine' : 'Société', data.company],
    ['E-mail', data.email],
    ['Téléphone', data.phone + (data.phoneCountry ? ` (${data.phoneCountry})` : '')],
    ['Ville', data.city],
    ['Langue du site', LOCALES[data.locale]],
    ['Reçue le', `${received} (heure du Maroc)`],
  ].filter(([, value]) => value)

  const textBody = `${rows.map(([label, value]) => `${label} : ${value}`).join('\n')}\n\nMessage :\n${data.message}\n\n— Formulaire de contact du site OASIS GROUP. Répondez directement à cet e-mail pour écrire à ${name}.`
  const htmlBody = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#111">
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 24px 4px 0;color:#666;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join('')}</table>
<p style="margin:24px 0 8px;color:#666">Message</p>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(data.message)}</p>
<p style="margin:32px 0 0;color:#999;font-size:12px">Formulaire de contact du site OASIS GROUP — répondez directement à cet e-mail pour écrire à ${escapeHtml(name)}.</p>
</div>`

  return { subject: `[Site] ${TYPES[data.type]} — ${DEPARTMENTS[data.department].split(' — ')[0]} — ${name}`, text: textBody, html: htmlBody }
}

const deliver = async (data) => {
  const { subject, text: textBody, html } = buildEmail(data)
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
      to: recipients(),
      reply_to: data.email,
      subject,
      text: textBody,
      html,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!response.ok) throw new Error(`Resend ${response.status}: ${(await response.text()).slice(0, 300)}`)
}

export function GET() {
  return json(200, { enabled: isConfigured() })
}

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { error: 'Forbidden' })
  if (!isConfigured()) return json(503, { error: 'Contact form not configured', code: 'not_configured' })
  if (rateLimited(clientIp(request))) return json(429, { error: 'Too many requests' })

  let body
  try {
    const raw = await request.text()
    if (raw.length > BODY_MAX) return json(413, { error: 'Request too large' })
    body = JSON.parse(raw)
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(400, { error: 'Invalid request' })

  // Honeypot: a field hidden from people; bots that fill it get a normal-looking answer and nothing is sent.
  if (typeof body.website === 'string' && body.website.trim()) return json(201, { ok: true })

  const { data, errors } = validate(body)
  if (Object.keys(errors).length) return json(422, { error: 'Invalid request', fields: errors })

  try {
    await deliver(data)
  } catch (error) {
    console.error('[contact] Delivery failed:', error.message)
    return json(502, { error: 'Delivery failed' })
  }
  return json(201, { ok: true })
}
