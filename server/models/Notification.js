import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['inquiry'], default: 'inquiry' },
    inquiry: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true },
    name: { type: String, required: true, maxlength: 130 },
    type: { type: String, required: true },
    department: { type: String, required: true },
    company: { type: String, default: '' },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ readAt: 1 })

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema)

export const toNotification = (doc) => ({
  id: String(doc._id),
  kind: doc.kind,
  inquiry: String(doc.inquiry),
  name: doc.name,
  type: doc.type,
  department: doc.department,
  company: doc.company || '',
  read: Boolean(doc.readAt),
  readAt: doc.readAt,
  createdAt: doc.createdAt,
})
