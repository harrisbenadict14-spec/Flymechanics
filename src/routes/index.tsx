import { createFileRoute } from '@tanstack/react-router'
import { site } from '~/content/site.content'
import {
  ApproachBand,
  Closing,
  FaqSection,
  Hero,
  HowBand,
  MobileCta,
  ServicesBand,
  SubNav,
  SupportCards,
  usePageReveal,
} from '~/components/site/sections'

const SITE_URL = 'https://flymechanics.com'

// Structured data uses only confirmed facts: no address, no legal name, no unconfirmed answers (spec 15).
const organization = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: 'Flymechanics',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.webp`,
  image: `${SITE_URL}/og/og-default.jpg`,
  telephone: '+919994426333',
  email: site.contact.email,
  areaServed: 'IN',
  openingHours: ['Mo-Fr 09:00-17:00', 'Sa 10:00-15:00'],
}
const faqPage = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  // Questions whose answer still holds an owner marker are left out until confirmed.
  mainEntity: site.faq
    .filter((f) => !f.a.includes('[CONFIRM'))
    .map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}
const services = site.services.map((s) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: s.title,
  description: s.body,
  provider: { '@type': 'TravelAgency', name: 'Flymechanics', url: SITE_URL },
  areaServed: 'IN',
}))

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Flymechanics' },
      { property: 'og:title', content: 'Corporate travel management in Chennai | Flymechanics' },
      { property: 'og:description', content: `${site.descriptor}. ${site.tagline}` },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: `${SITE_URL}/og/og-default.jpg` },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:locale', content: 'en_IN' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Corporate travel management in Chennai | Flymechanics' },
      { name: 'twitter:description', content: `${site.descriptor}. ${site.tagline}` },
      { name: 'twitter:image', content: `${SITE_URL}/og/og-default.jpg` },
    ],
    links: [
      { rel: 'canonical', href: SITE_URL },
      // The hero photo is the largest thing in the first paint: ask for it as early as possible.
      { rel: 'preload', as: 'image', type: 'image/webp', href: '/img/hero.webp', media: '(min-width: 821px)', fetchPriority: 'high' },
      { rel: 'preload', as: 'image', type: 'image/webp', href: '/img/hero-m.webp', media: '(max-width: 820px)', fetchPriority: 'high' },
    ],
    scripts: [organization, faqPage, ...services].map((d) => ({ type: 'application/ld+json', children: JSON.stringify(d) })),
  }),
  component: Home,
})

/**
 * The landing page, in the order set by the template blueprint (docs/template-analysis): hero, sticky sub-navigation,
 * three bands (services, approach, how it works), FAQ, support, and the closing band with the quote form.
 */
function Home() {
  usePageReveal()
  return (
    <>
      <Hero />
      <SubNav />
      <ServicesBand />
      <ApproachBand />
      <HowBand />
      <FaqSection />
      <SupportCards />
      <Closing />
      <MobileCta />
    </>
  )
}
