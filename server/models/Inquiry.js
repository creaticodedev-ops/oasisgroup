import mongoose from 'mongoose'

/** Requests sent from the public contact form. */
export const TYPES = ['quote', 'contact', 'career']
/** `group` = several departments, or the visitor did not know which one to choose. */
export const DEPARTMENTS = ['group', 'corporate', 'performance', 'facilities', 'it']
export const STATUSES = ['pending', 'approved', 'rejected', 'active', 'completed']

/** Status changes the admin may apply from a given status (new → qualified → in progress → handled). */
export const TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['active', 'rejected', 'pending'],
  rejected: ['pending'],
  active: ['completed'],
  completed: ['active'],
}

const historySchema = new mongoose.Schema(
  {
    from: { type: String, enum: STATUSES, required: true },
    status: { type: String, enum: STATUSES, required: true },
    at: { type: Date, required: true },
  },
  { _id: false },
)

const inquirySchema = new mongoose.Schema(
  {
    type: { type: String, enum: TYPES, required: true, index: true },
    department: { type: String, enum: DEPARTMENTS, default: 'group', index: true },
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    company: { type: String, trim: true, maxlength: 120, default: '' },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    // International format (E.164), used for calls and the WhatsApp follow-up from the dashboard.
    phone: { type: String, required: true, trim: true, maxlength: 16 },
    phoneCountry: { type: String, trim: true, maxlength: 2 },
    city: { type: String, trim: true, maxlength: 80, default: '' },
    message: { type: String, required: true, trim: true, maxlength: 4000 },
    consentAt: { type: Date, required: true },
    locale: { type: String, enum: ['fr', 'en', 'ar'], default: 'fr' },
    status: { type: String, enum: STATUSES, default: 'pending', index: true },
    history: { type: [historySchema], default: [] },
  },
  { timestamps: true },
)

inquirySchema.index({ createdAt: -1 })

export const Inquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema)

export const toInquiry = (doc) => ({
  id: String(doc._id),
  type: doc.type,
  department: doc.department,
  firstName: doc.firstName,
  lastName: doc.lastName,
  company: doc.company || '',
  email: doc.email,
  phone: doc.phone,
  phoneCountry: doc.phoneCountry || '',
  city: doc.city || '',
  message: doc.message,
  locale: doc.locale,
  status: doc.status,
  history: (doc.history || []).map(({ from, status, at }) => ({ from, status, at })),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
})
