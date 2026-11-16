/// <reference types="vite/client" />
import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import appCss from '~/styles/app.css?url'
import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url'
import jakartaLatin from '@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url'
import { site } from '~/content/site.content'
import { useSmoothScroll } from '~/lib/scroll-fx'
import { SiteHeader } from '~/components/site/SiteHeader'
import { SiteFooter } from '~/components/site/SiteFooter'
import { ErrorPage, NotFoundPage } from '~/components/ui/StatusPage'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'Corporate travel management in Chennai | Flymechanics' },
      // Built only from approved copy: the descriptor and the tagline.
      { name: 'description', content: `${site.descriptor}. ${site.tagline}` },
      { name: 'theme-color', content: '#05070d' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'preload', as: 'font', type: 'font/woff2', href: jakartaLatin, crossOrigin: 'anonymous' },
      { rel: 'preload', as: 'font', type: 'font/woff2', href: interLatin, crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
  // An unknown address or an unexpected error still shows the site's header and a way back, not a bare line of text.
  notFoundComponent: NotFoundPage,
  errorComponent: ({ reset }) => (
    <main id="main">
      <ErrorPage reset={reset} />
    </main>
  ),
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The script below adds a class before the first paint, and React must not complain that <html> differs.
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Marks that scripts run, so the scroll reveals (which start hidden) only apply when they can be shown. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  // The header lies over the hero on the home page only; elsewhere it is a solid bar above the content.
  const isHome = useRouterState({ select: (s) => s.location.pathname === '/' })
  useSmoothScroll()
  return (
    <>
      <nav aria-label="Skip links">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
      </nav>
      <SiteHeader overlay={isHome} />
      <main id="main">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}
