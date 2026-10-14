import { useEffect } from 'react'
import { useI18n } from '../i18n/I18nProvider'
import { ContactProvider } from './contact/ContactProvider'
import { scrollToSection, useReveal, useScrollProgress } from './hooks'
import { Footer } from './layout/Footer'
import { Navbar } from './layout/Navbar'
import { parseRoute, usePathname } from './navigation'
import { DepartmentPage } from './pages/DepartmentPage'
import { HomePage } from './pages/HomePage'
import './landing.css'

export const LandingPage = () => {
  const { locale } = useI18n()
  const pathname = usePathname()
  const route = parseRoute(pathname) || { name: 'home' }
  const pageKey = route.name === 'department' ? route.slug : 'home'

  useReveal(`${locale}|${pathname}`)
  useScrollProgress()

  // Deep links (/#contact, /expertises/it#contact): the target exists only once React has rendered.
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (!id) return undefined
    const frame = requestAnimationFrame(() => scrollToSection(id, 'auto'))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <ContactProvider>
      <Navbar route={route} />
      <main id="main" tabIndex={-1} key={pageKey}>
        {route.name === 'department' ? <DepartmentPage slug={route.slug} /> : <HomePage />}
      </main>
      <Footer />
    </ContactProvider>
  )
}

export default LandingPage
