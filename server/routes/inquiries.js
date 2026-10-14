import { Router } from 'express'
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'
import { dbState } from '../configs/db.js'
import { DEPARTMENTS, Inquiry, TYPES, toInquiry } from '../models/Inquiry.js'
import { Notification, toNotification } from '../models/Notification.js'
import { publish } from '../services/adminEvents.js'

export const inquiriesRouter = Router()

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const MESSAGE_MIN = 20
const MESSAGE_MAX = 4000
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COUNTRY = /^[A-Z]{2}$/
const hits = new Map()

/**
 * Validates the number against the numbering plan of its country and returns the complete
 * international number in E.164 ("+212612345678"), or null.
 */
const parsePhone = (value, country) => {
  const compact = typeof value === 'string' ? value.trim().replace(/[\s().\-\u00a0\u202f]/g, '').slice(0, 32) : ''
  const input = compact.startsWith('00') ? `+${compact.slice(2)}` : compact
  if (!input) return null
  const defaultCountry = typeof country === 'string' && COUNTRY.test(country) ? country : undefined
  const parsed = parsePhoneNumberFromString(input, defaultCountry)
  return parsed?.isValid() ? { phone: parsed.number, phoneCountry: parsed.country || defaultCountry || '' } : null
}

const rateLimited = (ip) => {
  const now = Date.now()
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_PER_WINDOW
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

const validate = (body = {}) => {
  const phone = parsePhone(body.phone, body.phoneCountry)
  const data = {
    type: text(body.type, 12),
    department: text(body.department, 16) || 'group',
    firstName: text(body.firstName, 60),
    lastName: text(body.lastName, 60),
    company: text(body.company, 120),
    city: text(body.city, 80),
    email: text(body.email, 254).toLowerCase(),
    phone: phone?.phone || '',
    phoneCountry: phone?.phoneCountry || '',
    message: paragraphs(body.message, MESSAGE_MAX),
    locale: ['fr', 'en', 'ar'].includes(body.locale) ? body.locale : 'fr',
  }
  const errors = {}
  if (!TYPES.includes(data.type)) errors.type = 'invalid'
  if (!DEPARTMENTS.includes(data.department)) errors.department = 'invalid'
  if (data.firstName.length < 2) errors.firstName = 'required'
  if (data.lastName.length < 2) errors.lastName = 'required'
  if (!EMAIL.test(data.email)) errors.email = 'invalid'
  if (!phone) errors.phone = 'invalid'
  if (data.message.length < MESSAGE_MIN) errors.message = 'invalid'
  if (body.consent !== true) errors.consent = 'required'
  return { data, errors }
}

/** Stores the admin notification; a failure here must never fail the visitor's submission. */
const notifyAdmin = async (doc) => {
  try {
    const notification = await Notification.create({
      inquiry: doc._id,
      name: `${doc.firstName} ${doc.lastName}`,
      type: doc.type,
      department: doc.department,
      company: doc.company,
    })
    publish('inquiry', { notification: toNotification(notification), inquiry: toInquiry(doc) })
  } catch (error) {
    console.error('[admin] Notification failed:', error.message)
  }
}

inquiriesRouter.post('/', async (req, res, next) => {
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many requests' })
  // Honeypot: a field hidden from people; bots that fill it get a normal-looking answer and nothing is stored.
  if (typeof req.body?.website === 'string' && req.body.website.trim()) {
    return res.status(201).json({ id: 'received', createdAt: new Date() })
  }
  const { data, errors } = validate(req.body)
  if (Object.keys(errors).length) return res.status(422).json({ error: 'Invalid request', fields: errors })
  if (dbState() !== 'connected') return res.status(503).json({ error: 'Database unavailable' })
  try {
    const doc = await Inquiry.create({ ...data, consentAt: new Date() })
    res.status(201).json({ id: doc.id, createdAt: doc.createdAt })
    notifyAdmin(doc)
  } catch (error) {
    next(error)
  }
})
