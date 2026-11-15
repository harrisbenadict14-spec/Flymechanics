import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { chapterStart } from '~/lib/scroll'
import { useMotion } from '~/components/motion/MotionProvider'
import { useAfterQuiet } from '~/lib/scroll'

// Chapters that arrive from below: mist drifts across the screen as each one comes in (spec 21.1 #3).
const MIST_AT = ['handle', 'navigator', 'services', 'contact']

// Sky that ages (spec 21.1 #9): dawn, golden hour, blue hour, night, as the whole page progresses.
const SKY: [number, [number, number, number]][] = [
  [0.0, [242, 181, 68]], // dawn gold
  [0.2, [226, 126, 48]], // golden hour
  [0.5, [59, 111, 214]], // blue hour
  [0.85, [26, 42, 108]], // night
  [1.0, [26, 42, 108]],
]

const mix = (a: number, b: number, t: number) => a + (b - a) * t
function skyColour(p: number): string {
  for (let i = 0; i < SKY.length - 1; i++) {
    const [p0, c0] = SKY[i]
    const [p1, c1] = SKY[i + 1]
    if (p >= p0 && p <= p1) {
      const t = (p - p0) / (p1 - p0 || 1)
      return `rgb(${Math.round(mix(c0[0], c1[0], t))},${Math.round(mix(c0[1], c1[1], t))},${Math.round(mix(c0[2], c1[2], t))})`
    }
  }
  return 'rgb(26,42,108)'
}

/**
 * Two fixed layers that sit over the whole page: soft mist that sweeps up the screen as chapters arrive, and a
 * faint colour grade that moves from dawn gold to night blue. Both only run at full motion on tier A. Neither
 * carries content, so they never take focus or clicks.
 */
export function Atmosphere() {
  const { active: motionActive, tier, mode } = useMotion()
  const ready = useAfterQuiet(0) // extras wait for the first interaction or a quiet moment
  const active = motionActive && ready
  const mistRef = useRef<HTMLDivElement>(null)
  const skyRef = useRef<HTMLDivElement>(null)
  const grade = active && mode !== 'off' // the grade is colour only, so Calm keeps it
  const mist = active && tier === 'A' && mode === 'full'

  useEffect(() => {
    if (!grade && !mist) return
    let starts: number[] = []
    let max = 0
    let vh = 0
    const compute = () => {
      starts = MIST_AT.map((id) => chapterStart(id) ?? -1e9)
      vh = window.innerHeight
      max = Math.max(0, document.documentElement.scrollHeight - vh)
    }
    compute()
    ScrollTrigger.addEventListener('refresh', compute)
    const t = window.setTimeout(compute, 1200)

    let raf = 0
    let lastSky = ''
    let lastOpacity = ''
    let lastPosition = ''
    const frame = () => {
      raf = 0
      const y = window.scrollY
      const p = max > 0 ? Math.min(1, y / max) : 0

      // Reading scrollHeight here forced a layout on every scrolled frame; it is measured in compute() instead.
      // Each value is also only written when it actually changes, so a scrolled frame that moves the sky a little
      // does not repaint the full-screen mist as well.
      if (grade && skyRef.current) {
        const colour = skyColour(p)
        if (colour !== lastSky) {
          lastSky = colour
          skyRef.current.style.background = colour
        }
      }

      if (mist && mistRef.current) {
        let k = 0
        for (const s of starts) {
          // Peak half a screen before the chapter locks in, fade over a screen either side.
          const d = Math.abs(y - (s - vh * 0.5)) / (vh * 0.55)
          k = Math.max(k, Math.max(0, 1 - d))
        }
        const el = mistRef.current
        const opacity = (0.78 * k * k).toFixed(3)
        if (opacity !== lastOpacity) {
          lastOpacity = opacity
          el.style.opacity = opacity
        }
        // The mist rises with the scroll. Whole pixels only: sub-pixel moves would repaint it for nothing.
        const position = `0 ${Math.round(-(y * 0.6) % 800)}px, ${Math.round((y * 0.25) % 1200)}px 0`
        if (position !== lastPosition) {
          lastPosition = position
          el.style.backgroundPosition = position
        }
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    frame()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', compute)
    window.addEventListener('resize', onScroll)
    return () => {
      ScrollTrigger.removeEventListener('refresh', compute)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', compute)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(t)
      cancelAnimationFrame(raf)
    }
  }, [grade, mist])

  return (
    <>
      {grade && <div ref={skyRef} className="fx-sky" aria-hidden="true" />}
      {mist && <div ref={mistRef} className="fx-mist" aria-hidden="true" />}
    </>
  )
}
