import { useEffect, type ReactNode } from 'react'
import { site } from '~/content/site.content'

/**
 * A plain full-page message in the site's own look, for the two moments a visitor lands outside the real pages:
 * an address that does not exist, and an unexpected error. Both offer a way back and the direct contact details.
 */
function StatusPage({ title, tabTitle, children }: { title: string; tabTitle: string; children: ReactNode }) {
  useEffect(() => {
    const previous = document.title
    document.title = `${tabTitle} | ${site.brand}`
    return () => {
      document.title = previous
    }
  }, [tabTitle])

  return (
    <div className="legal" data-theme="light">
      <div className="legal-inner" style={{ minHeight: '100svh', alignContent: 'start' }}>
        <h1 className="t-display m-0" style={{ fontSize: 'clamp(40px, 6vw, 96px)' }}>
          {title}
        </h1>
        {children}
        <p className="m-0" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href="/" className="pill pill--solid" style={{ textDecoration: 'none' }}>
            Back to the home page
          </a>
          <a href="/#contact" className="pill pill--outline" style={{ textDecoration: 'none' }}>
            {site.cta.quote}
          </a>
        </p>
        <p className="t-body m-0">
          Or reach us directly: <a href={site.contact.phoneHref}>{site.contact.phoneDisplay}</a> ·{' '}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
        </p>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  return (
    <StatusPage title="Page not found" tabTitle="Page not found">
      <p className="t-body m-0">The address may be mistyped, or the page may have moved.</p>
    </StatusPage>
  )
}

export function ErrorPage({ reset }: { reset?: () => void }) {
  return (
    <StatusPage title="Something went wrong" tabTitle="Something went wrong">
      <p className="t-body m-0">This page could not be shown. Reloading it usually helps.</p>
      {reset && (
        <p className="m-0">
          <button type="button" className="pill pill--outline" onClick={reset}>
            Try again
          </button>
        </p>
      )}
    </StatusPage>
  )
}
