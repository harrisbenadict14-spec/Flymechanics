import { site } from '~/content/site.content'
import { WithMarkers } from '~/components/ui/OwnerConfirm'

/** Footer: brand and tagline on the left, four link groups on the right, legal line at the bottom. */
export function SiteFooter() {
  const c = site.contact
  const g = site.home.footerGroups
  return (
    <footer className="sf">
      <div className="sf-top">
        <div className="sf-brand">
          <img src="/logo-light.webp" alt={`${site.brand} Travel Management LLP`} width={900} height={275} loading="lazy" />
          <p>{site.home.footerTagline}</p>
        </div>

        <nav className="sf-cols" aria-label="Footer">
          <div>
            <h2>{g.services}</h2>
            <ul>
              {site.services.map((s) => (
                <li key={s.n}>
                  <a href={`/#s${s.n}`}>{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{g.company}</h2>
            <ul>
              {site.home.nav.slice(1).map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
              <li>
                <a href={site.cta.memberLoginHref}>{site.cta.memberLogin}</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>{g.contact}</h2>
            <ul>
              <li>
                <a href={c.phoneHref}>{c.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
              <li>
                <a href={c.whatsapp}>{site.cta.whatsapp}</a>
              </li>
            </ul>
          </div>
          <div>
            <h2>{g.legal}</h2>
            <ul>
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="sf-bottom">
        <p>
          © {new Date().getFullYear()} <WithMarkers text={c.legalEntity} />
        </p>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  )
}
