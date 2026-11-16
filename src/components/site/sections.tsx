import { Fragment, useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { site } from '~/content/site.content'
import { OwnerConfirm, WithMarkers } from '~/components/ui/OwnerConfirm'
import { QuoteForm } from '~/components/ui/QuoteForm'

/** Stagger helper for scroll reveals: the nth item waits n steps (see `[data-reveal]` in site.css). */
const delay = (n: number) => ({ '--d': n }) as CSSProperties

/**
 * A heading whose words rise out of a mask one after another. Put `data-reveal="words"` on the heading: the reveal
 * observer adds `.is-in` when it scrolls into view. The words stay ordinary text, separated by spaces.
 */
function Words({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="w">
            <span className="w-i" style={{ '--i': i } as CSSProperties}>
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

const emergencyFaq = site.faq.find((f) => f.q.toLowerCase().includes('office hours'))

// ------------------------------------------------------------------------------------------------ page motion
/**
 * Reveals each `[data-reveal]` element as it scrolls into view and plays the reveal backwards when it leaves through
 * the bottom of the screen (scrolling up). An element that has gone off the top stays revealed, so it is already there
 * when you scroll back to it. It reveals at 12% visible and un-reveals only when fully out of view, so it never flickers
 * on the edge. Everything is visible without scripts and under reduced motion (the stylesheet handles both).
 */
export function usePageReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
            entry.target.classList.add('is-in')
          } else if (!entry.isIntersecting && entry.boundingClientRect.top > 0) {
            // fully below the screen: it left through the bottom, so scrolling is going up
            entry.target.classList.remove('is-in')
          }
        }
      },
      { threshold: [0, 0.12], rootMargin: '0px 0px -6% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ------------------------------------------------------------------------------------------------ hero
/** Full-screen opening: the sky photo, a centred headline and action, and four floating cards at the edges. */
export function Hero() {
  return (
    <section className="hero" id="top" data-hero data-fx="hero">
      <picture>
        <source media="(max-width: 820px)" srcSet="/img/hero-m.webp" />
        <img className="hero-bg" src="/img/hero.webp" alt="" width={1920} height={1080} fetchPriority="high" decoding="async" />
      </picture>

      <figure className="hero-float hero-float--a" aria-hidden="true">
        <img src="/img/float-1.webp" alt="" width={800} height={600} loading="lazy" />
      </figure>
      <figure className="hero-float hero-float--b" aria-hidden="true">
        <img src="/img/float-2.webp" alt="" width={800} height={600} loading="lazy" />
      </figure>
      <figure className="hero-float hero-float--c" aria-hidden="true">
        <img src="/img/float-3.webp" alt="" width={800} height={600} loading="lazy" />
      </figure>
      <div className="hero-float hero-ui" aria-hidden="true">
        <p>{site.home.modesLabel}</p>
        <ul>
          {site.modes.map((mode) => (
            <li key={mode}>{mode}</li>
          ))}
        </ul>
      </div>

      <div className="hero-stack">
        <p className="eyebrow" data-reveal>
          {site.descriptor}
        </p>
        <h1 className="h-hero" data-reveal="words" style={delay(1)}>
          <Words text={site.tagline} />
        </h1>
        <p className="hero-actions" data-reveal style={delay(2)}>
          <a href="#contact" className="btn btn--gold">
            {site.cta.quote}
          </a>
          <a href="#services" className="btn btn--ghost">
            {site.cta.services}
          </a>
        </p>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ bands
function SectionHead({ heading, text, children }: { heading: string; text?: string; children?: ReactNode }) {
  return (
    <div className="sec-head">
      <h2 className="h-sec" data-reveal="words">
        <Words text={heading} />
      </h2>
      <div className="sec-head-side" data-reveal style={delay(1)}>
        {text && <p className="p-lead">{text}</p>}
        {children}
      </div>
    </div>
  )
}

interface CardProps {
  /** Reading order, used when the two columns collapse into one on phones. */
  i: number
  id?: string
  tall?: boolean
  title: string
  body?: string
  tags?: string
  img: string
  children?: ReactNode
}

function Card({ i, id, tall, title, body, tags, img, children }: CardProps) {
  return (
    <article id={id} className={tall ? 'card card--tall' : 'card'} style={{ '--i': i } as CSSProperties} data-reveal data-fx="view">
      <img className="card-media" src={img} alt="" width={1400} height={966} loading="lazy" decoding="async" />
      <div className="card-body">
        <h3 className="h-card">{title}</h3>
        {body && <p className="p-card">{body}</p>}
        {tags && <p className="card-tags">{tags}</p>}
      </div>
      {children}
    </article>
  )
}

/** Two interlocking columns: tall and short cards alternate so the columns end level (blueprint 2.2 F). */
function Bento({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="bento">
      <div className="bento-col">{left}</div>
      <div className="bento-col">{right}</div>
    </div>
  )
}

/** Band 1: the six services. */
export function ServicesBand() {
  const cards = site.services.map((s, i) => {
    const note = 'note' in s ? s.note : undefined
    const partners = 'partners' in s ? s.partners : undefined
    return (
      <Card
        key={s.n}
        i={i}
        id={`s${s.n}`}
        // the first and last cards are the tall ones, so both columns come out the same height
        tall={i === 0 || i === 5}
        title={s.title}
        body={s.body}
        tags={s.tags}
        img={`/img/svc-${s.n}.webp`}
      >
        <ul className="card-list">
          {s.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {note && <p className="card-note">{note}</p>}
        {partners && (
          <p className="card-note">
            <OwnerConfirm>{partners}</OwnerConfirm>
          </p>
        )}
      </Card>
    )
  })
  return (
    <section className="band" id="services">
      <SectionHead heading={site.statement} text={site.handle.line}>
        <a href="#contact" className="btn btn--ghost">
          {site.cta.quote}
        </a>
      </SectionHead>
      <Bento left={[cards[0], cards[2], cards[4]]} right={[cards[1], cards[3], cards[5]]} />
    </section>
  )
}

const APPROACH_IMG = ['/img/approach-1.webp', '/img/approach-2.webp', '/img/approach-3.webp']

/** Band 2: how Flymechanics works (data, experience, value) and its reach. */
export function ApproachBand() {
  const a = site.approach
  const cols = a.columns.map((c, i) => <Card key={c.t} i={i} tall={i === 0} title={c.t} body={c.d} img={APPROACH_IMG[i]} />)
  const reach = (
    <Card key="reach" i={3} tall title={site.navigator.title} body={site.navigator.body} img="/img/reach.webp">
      <ul className="card-list">
        {site.modes.map((mode) => (
          <li key={mode}>{mode}</li>
        ))}
      </ul>
    </Card>
  )
  return (
    <section className="band" id="approach">
      <SectionHead heading={a.statement}>
        <a href="#contact" className="btn btn--ghost">
          {site.cta.quote}
        </a>
      </SectionHead>
      <Bento left={[cols[0], cols[1]]} right={[cols[2], reach]} />
    </section>
  )
}

/** Band 3: four numbered steps. */
export function HowBand() {
  const how = site.home.how
  return (
    <section className="band" id="how">
      <SectionHead heading={how.heading} text={site.close.sub}>
        <a href="#contact" className="btn btn--ghost">
          {site.cta.quote}
        </a>
      </SectionHead>
      <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {how.steps.map((step, i) => (
          <li key={step.title} className="step" data-reveal data-fx="view" style={delay(i % 2)}>
            <span className="step-n">Step {i + 1}</span>
            <h3 className="h-card">{step.title}</h3>
            <p className="p-card">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ FAQ
/** Heading on the left, questions on the right; any number can be open. */
export function FaqSection() {
  const uid = useId()
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <section className="faqs" id="faq">
      <h2 className="h-sec" data-reveal="words">
        <Words text={site.home.faqHeading} />
      </h2>
      <div className="faqs-list">
        {site.faq.map((item, i) => {
          const isOpen = !!open[i]
          return (
            <div key={item.q} className="faq-item" data-reveal style={delay(i)}>
              <h3>
                <button
                  type="button"
                  className="faq-q"
                  id={`${uid}-q${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-a${i}`}
                  onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </button>
              </h3>
              <div id={`${uid}-a${i}`} role="region" aria-labelledby={`${uid}-q${i}`} className="faq-a" data-open={isOpen}>
                <div>
                  <p>
                    <WithMarkers text={item.a} />
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ support
/** Two outlined cards: call and email. */
export function SupportCards() {
  const c = site.contact
  const s = site.home.support
  return (
    <section className="support" id="support">
      <h2 className="h-sec" data-reveal="words">
        <Words text={s.heading} />
      </h2>
      <div className="support-grid">
        <a href={c.phoneHref} className="support-card" data-reveal>
          <h3 className="h-card">{s.call}</h3>
          <strong>{c.phoneDisplay}</strong>
          <p>
            {c.hours.slice(0, 2).join(' · ')} ({c.tz})
          </p>
          <span className="support-arrow" aria-hidden="true">
            →
          </span>
        </a>
        <a href={`mailto:${c.email}`} className="support-card" data-reveal style={delay(1)}>
          <h3 className="h-card">{s.email}</h3>
          <strong>{c.email}</strong>
          <span className="support-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ closing + form
/** The closing call to action, the contact details and the quote form. */
export function Closing() {
  const c = site.contact
  return (
    <section className="closing" id="contact" data-closing>
      <div className="closing-top" data-fx="view">
        <h2 className="h-hero" data-reveal="words">
          <Words text={site.close.heading} />
        </h2>
        <p className="p-lead" data-reveal style={delay(1)}>
          {site.close.sub}
        </p>
        <p className="hero-actions" data-reveal style={delay(2)}>
          <a href="#quote-form" className="btn btn--gold">
            {site.cta.quote}
          </a>
          <a href={c.whatsapp} className="btn btn--ghost">
            {site.cta.whatsapp}
          </a>
        </p>
      </div>

      <div className="closing-grid">
        <dl className="details" data-reveal>
          <div>
            <dt>Phone</dt>
            <dd>
              <a href={c.phoneHref}>{c.phoneDisplay}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </dd>
          </div>
          <div>
            <dt>Hours</dt>
            <dd>
              {c.hours.map((h) => (
                <span key={h}>{h}</span>
              ))}
              <span style={{ color: 'var(--text-muted)' }}>{c.tz}</span>
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>
              <WithMarkers text={c.address} />
            </dd>
          </div>
          {emergencyFaq && (
            <div>
              <dt>After hours</dt>
              <dd>
                <WithMarkers text={emergencyFaq.a} />
              </dd>
            </div>
          )}
        </dl>

        <div className="form-card" data-reveal style={delay(1)}>
          <QuoteForm />
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------------------------------------ phone action bar
/** A fixed "Request a quote" button on phones: shown after the hero, hidden once the form is on screen. */
export function MobileCta() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const hero = document.querySelector('[data-hero]')
    const closing = document.querySelector('[data-closing]')
    if (!hero || !closing || !('IntersectionObserver' in window)) return
    let heroIn = true
    let closingIn = false
    const update = () => setShow(!heroIn && !closingIn)
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroIn = entry.isIntersecting
        else closingIn = entry.isIntersecting
      }
      update()
    })
    io.observe(hero)
    io.observe(closing)
    return () => io.disconnect()
  }, [])
  return (
    <div className="mcta" data-show={show} {...(!show ? { inert: true } : {})}>
      <a href="#contact" className="btn btn--gold">
        {site.cta.quote}
      </a>
    </div>
  )
}
