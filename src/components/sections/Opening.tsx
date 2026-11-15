import { useEffect, useRef, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { site } from '~/content/site.content'
import { ScrubVideo, type ScrubHandle } from '~/components/motion/ScrubVideo'
import { useMotion } from '~/components/motion/MotionProvider'
import { calmPinFactor } from '~/config/motion'
import { registerAnchors, scheduleRefresh } from '~/lib/scroll'
import { CallbackCard } from './CallbackCard'
import { WithMarkers } from '~/components/ui/OwnerConfirm'

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger)

const FULL = 'inset(0% 0% 0% 0% round 0px)'
// The logo artwork is 1865 x 570. These are the x positions where it is cut into pieces: the kite, then
// F L Y M E C H A N I C S. Each cut sits in the gap between two letters.
const LOGO_W = 1865
const LOGO_CUTS = [0, 294, 434, 528, 661, 840, 958, 1103, 1237, 1399, 1544, 1594, 1741, LOGO_W]
// public/logo-hero.webp is that artwork with a white halo painted in (so it reads over the sky film without a live
// CSS filter, which had to be redrawn on every scrolled frame) and LOGO_PAD px of room around it for the halo.
const LOGO_PAD = 64
const LOGO_FULL_W = LOGO_W + 2 * LOGO_PAD
const LOGO_PIECES = LOGO_CUTS.slice(0, -1).map((from, i) => {
  const to = LOGO_CUTS[i + 1]
  const last = i === LOGO_CUTS.length - 2
  // The outer pieces keep the halo room; neighbours overlap by a hair so no seam shows where two pieces meet.
  const left = i === 0 ? 0 : ((LOGO_PAD + from) / LOGO_FULL_W) * 100 - 0.05
  const right = last ? 0 : 100 - ((LOGO_PAD + to) / LOGO_FULL_W) * 100 - 0.05
  return { key: from, clipPath: `inset(0 ${right.toFixed(3)}% 0 ${left.toFixed(3)}%)` }
})
const words = site.statement.split(' ')
// The approved tagline "Time flies. It's up to you to be the navigator." split over two lines.
const TAGLINE = [site.scramble.first + " It's up to you", 'to be the navigator.']
// Fixed positions, sizes and timings (not random), so the server and browser draw the same dust.
const DUST: CSSProperties[] = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 97}%`,
  top: `${(i * 53 + 17) % 91}%`,
  width: 2 + (i % 3),
  height: 2 + (i % 3),
  animationDuration: `${14 + (i % 5) * 4}s`,
  animationDelay: `${-((i * 3) % 17)}s`,
}))

// Timeline units. Hero 3.4 units at 200vh, statement 4.25 units at 250vh: the same scroll speed (1.7 units per 100vh).
// Hero: three still-sky text slides (1 unit each), the landing page appears, then the airliner flies (scroll plays
// the film), the landing text lifts away and the film closes into the window frame.
const SLIDE = 1 // scroll length of one text slide
const REVEAL = 3 * SLIDE // the landing page appears here
const PLANE = REVEAL + 0.6 // the airliner starts to fly
const LEAVE = PLANE + 1.7 // the landing text lifts away
const WINDOW = PLANE + 2.4 // the film closes into the window frame
const HERO_END = WINDOW + 0.8
const K = 1.37 // statement scale
const st = (x: number) => HERO_END + x * K

/**
 * Chapters 01 and 02 as one pinned stage, so the handover is exact (spec 21.2).
 *  01 Hero: a full-bleed sky film (an airliner seen from below, climbing away) behind a white wordmark, the tagline
 *     and two buttons. Scrolling plays the film (the sky turns golden), the text lifts away, and the film closes into
 *     the aircraft-window frame.
 *  02 Statement: the same frame continues with the window film, which grows to full bleed while the words
 *     light up one by one (spec 21.1 #6). The clip ends on bright city, so the chapter dips to dark.
 * Without motion (tier C, Pause, reduced motion, Save-Data) the two chapters are plain stacked sections.
 */
export function Opening() {
  const { active, mode } = useMotion()
  // Calm shortens every pinned scroll by 40% (spec 21.7).
  const pinFactor = mode === 'calm' ? calmPinFactor : 1
  const stageRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const statementRef = useRef<HTMLElement>(null)
  const heroFilmRef = useRef<HTMLDivElement>(null)
  const stFilmRef = useRef<HTMLDivElement>(null)
  const heroVideo = useRef<ScrubHandle>(null)
  const stVideo = useRef<ScrubHandle>(null)

  useEffect(() => {
    if (!active) return
    const stage = stageRef.current
    const hero = heroRef.current
    const statement = statementRef.current
    const heroFilm = heroFilmRef.current
    const stFilm = stFilmRef.current
    const letters = hero?.querySelectorAll<HTMLElement>('[data-letter]')
    if (!stage || !hero || !statement || !heroFilm || !stFilm || !letters) return

    let pinTrigger: ScrollTrigger | undefined
    const ctx = gsap.context(() => {
      const windowClip = () =>
        getComputedStyle(document.documentElement).getPropertyValue('--window').trim() || FULL

      // ---- The first screen is one still scene. Its text slides and the landing page are shown by a small state
      // machine (below), each change a soft time-based cross-dissolve; the scroll only chooses which one. ----
      const slides = Array.from(hero.querySelectorAll<HTMLElement>('[data-slide]'))
      const lines = Array.from(hero.querySelectorAll<HTMLElement>('[data-line]'))
      const wordmark = hero.querySelector<HTMLElement>('[data-wordmark]')
      const late = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-late]'))
      const dust = hero.querySelector<HTMLElement>('[data-dust]')
      const landing = [wordmark, ...lines, ...late, dust].filter((e): e is HTMLElement => !!e)
      // These fade through the --rev variable (and scroll-out through --out), so the two never fight over opacity.
      gsap.set(heroFilm, { '--rev': window.scrollY < 8 ? 0 : 1 })
      gsap.set(landing, { '--rev': 0 })
      gsap.set(lines, { y: 18 })
      gsap.set(wordmark, { y: 14 })
      gsap.set(slides, { opacity: 0 })

      let state = -1 // -1: not shown yet, 0 to 2: text slide, 3: landing page
      let landingTl: gsap.core.Timeline | undefined
      const fly = (on: boolean) => {
        if (on) hero.dataset.fly = ''
        else delete hero.dataset.fly
      }
      const hideLanding = (d: number) => {
        landingTl?.kill()
        fly(false)
        gsap.to(landing, { '--rev': 0, duration: d, ease: 'power1.inOut', overwrite: 'auto' })
      }
      const showLanding = () => {
        // Logo (with its subtitle), then the headline line by line, then nav, buttons and chapter note; the airliner's
        // slow drift and the gold dust only begin once all of it is in.
        landingTl = gsap
          .timeline()
          .to(slides, { opacity: 0, duration: 0.5, ease: 'power1.inOut' }, 0)
          .to(wordmark, { '--rev': 1, y: 0, duration: 1, ease: 'power2.out' }, 0.35)
          .to(lines, { '--rev': 1, y: 0, duration: 0.9, stagger: 0.2, ease: 'power2.out' }, 1.0)
          .to(late, { '--rev': 1, duration: 1, ease: 'power1.out' }, 1.9)
          .to(dust, { '--rev': 1, duration: 1.2 }, 2.4)
          .call(() => fly(true), [], 2.9)
      }
      const go = (next: number, immediate = false) => {
        const prev = state
        state = next
        if (immediate) {
          landingTl?.kill()
          gsap.killTweensOf([...slides, ...landing])
          gsap.set(slides, { opacity: 0, y: 0 })
          if (next < 3) {
            fly(false)
            gsap.set(landing, { '--rev': 0 })
            gsap.set(slides[next], { opacity: 1 })
          } else {
            gsap.set(landing, { '--rev': 1, y: 0 })
            fly(true)
          }
          return
        }
        if (prev === 3 && next < 3) hideLanding(0.5)
        // Cross-dissolve: the old slide fades out while the new one fades up into the same place.
        slides.forEach((el, i) => {
          if (i === next) {
            gsap.fromTo(
              el,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.6, delay: prev === -1 ? 0.5 : 0.2, ease: 'power2.out', overwrite: 'auto' },
            )
          } else if (i === prev) {
            gsap.to(el, { opacity: 0, duration: 0.45, ease: 'power1.inOut', overwrite: 'auto' })
          }
        })
        if (next === 3) showLanding()
      }
      // Which state a scroll position (in timeline units) belongs to.
      const stateAt = (u: number) => (u >= REVEAL ? 3 : Math.min(2, Math.floor(u / SLIDE)))

      if (window.scrollY < 8) {
        // First visit at the top: the sky fades in over 0.6 s, then slide 1 rises into place.
        gsap.to(heroFilm, { '--rev': 1, duration: 0.6, ease: 'power1.out' })
        go(0)
      }

      const heroP = { p: 0 }
      const outP = { v: 1 } // 1 = landing text in place, 0 = lifted away; the hero's CSS reads it as --out
      const stP = { p: 0 }
      let pastHero = false

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${Math.round(((HERO_END + 3.1 * K) / 1.7) * 100 * pinFactor)}%`,
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const u = self.progress * (HERO_END + 3.1 * K)
            const want = stateAt(u)
            if (state === -1) go(want, true) // opened part-way down the page: show that state at once
            else if (want !== state) go(want)
            const past = u >= HERO_END
            if (past !== pastHero) {
              pastHero = past
              window.dispatchEvent(new CustomEvent('fm:pasthero', { detail: past }))
            }
          },
        },
      })

      pinTrigger = tl.scrollTrigger

      // ---- Chapter 01 (after the slides and the landing reveal) ----
      tl.set(statement, { opacity: 0 }, 0)
        // The landing text lifts away (through --out, see the CSS) as the airliner climbs.
        .to(outP, { v: 0, duration: 0.8, onUpdate: () => hero.style.setProperty('--out', String(outP.v)) }, LEAVE)
        .to(letters, { yPercent: -45, opacity: 0, duration: 0.7, stagger: 0.025 }, LEAVE + 0.15)
        // The dark tint that keeps the white text readable clears as the text leaves.
        .to('[data-hero-scrim]', { opacity: 0, duration: 1 }, LEAVE)
        // Only now does the airliner fly: the film plays as you scroll and the sky turns golden. Until here the
        // film is held on its first frame.
        .to(heroP, { p: 1, duration: 2.4, onUpdate: () => heroVideo.current?.seek(heroP.p) }, PLANE)
        // Close into the window frame; the page is black around it.
        .fromTo(heroFilm, { clipPath: FULL }, { clipPath: windowClip, duration: 0.8, ease: 'power2.inOut' }, WINDOW)

      // ---- Handover: chapter 02 starts in the same frame ----
      // The slide's buttons and form can only be reached while the slide is showing: hidden, so they are out of the
      // tab order, before and after; the layer itself ignores the pointer, so they take it back.
      tl.set(statement, { opacity: 1 }, HERO_END)
        .set(hero, { autoAlpha: 0 }, HERO_END)
        .set('[data-st-ui]', { visibility: 'visible', pointerEvents: 'auto' }, HERO_END)

      // ---- Chapter 02 ----
      tl.fromTo(stFilm, { clipPath: windowClip }, { clipPath: FULL, duration: 1 * K, ease: 'power2.inOut' }, st(0.9))
        .to(stP, { p: 1, duration: 3 * K, onUpdate: () => stVideo.current?.seek(stP.p) }, st(0))
        .fromTo('[data-w]', { opacity: 0.15 }, { opacity: 1, duration: 0.14 * K, stagger: 0.05 * K }, st(0.1))
        .to('[data-scrim]', { opacity: 1, duration: 0.8 * K }, st(0.9))
        // The supporting copy, buttons and card rise in one after another once the headline has lit up.
        .fromTo('[data-st-rise]', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.32 * K, stagger: 0.09 * K, ease: 'power2.out' }, st(0.55))
        .to('[data-st-text]', { opacity: 0, duration: 0.3 * K }, st(2.45))
        .set('[data-st-ui]', { visibility: 'hidden', pointerEvents: 'none' }, st(2.75))
        .to('[data-dip]', { opacity: 1, duration: 0.5 * K }, st(2.6))
        .to({}, { duration: 0.1 }, st(3.1))
    }, stage)
    const unregister = registerAnchors({ hero: 0, statement: HERO_END / (HERO_END + 3.1 * K) }, pinTrigger!)
    scheduleRefresh()
    return () => {
      unregister()
      ctx.revert()
      hero.style.removeProperty('--out')
      delete hero.dataset.fly
      window.dispatchEvent(new CustomEvent('fm:pasthero', { detail: false }))
    }
  }, [active, pinFactor])

  return (
    <div
      ref={stageRef}
      // Motion and static layouts are switched by class, never by inline style: GSAP restores inline styles
      // when it reverts, which would undo React's changes.
      className={`stage ${active ? 'stage--motion' : ''}`}
    >
      {/* Without JavaScript the two chapters simply stack as normal sections. */}
      <noscript>
        <style>{`.stage{height:auto!important}.stage-layer{position:relative!important;opacity:1!important;visibility:visible!important}[data-intro]{opacity:1!important}`}</style>
      </noscript>

      {/* Spec 7.2: H1 for SEO and screen readers while the wordmark is the visible title. It sits outside the
          hero layer, which is hidden after the handover, so the page always has its heading. */}
      <h1 className="sr-only">Corporate travel management in Chennai</h1>

      {/* ---------------------------------------------------------------- 01 Hero */}
      <section
        ref={heroRef}
        id="hero"
        data-theme="dark"
        className="stage-layer hero2 overflow-hidden"
        style={{
          zIndex: 1,
          minHeight: '100svh',
          padding: 'var(--margin) var(--margin) calc(var(--margin) + var(--hud-bottom) + 12px)',
        }}
      >
        {/* The sky film fills the whole screen from the first frame. Without motion it is the still first frame. */}
        <div ref={heroFilmRef} data-hero-film data-intro aria-hidden="true" className="absolute inset-0 z-0" style={{ pointerEvents: 'none' }}>
          <div className="hero-drift">
            <ScrubVideo ref={heroVideo} mediaKey="hero" poster="start" />
          </div>
        </div>
        <div data-hero-scrim aria-hidden="true" className="hero-scrim" />
        {/* Very faint gold dust, drawn with CSS so it also runs on phones and costs no scripting. */}
        <div data-hero-fade data-dust data-intro aria-hidden="true" className="hero-dust">
          {DUST.map((d, i) => (
            <i key={i} style={d} />
          ))}
        </div>

        <nav data-hero-fade data-hero-late data-intro aria-label="Page sections" className="hero-nav">
          <a href="#services">Explore</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
          <a href={site.cta.memberLoginHref}>Login</a>
        </nav>

        <div className="hero-copy">
          <div className="hero-wordmark">
            {/* The logo is one image shown as 13 pieces (the kite, then each letter with the strip below it), so the
                pieces can rise and lift away one by one like the old text wordmark did. */}
            <div data-wordmark data-intro role="img" aria-label={`${site.brand} Travel Management LLP`} className="hero-logo">
              {LOGO_PIECES.map((p) => (
                <span key={p.key} data-letter className="hero-logo-piece" style={{ clipPath: p.clipPath }} />
              ))}
            </div>
          </div>
          <div className="hero-msg">
            {/* The three text slides share one spot with the final headline, over the still sky. */}
            {site.heroSlides.map((text) => (
              <p key={text} data-slide className="hero-tagline hero-slide">
                <WithMarkers text={text} />
              </p>
            ))}
            <p data-hero-fade className="hero-tagline">
              {/* Two lines, revealed one after the other. The text is the approved tagline, split at the same point. */}
              {TAGLINE.map((line) => (
                <span key={line} data-line data-intro className="hero-line">
                  {line}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div data-hero-fade data-hero-late data-intro className="hero-cta">
          <a href="#services" className="pill pill--glass">
            {site.cta.services}
          </a>
          <a href={site.cta.memberLoginHref} className="pill pill--glass">
            {site.cta.memberLogin}
          </a>
        </div>

        <p data-hero-fade data-hero-late data-intro className="hero-chapter t-label" aria-hidden="true">
          Chapter 01 / 09 <span>Takeoff</span>
        </p>
      </section>

      {/* ---------------------------------------------------------------- 02 Statement */}
      <section
        ref={statementRef}
        id="statement"
        data-theme="dark"
        className="stage-layer stage-layer--late overflow-hidden"
        style={{
          zIndex: 2,
          minHeight: '100svh',
          padding: 'var(--margin) var(--margin) calc(var(--margin) + var(--hud-bottom))',
        }}
      >
        <div ref={stFilmRef} className="absolute inset-0" style={{ clipPath: 'var(--window)' }} aria-hidden="true">
          <ScrubVideo ref={stVideo} mediaKey="statement" poster={active ? 'start' : 'end'} />
          <div
            data-scrim
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, rgba(5,7,13,0.78) 0%, rgba(5,7,13,0.5) 45%, rgba(5,7,13,0.05) 100%)',
            }}
          />
        </div>

        <div className="st-layout">
          <div data-st-text className="st-top">
            <p className="t-label m-0" style={{ color: 'var(--on-black-78)' }}>
              ( Who we are )
            </p>
            <p className="t-statement st-statement m-0">
              {words.map((w, i) => (
                <span key={i} data-w className="inline-block" style={{ marginRight: '0.28em' }}>
                  {w}
                </span>
              ))}
            </p>
            <p data-st-rise className="st-intro t-body m-0">
              {site.consult.intro}
            </p>
            <p data-st-rise data-st-ui className="st-actions m-0">
              <a href="#contact" className="pill pill--gold">
                {site.cta.quote}
              </a>
              <a href={site.contact.whatsapp} className="pill pill--outline">
                {site.cta.whatsapp}
              </a>
            </p>
            <ul data-st-rise className="st-ticks m-0">
              {site.consult.ticks.map((tick) => (
                <li key={tick}>{tick}</li>
              ))}
            </ul>
          </div>

          <div data-st-text data-st-ui className="st-bottom">
            <CallbackCard />
            <div data-st-rise className="cb-panel">
              <p className="t-label m-0">{site.consult.panelTitle}</p>
              <a href={site.contact.phoneHref} className="cb-phone">
                {site.contact.phoneDisplay}
              </a>
              <p className="cb-hours m-0">
                {site.contact.hours[0]} ({site.contact.tz})
              </p>
            </div>
          </div>
        </div>

        <div
          data-dip
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{ background: 'var(--black)', opacity: 0 }}
        />
      </section>
    </div>
  )
}
