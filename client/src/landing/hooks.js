import { useEffect, useRef, useState } from 'react'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ───────────── Shared scroll loop: one passive listener, one rAF per frame, any number of subscribers ───────────── */

const subscribers = new Set()
let frame = 0

const run = () => {
  frame = 0
  subscribers.forEach((callback) => callback())
}

const schedule = () => {
  if (!frame) frame = requestAnimationFrame(run)
}

const onFrame = (callback) => {
  if (!subscribers.size) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
  }
  subscribers.add(callback)
  schedule()
  return () => {
    subscribers.delete(callback)
    if (subscribers.size) return
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }
}

/**
 * Marks every `[data-reveal]` element with `data-in` once it enters the viewport. Re-scans when `rescanKey` changes.
 * An attribute rather than a class: React rewrites `className` on re-render and would drop it.
 */
export const useReveal = (rescanKey) => {
  useEffect(() => {
    const elements = [...document.querySelectorAll('[data-reveal]:not([data-in])')]
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.setAttribute('data-in', ''))
      return undefined
    }
    document.documentElement.classList.add('has-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-in', '')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
    )
    // Already on screen (e.g. the bottom of a full-height hero, inside the root margin): reveal on the next frame.
    const onScreen = elements.filter((el) => {
      const box = el.getBoundingClientRect()
      return box.top < window.innerHeight && box.bottom > 0
    })
    const frame = requestAnimationFrame(() => onScreen.forEach((el) => el.setAttribute('data-in', '')))
    elements.filter((el) => !onScreen.includes(el)).forEach((el) => observer.observe(el))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [rescanKey])
}

/** Exposes page scroll progress (0 → 1) as `--scroll` on <html>, for the reading progress line. */
export const useScrollProgress = () => {
  useEffect(() => {
    const root = document.documentElement
    return onFrame(() => {
      const max = root.scrollHeight - window.innerHeight
      root.style.setProperty('--scroll', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
    })
  }, [])
}

/**
 * Calls `onProgress(p)` while `ref` crosses the viewport: 0 when its top reaches the bottom of the screen,
 * 1 when its bottom leaves the top. With `pinned`, the range is the element's extra height (sticky layouts).
 */
export const useElementProgress = (ref, onProgress, { pinned = false } = {}) => {
  const callback = useRef(onProgress)
  useEffect(() => {
    callback.current = onProgress
  })

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) {
      callback.current?.(1)
      return undefined
    }
    return onFrame(() => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -vh || rect.top > vh * 2) return
      const progress = pinned
        ? -rect.top / Math.max(1, rect.height - vh)
        : (vh - rect.top) / (vh + rect.height)
      callback.current?.(Math.min(1, Math.max(0, progress)))
    })
  }, [ref, pinned])
}

/** Subtle vertical parallax: writes `--py` (px) on the element, from +amount to -amount across the viewport. */
export const useParallax = (ref, amount = 60) => {
  useElementProgress(ref, (progress) => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const scale = window.innerWidth < 760 ? 0.5 : 1
    el.style.setProperty('--py', `${((0.5 - progress) * 2 * amount * scale).toFixed(1)}px`)
  })
}

/**
 * Returns the id of the last section (in display order) whose top has passed the reading line of the viewport.
 * At the very end of the page the last id wins.
 */
export const useActiveSection = (ids) => {
  const [active, setActive] = useState(null)
  const key = ids.join('|')

  useEffect(() => {
    const list = key.split('|')
    return onFrame(() => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(list[list.length - 1])
        return
      }
      const line = window.innerHeight * 0.45
      let current = null
      list.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      })
      setActive(current)
    })
  }, [key])

  return active
}

/** True once the page has scrolled past `offset` px; `hidden` when scrolling down past the first screen. */
export const useScrollDirection = (offset = 24) => {
  const [state, setState] = useState({ scrolled: false, hidden: false })
  useEffect(() => {
    let last = window.scrollY
    return onFrame(() => {
      const y = window.scrollY
      const delta = y - last
      last = y
      setState((prev) => {
        const scrolled = y > offset
        let hidden = prev.hidden
        if (y < window.innerHeight * 0.6) hidden = false
        else if (delta > 6) hidden = true
        else if (delta < -6) hidden = false
        return prev.scrolled === scrolled && prev.hidden === hidden ? prev : { scrolled, hidden }
      })
    })
  }, [offset])
  return state
}

/** Sizes a single-line wordmark so that its first child spans exactly the width of `ref`. */
export const useFitText = (ref) => {
  useEffect(() => {
    const el = ref.current
    const inner = el?.firstElementChild
    if (!el || !inner) return undefined
    let lastWidth = 0

    const fit = (force = false) => {
      const width = el.clientWidth
      if (!width || (!force && width === lastWidth)) return
      lastWidth = width
      el.style.fontSize = '100px'
      const natural = inner.scrollWidth
      if (natural) el.style.fontSize = `${Math.floor((100 * width * 100) / natural) / 100}px`
    }

    const observer = new ResizeObserver(() => fit())
    observer.observe(el)
    document.fonts?.ready.then(() => fit(true))
    return () => observer.disconnect()
  }, [ref])
}

export const scrollToSection = (id, behavior) => {
  const smooth = behavior || (prefersReducedMotion() ? 'auto' : 'smooth')
  if (!id || id === 'top') {
    window.scrollTo({ top: 0, behavior: smooth })
    return true
  }
  const target = document.getElementById(id)
  if (!target) return false
  target.scrollIntoView({ behavior: smooth, block: 'start' })
  return true
}
