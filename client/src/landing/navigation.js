/* Minimal client-side router: home page and the four department pages. */
import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { findDepartment } from '../config/departments'
import { prefersReducedMotion, scrollToSection } from './hooks'

const ROUTE_EVENT = 'oasis:route'

const subscribe = (callback) => {
  window.addEventListener('popstate', callback)
  window.addEventListener(ROUTE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(ROUTE_EVENT, callback)
  }
}

const getPathname = () => window.location.pathname

export const usePathname = () => useSyncExternalStore(subscribe, getPathname)

/** `/` → home, `/expertises/<slug>` → department page; anything else is not a public route. */
export const parseRoute = (pathname) => {
  if (pathname === '/' || pathname === '') return { name: 'home' }
  const match = pathname.match(/^\/expertises\/([a-z-]+)\/?$/)
  if (match && findDepartment(match[1])) return { name: 'department', slug: match[1] }
  return null
}

const scrollAfterRender = (hash) => {
  if (!hash || !scrollToSection(hash.slice(1), 'auto')) window.scrollTo(0, 0)
}

/**
 * Client-side navigation. Same-page anchors scroll smoothly; page changes go through the
 * View Transitions API when available (the CSS in landing.css defines the curtain).
 */
export const navigate = (href) => {
  const url = new URL(href, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }
  if (url.pathname === window.location.pathname) {
    const id = url.hash.slice(1)
    scrollToSection(id || 'top')
    window.history.replaceState(null, '', `${url.pathname}${url.hash}`)
    return
  }
  const go = () => {
    window.history.pushState(null, '', `${url.pathname}${url.hash}`)
    flushSync(() => window.dispatchEvent(new Event(ROUTE_EVENT)))
    scrollAfterRender(url.hash)
  }
  if (document.startViewTransition && !prefersReducedMotion()) document.startViewTransition(go)
  else go()
}

export const isPlainClick = (event) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented

/** Link target for a home page section, valid from any page. */
export const sectionHref = (id) => `/#${id}`
