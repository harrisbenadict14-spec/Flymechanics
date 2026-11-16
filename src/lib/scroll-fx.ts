import { useEffect } from 'react'

/**
 * Scroll motion for the whole site, kept small:
 *  - useSmoothScroll(): eased, inertial wheel scrolling (Lenis, loaded after first paint).
 *  - useScrollFx(): writes a 0-1 progress number into the CSS variable `--p` of every `[data-fx]` element that is near the
 *    screen; the stylesheet turns that number into movement (parallax, fades, scale). Nothing here moves anything itself.
 * Both do nothing when the visitor prefers reduced motion, and the page is complete without them.
 */

// In-page links: Lenis reads `scroll-padding-top` (in site.css) itself, so targets stop where the stylesheet says.

interface LenisLike {
  scrollTo(target: number | string | HTMLElement, options?: { offset?: number; immediate?: boolean }): void
  start(): void
  stop(): void
  destroy(): void
}

let lenis: LenisLike | null = null

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Pauses or resumes page scrolling (used while the full-screen menu is open). */
export function setScrollLock(locked: boolean) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}

export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    let cancelled = false
    let instance: LenisLike | null = null
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      instance = new Lenis({ lerp: 0.1, anchors: true, autoRaf: true }) as unknown as LenisLike
      lenis = instance
      // Lets the preview scroll to an exact position when checking the page (development only).
      if (import.meta.env.DEV) (window as unknown as { __lenis?: LenisLike }).__lenis = instance
    })
    return () => {
      cancelled = true
      instance?.destroy()
      if (lenis === instance) lenis = null
    }
  }, [])
}

const clamp = (n: number) => Math.min(1, Math.max(0, n))

export function useScrollFx() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-fx]'))
    if (!els.length) return

    // Only elements near the screen are measured on each frame.
    const near = new Set<HTMLElement>()
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement
          if (entry.isIntersecting) near.add(el)
          else {
            near.delete(el)
            // leave the element at its end value, so it does not jump back when it scrolls out of range
            write(el)
          }
        }
        schedule()
      },
      { rootMargin: '15% 0px 15% 0px' },
    )

    function progress(el: HTMLElement) {
      if (el.dataset.fx === 'hero') return clamp(window.scrollY / Math.max(1, el.offsetHeight))
      // 0 as the element's top reaches the bottom of the screen, 1 as its bottom leaves the top
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      return clamp((vh - rect.top) / (vh + rect.height))
    }
    function write(el: HTMLElement) {
      el.style.setProperty('--p', progress(el).toFixed(4))
    }

    let frame = 0
    function schedule() {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        near.forEach(write)
      })
    }

    els.forEach((el) => {
      io.observe(el)
      write(el)
    })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
}
