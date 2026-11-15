import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { site } from '~/content/site.content'
import { SERVICE_OPTIONS, validateQuote, type QuoteErrors, type QuoteInput } from '~/lib/quote-validation'
import { submitQuote } from '~/server/quote'

const EMPTY: QuoteInput = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  travellers: '',
  message: '',
  consent: false,
  website: '',
}

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string }

const TURNSTILE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id?: string) => void }
  }
}

/** Quote request form (spec section 13). Visible labels, inline text errors, aria-live status. */
export function QuoteForm() {
  const uid = useId()
  const [values, setValues] = useState<QuoteInput>(EMPTY)
  const [errors, setErrors] = useState<QuoteErrors>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const turnstileRef = useRef<HTMLDivElement>(null)
  const turnstileId = useRef<string | undefined>(undefined)

  // Slide 2's call-back card sends its three fields here, then scrolls to this form to finish the request.
  useEffect(() => {
    const onPrefill = (ev: Event) => {
      const d = (ev as CustomEvent<{ name?: string; phone?: string; service?: string }>).detail ?? {}
      setValues((v) => ({
        ...v,
        name: d.name?.trim() || v.name,
        phone: d.phone?.trim() || v.phone,
        service: d.service || v.service,
      }))
    }
    window.addEventListener('fm:prefill', onPrefill)
    return () => window.removeEventListener('fm:prefill', onPrefill)
  }, [])

  // Spam check widget, only when a site key is configured. The form leaves the page while the thank-you message is
  // shown, so the widget is drawn again each time the form comes back ("Send another request").
  const formShown = status.kind !== 'sent'
  useEffect(() => {
    if (!TURNSTILE_KEY || !formShown || !turnstileRef.current) return
    const el = turnstileRef.current
    let cancelled = false
    const render = () => {
      if (cancelled || !window.turnstile || turnstileId.current) return
      turnstileId.current = window.turnstile.render(el, {
        sitekey: TURNSTILE_KEY,
        theme: 'dark',
        callback: (token: string) => setValues((v) => ({ ...v, turnstile: token })),
      })
    }
    const forget = () => {
      cancelled = true
      turnstileId.current = undefined
    }
    if (window.turnstile) {
      render()
      return forget
    }
    // Load the script once, however many times the form is shown.
    let s = document.querySelector<HTMLScriptElement>('script[data-turnstile]')
    if (!s) {
      s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.dataset.turnstile = ''
      document.head.appendChild(s)
    }
    s.addEventListener('load', render)
    return () => {
      s.removeEventListener('load', render)
      forget()
    }
  }, [formShown])

  const set = <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key as keyof QuoteErrors]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (status.kind === 'sending') return
    const found = validateQuote(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move focus to the first problem so keyboard and screen-reader users land on it.
      const first = Object.keys(found)[0]
      document.getElementById(`${uid}-${first}`)?.focus()
      return
    }
    setStatus({ kind: 'sending' })
    try {
      const res = await submitQuote({ data: values })
      if (res.ok) {
        setStatus({ kind: 'sent' })
        setValues(EMPTY)
        return
      }
      if (res.code === 'invalid') {
        setErrors(res.errors)
        setStatus({ kind: 'idle' })
        return
      }
      const messages = {
        rate: 'Too many requests from this connection. Please wait a few minutes, or call or email us directly.',
        captcha: 'We could not confirm you are human. Please try again.',
        not_configured: 'Sending is not available right now. Please call or email us directly.',
        failed: 'Something went wrong and your request was not sent. Please try again, or call or email us directly.',
      } as const
      setStatus({ kind: 'error', message: messages[res.code] })
      window.turnstile?.reset(turnstileId.current)
    } catch {
      setStatus({ kind: 'error', message: 'We could not reach the server. Please try again, or call or email us directly.' })
    }
  }

  const fieldId = (key: keyof QuoteErrors) => `${uid}-${key}`
  // Attributes for a control. Only real HTML attributes: anything else here would be written onto the <input>.
  const field = (key: keyof QuoteErrors, extra?: { required?: boolean }) => ({
    id: fieldId(key),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `${uid}-${key}-err` : undefined,
    'aria-required': extra?.required || undefined,
  })

  // A plain function, not a component declared inside the render: a new component on every keystroke would remount
  // each message, and a screen reader would announce every error again.
  const err = (k: keyof QuoteErrors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-err`} className="qf-error" role="alert">
        {errors[k]}
      </p>
    ) : null

  if (status.kind === 'sent') {
    return (
      <div className="qf" role="status" aria-live="polite">
        <p className="t-row m-0" style={{ fontSize: 'clamp(28px, 3vw, 44px)' }}>
          Thank you.
        </p>
        <p className="t-body m-0" style={{ color: 'var(--on-black-78)' }}>
          We have received your request and will be in touch.
        </p>
        <button type="button" className="pill pill--outline" onClick={() => setStatus({ kind: 'idle' })}>
          Send another request
        </button>
      </div>
    )
  }

  return (
    <form className="qf" onSubmit={onSubmit} noValidate aria-label={site.cta.quote} id="quote-form">
      <div className="qf-row">
        <div className="qf-field">
          <label htmlFor={fieldId('name')}>Name</label>
          <input
            {...field('name', { required: true })}
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
          />
          {err('name')}
        </div>
        <div className="qf-field">
          <label htmlFor={fieldId('company')}>Company</label>
          <input
            {...field('company', { required: true })}
            type="text"
            autoComplete="organization"
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
          />
          {err('company')}
        </div>
      </div>

      <div className="qf-row">
        <div className="qf-field">
          <label htmlFor={fieldId('email')}>Work email</label>
          <input
            {...field('email', { required: true })}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
          />
          {err('email')}
        </div>
        <div className="qf-field">
          <label htmlFor={fieldId('phone')}>Phone</label>
          <input
            {...field('phone')}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          {err('phone')}
        </div>
      </div>

      <div className="qf-row">
        <div className="qf-field">
          <label htmlFor={fieldId('service')}>Service interest</label>
          <select
            {...field('service', { required: true })}
            value={values.service}
            onChange={(e) => set('service', e.target.value)}
          >
            <option value="">Choose a service</option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {err('service')}
        </div>
        <div className="qf-field">
          <label htmlFor={fieldId('travellers')}>Travellers per month</label>
          <input
            {...field('travellers')}
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            value={values.travellers}
            onChange={(e) => set('travellers', e.target.value)}
          />
          {err('travellers')}
        </div>
      </div>

      <div className="qf-field">
        <label htmlFor={fieldId('message')}>Message</label>
        <textarea
          {...field('message')}
          rows={4}
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
        />
        {err('message')}
      </div>

      {/* Honeypot: hidden from people and from assistive technology. Bots fill it, and are dropped on the server. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Website
          <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set('website', e.target.value)} />
        </label>
      </div>

      <div className="qf-field">
        <label className="qf-check">
          <input
            id={fieldId('consent')}
            type="checkbox"
            checked={values.consent}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
            aria-required
            onChange={(e) => set('consent', e.target.checked)}
          />
          <span>I agree that Flymechanics may contact me about this enquiry.</span>
        </label>
        {err('consent')}
        <p className="m-0" style={{ fontSize: 13, color: 'var(--on-black-78)' }}>
          See the <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>

      {TURNSTILE_KEY && <div ref={turnstileRef} />}

      <div className="qf-actions">
        <button type="submit" className="pill pill--gold" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : `${site.cta.quote} →`}
        </button>
        <p className="m-0" role="status" aria-live="polite" style={{ fontSize: 14, color: status.kind === 'error' ? '#ffb4a8' : 'var(--on-black-78)' }}>
          {status.kind === 'error' ? status.message : ''}
        </p>
      </div>
    </form>
  )
}
