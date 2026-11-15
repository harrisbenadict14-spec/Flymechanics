import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react'

export interface ScrambleHandle {
  /** 0 = nothing shown yet, 1 = final text. In between, characters decode left to right from random glyphs. */
  render: (progress: number) => void
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>'

const useIsoLayoutEffect = typeof window === 'undefined' ? () => undefined : useLayoutEffect

/**
 * Scramble text (spec 7.5, brief C11). The final text is always real DOM text for screen readers; the
 * scrambled glyphs are aria-hidden and only run when the parent drives `render`. Each character box keeps
 * the width of its final character, so decoding never shifts the layout. Static pages never call `render`
 * and show the final text.
 */
export const ScrambleText = forwardRef<ScrambleHandle, { text: string; className?: string }>(function ScrambleText(
  { text, className = '' },
  ref,
) {
  const boxRef = useRef<HTMLSpanElement>(null)
  const words = useMemo(() => {
    const out: { text: string; start: number }[] = []
    let pos = 0
    for (const w of text.split(' ')) {
      out.push({ text: w, start: pos })
      pos += w.length + 1
    }
    return out
  }, [text])

  // Cached for the same reason: render() runs on every scroll frame, and a DOM query per frame per line is waste.
  const elsRef = useRef<HTMLElement[] | null>(null)
  const chars = () => {
    if (!elsRef.current) elsRef.current = Array.from(boxRef.current?.querySelectorAll<HTMLElement>('[data-c]') ?? [])
    return elsRef.current
  }

  useImperativeHandle(
    ref,
    () => ({
      render(p: number) {
        const els = chars()
        const n = text.length
        for (const el of els) {
          const i = Number(el.dataset.i)
          const next =
            p >= 1 || p >= (i + 1) / (n + 1)
              ? text[i]
              : p <= 0
                ? ''
                : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          // Decoded characters keep their glyph, so most of the line is written once instead of every frame.
          if (el.textContent !== next) el.textContent = next
        }
      },
    }),
    [text],
  )

  // Fix each box to the width of its final character (after fonts load), so scrambling cannot shift the line.
  useIsoLayoutEffect(() => {
    elsRef.current = null
    const fix = () => {
      const els = chars()
      const prev = els.map((el) => el.textContent)
      // Write all, read all, write all: one layout pass, not one per character.
      els.forEach((el) => {
        el.style.width = ''
        el.textContent = text[Number(el.dataset.i)]
      })
      const widths = els.map((el) => el.getBoundingClientRect().width)
      els.forEach((el, i) => {
        el.style.width = `${widths[i]}px`
        el.textContent = prev[i]
      })
    }
    fix()
    void document.fonts?.ready.then(fix)
  }, [text])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span ref={boxRef} aria-hidden="true">
        {/* Characters are grouped by word, so a line can only break between words. */}
        {words.map((w, wi) => (
          <span key={wi}>
            <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
              {Array.from(w.text).map((ch, ci) => (
                <span key={ci} data-c data-i={w.start + ci} style={{ display: 'inline-block', textAlign: 'center' }}>
                  {ch}
                </span>
              ))}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </span>
  )
})
