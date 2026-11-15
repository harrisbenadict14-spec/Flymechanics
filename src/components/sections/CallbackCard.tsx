import { useId, useState, type FormEvent } from 'react'
import { site } from '~/content/site.content'
import { SERVICE_OPTIONS } from '~/lib/quote-validation'
import { chapterStart, jumpTo } from '~/lib/scroll'

/**
 * Slide 2's call-back card. It collects the three fastest details and hands them to the full quote form in the
 * contact chapter (which validates and sends), so there is only one enquiry pipeline to keep working.
 */
export function CallbackCard() {
  const uid = useId()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const t = site.consult

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('fm:prefill', { detail: { name, phone, service } }))
    const y = chapterStart('contact')
    if (y !== null) {
      history.replaceState(null, '', '#contact')
      jumpTo(y)
    }
  }

  return (
    <form data-st-rise className="cb-card" onSubmit={onSubmit} aria-label={t.cardTitle}>
      <p className="cb-title m-0">{t.cardTitle}</p>
      <div className="cb-fields">
        <label>
          <span>{t.fields.name}</span>
          <input id={`${uid}-n`} type="text" autoComplete="name" placeholder={t.fields.name} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          <span>{t.fields.phone}</span>
          <input id={`${uid}-p`} type="tel" inputMode="tel" autoComplete="tel" placeholder={t.fields.phone} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          <span>{t.fields.service}</span>
          <select id={`${uid}-s`} value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">{t.fields.servicePlaceholder}</option>
            {SERVICE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="pill pill--gold">
          {t.submit}
        </button>
      </div>
      <p className="cb-note m-0">
        {t.note} <a href="/privacy">Privacy policy</a>
      </p>
    </form>
  )
}
