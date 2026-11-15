import { createServerFn } from '@tanstack/react-start'
import { getRequestIP } from '@tanstack/react-start/server'
import { validateQuote, type QuoteErrors, type QuoteInput } from '~/lib/quote-validation'

export type QuoteResult =
  | { ok: true }
  | { ok: false; code: 'invalid'; errors: QuoteErrors }
  | { ok: false; code: 'rate' | 'not_configured' | 'failed' | 'captcha' }

// Simple in-memory limit: 5 enquiries per IP per 10 minutes. This protects one server instance; several instances
// need a shared store (for example Redis).
const hits = new Map<string, number[]>()
const WINDOW_MS = 10 * 60 * 1000
const MAX_HITS = 5

const MAX_TRACKED = 5000

function limited(ip: string): boolean {
  const now = Date.now()
  // Forget addresses whose window has passed, so the map cannot grow for as long as the server runs.
  if (hits.size > MAX_TRACKED) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key)
    }
    // Still full (a flood from many addresses): drop the oldest entries rather than grow without limit.
    for (const key of hits.keys()) {
      if (hits.size <= MAX_TRACKED) break
      hits.delete(key)
    }
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  // Count only up to one past the limit: a blocked address that keeps trying does not push its own block forward
  // for ever, and its list stays short.
  if (recent.length <= MAX_HITS) recent.push(now)
  hits.set(ip, recent)
  return recent.length > MAX_HITS
}

// The browser sends JSON, and anyone can post anything to this endpoint. Every field is forced to the type the rest
// of the handler expects, so a missing or wrongly typed field becomes a validation message, not a server error.
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
function clean(d: unknown): QuoteInput {
  const o = (typeof d === 'object' && d !== null ? d : {}) as Record<string, unknown>
  return {
    name: text(o.name, 500),
    company: text(o.company, 500),
    email: text(o.email, 500),
    phone: text(o.phone, 100),
    service: text(o.service, 200),
    travellers: text(o.travellers, 20),
    message: text(o.message, 5000),
    consent: o.consent === true,
    website: text(o.website, 200),
    turnstile: typeof o.turnstile === 'string' ? o.turnstile.slice(0, 4096) : undefined,
  }
}

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ENTITIES[c])

async function verifyTurnstile(token: string | undefined, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // not configured: spam control then relies on the honeypot and the rate limit
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    })
    const json = (await res.json()) as { success?: boolean }
    return json.success === true
  } catch (err) {
    // The check service is unreachable or slow: treat it as "not confirmed" so the visitor gets a clear message
    // and can try again, instead of the request failing with a server error.
    console.error('[quote] spam check failed', err)
    return false
  }
}

async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.EMAIL_PROVIDER_API_KEY
  const from = process.env.QUOTE_FROM_EMAIL
  if (!key || !from) throw new Error('email_not_configured')
  // Resend's REST API. The sending domain needs SPF and DKIM before real delivery can be trusted.
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`email_failed_${res.status}`)
}

async function storeEnquiry(record: Record<string, unknown>) {
  const url = process.env.ENQUIRY_STORE_URL
  if (!url) throw new Error('store_not_configured')
  const token = process.env.ENQUIRY_STORE_TOKEN
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(record),
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`store_failed_${res.status}`)
}

/**
 * Quote form handler. It validates again on the server, drops bots (honeypot), rate-limits, then stores the
 * enquiry so none is lost, emails the team, and sends the sender an acknowledgement.
 * It never reports success unless delivery to the team or to storage really happened.
 */
export const submitQuote = createServerFn({ method: 'POST' })
  .validator((d: unknown) => clean(d))
  .handler(async ({ data }): Promise<QuoteResult> => {
    // Honeypot: bots fill the hidden field. Pretend it worked and do nothing.
    if (data.website && data.website.trim() !== '') return { ok: true }

    const errors = validateQuote(data)
    if (Object.keys(errors).length > 0) return { ok: false, code: 'invalid', errors }

    const ip = getRequestIP({ xForwardedFor: true }) ?? 'unknown'
    if (limited(ip)) return { ok: false, code: 'rate' }
    if (!(await verifyTurnstile(data.turnstile, ip))) return { ok: false, code: 'captcha' }

    const emailReady = Boolean(process.env.EMAIL_PROVIDER_API_KEY && process.env.QUOTE_FROM_EMAIL)
    const storeReady = Boolean(process.env.ENQUIRY_STORE_URL)
    if (!emailReady && !storeReady) return { ok: false, code: 'not_configured' }

    const record = {
      receivedAt: new Date().toISOString(),
      name: data.name.trim(),
      company: data.company.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      service: data.service,
      travellers: data.travellers.trim(),
      message: data.message.trim(),
      consent: data.consent,
    }

    let delivered = false
    if (storeReady) {
      try {
        await storeEnquiry(record)
        delivered = true
      } catch (err) {
        console.error('[quote] storage failed', err)
      }
    }
    if (emailReady) {
      try {
        const to = process.env.QUOTE_TO_EMAIL || 'info@flymechanics.com'
        const rows = Object.entries(record)
          .map(([k, v]) => `<tr><td><b>${esc(k)}</b></td><td>${esc(String(v))}</td></tr>`)
          .join('')
        // One line only in the subject, whatever was typed into the company field.
        const company = record.company.replace(/[\r\n\t]+/g, ' ').slice(0, 120)
        await sendEmail(to, `New quote request from ${company}`, `<table>${rows}</table>`, record.email)
        delivered = true
        // Acknowledgement to the sender. It promises no response time (none is confirmed).
        await sendEmail(
          record.email,
          'We have received your enquiry',
          `<p>Hello ${esc(record.name)},</p><p>Thank you for contacting Flymechanics. We have received your enquiry and will be in touch.</p><p>Flymechanics</p>`,
        ).catch((err) => console.error('[quote] acknowledgement failed', err))
      } catch (err) {
        console.error('[quote] email failed', err)
      }
    }
    return delivered ? { ok: true } : { ok: false, code: 'failed' }
  })
