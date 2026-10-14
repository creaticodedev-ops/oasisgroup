import { useCallback, useMemo, useState } from 'react'
import { scrollToSection } from '../hooks'
import { ContactContext } from './context'

export const ContactProvider = ({ children }) => {
  const [intent, setIntent] = useState(null)

  const requestContact = useCallback((next = {}) => {
    setIntent({ type: next.type || 'quote', department: next.department || '', at: Date.now() })
    requestAnimationFrame(() => {
      scrollToSection('contact')
      window.history.replaceState(null, '', `${window.location.pathname}#contact`)
    })
  }, [])

  const value = useMemo(() => ({ intent, requestContact }), [intent, requestContact])
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>
}

export default ContactProvider
