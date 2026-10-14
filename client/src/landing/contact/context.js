import { createContext, useContext } from 'react'

export const REQUEST_TYPES = ['quote', 'contact', 'career']

export const ContactContext = createContext(null)

/** `{ intent, requestContact({ type, department }) }` — pre-fills the contact form and scrolls to it. */
export const useContact = () => {
  const ctx = useContext(ContactContext)
  if (!ctx) throw new Error('useContact must be used within ContactProvider')
  return ctx
}
