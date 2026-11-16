import { useEffect, useRef, useState } from 'react'
import { site } from '~/content/site.content'
import { setScrollLock } from '~/lib/scroll-fx'

/**
 * Site header. On the home page it sits over the hero and scrolls away with it (the sticky sub-navigation takes over
 * from there); on every other page it is a plain solid bar. Below 960 px the links move into a full-screen menu.
 */
export function SiteHeader({ overlay }: { overlay: boolean }) {
  const [open, setOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const c = site.contact

  // While the menu is open: the page behind does not scroll, Esc closes it, and focus starts on Close.
  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    setScrollLock(true)
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const burger = burgerRef.current
    return () => {
      document.documentElement.style.overflow = previous
      setScrollLock(false)
      document.removeEventListener('keydown', onKey)
      burger?.focus()
    }
  }, [open])

  return (
    <>
      <header className={overlay ? 'sh' : 'sh sh--solid'}>
        <a href="/" className="sh-logo" aria-label={`${site.brand} home`}>
          <img src="/logo-light.webp" alt={`${site.brand} Travel Management LLP`} width={900} height={275} />
        </a>

        <nav className="sh-nav" aria-label="Primary">
          {site.home.nav.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sh-right">
          <a href={site.cta.memberLoginHref} className="sh-login">
            {site.home.login}
          </a>
          <a href="/#contact" className="btn btn--gold btn--sm">
            {site.cta.quote}
          </a>
          <button
            ref={burgerRef}
            type="button"
            className="sh-burger"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <span />
          </button>
        </div>
      </header>

      <div
        id="site-menu"
        className="sh-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        data-open={open}
        // inert keeps the closed menu out of the tab order and away from screen readers
        {...(!open ? { inert: true } : {})}
      >
        <div className="sh-panel-top">
          <img src="/logo-light.webp" alt="" width={900} height={275} style={{ height: 32, width: 'auto' }} />
          <button ref={closeRef} type="button" className="sh-close" onClick={() => setOpen(false)}>
            Close ✕
          </button>
        </div>
        <nav aria-label="Menu">
          {site.home.nav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
          <a href={site.cta.memberLoginHref} onClick={() => setOpen(false)}>
            {site.home.login}
          </a>
        </nav>
        <div className="sh-panel-foot">
          <a href="/#contact" className="btn btn--gold" onClick={() => setOpen(false)} style={{ color: 'var(--ink)' }}>
            {site.cta.quote}
          </a>
          <a href={c.phoneHref}>{c.phoneDisplay}</a>
          <a href={`mailto:${c.email}`}>{c.email}</a>
          <span>
            {c.hours.join(' · ')} ({c.tz})
          </span>
        </div>
      </div>
    </>
  )
}
