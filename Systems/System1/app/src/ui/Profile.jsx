import { useState } from 'react'
import { useI18n } from '../lib/i18n.jsx'
import { AGE_BANDS, MUNICIPALITIES, SECTORS, clearProfile, saveProfile } from '../lib/profile.js'

const TEXT = {
  tl: {
    title: 'Profile',
    subtitle: 'Nasa phone mo lang ito. Hindi ito ipinapadala kahit saan.',
    nickname: 'Palayaw',
    nicknameHint: 'Kung ano ang itatawag sa iyo ni Kabsat',
    sector: 'Ikaw ay',
    age: 'Edad',
    place: 'Munispyo o lungsod',
    language: 'Wika ng app',
    access: 'Accessibility',
    voice: 'Basahin nang malakas',
    largeText: 'Malaking teksto',
    contrast: 'Mataas na kontrast',
    save: 'I-save',
    saved: 'Na-save na',
    remove: 'Burahin ang data ko',
    privacy:
      'Ang profile na ito ay naka-save lamang sa phone mo. Walang pangalan, numero, o address na hinihingi. Hindi ito kasama sa telemetry na ipinapadala sa City Hall.',
    skip: 'Bumalik',
  },
  en: {
    title: 'Profile',
    subtitle: 'This stays on your phone. It is never sent anywhere.',
    nickname: 'Nickname',
    nicknameHint: 'What Kabsat should call you',
    sector: 'You are',
    age: 'Age band',
    place: 'Municipality or city',
    language: 'App language',
    access: 'Accessibility',
    voice: 'Read aloud',
    largeText: 'Large text',
    contrast: 'High contrast',
    save: 'Save',
    saved: 'Saved',
    remove: 'Delete my data',
    privacy:
      'This profile is stored only on your phone. No name, number, or address is requested. It is never included in the telemetry sent to the City Hall dashboard.',
    skip: 'Back',
  },
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
        {label}
      </span>
      {hint && <span className="mt-0.5 block text-[11px] text-[var(--color-muted)]">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export default function Profile({ profile, onSaved, onClose }) {
  const { lang } = useI18n()
  const t = TEXT[lang] ?? TEXT.tl

  const [draft, setDraft] = useState({ ...profile })
  const [status, setStatus] = useState('')
  // Inherit the current interface language until the learner picks one, so
  // saving a profile never flips the app's language by accident.
  const activeLanguage = draft.language || (lang === 'fil' ? 'tl' : 'en')

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const updateAccess = (key, value) =>
    setDraft((current) => ({
      ...current,
      accessibility: { ...current.accessibility, [key]: value },
    }))

  const handleSave = async () => {
    const saved = await saveProfile({ ...draft, language: activeLanguage })
    setStatus(t.saved)
    setDraft((current) => ({ ...current, language: activeLanguage }))
    onSaved?.(saved)
  }

  const handleClear = async () => {
    const empty = await clearProfile()
    setDraft(empty)
    setStatus('')
    onSaved?.(empty)
  }

  const inputClass =
    'min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-ink)]'

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="min-h-10 rounded-xl border border-[var(--color-line)] px-3 text-xs font-bold text-[var(--color-accent)]"
        >
          {t.skip}
        </button>
        <div className="text-right">
          <p className="text-sm font-black">{t.title}</p>
          <p className="text-[11px] text-[var(--color-muted)]">{t.subtitle}</p>
        </div>
      </header>

      <main className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <Field label={t.nickname} hint={t.nicknameHint}>
          <input
            className={inputClass}
            value={draft.nickname}
            onChange={(event) => update('nickname', event.target.value)}
            placeholder={lang === 'en' ? 'e.g. Ana' : 'hal. Ana'}
            maxLength={30}
          />
        </Field>

        <Field label={t.sector}>
          <select className={inputClass} value={draft.sector} onChange={(event) => update('sector', event.target.value)}>
            <option value="">—</option>
            {SECTORS.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector[lang] ?? sector.en}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.age}>
          <select className={inputClass} value={draft.ageBand} onChange={(event) => update('ageBand', event.target.value)}>
            <option value="">—</option>
            {AGE_BANDS.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.place}>
          <select
            className={inputClass}
            value={draft.municipality}
            onChange={(event) => update('municipality', event.target.value)}
          >
            <option value="">—</option>
            {MUNICIPALITIES.map((place) => (
              <option key={place} value={place}>
                {place}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t.language}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'tl', label: 'Filipino' },
              { id: 'en', label: 'English' },
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => update('language', option.id)}
                aria-pressed={activeLanguage === option.id}
                className={`min-h-11 rounded-xl border text-sm font-semibold ${
                  activeLanguage === option.id
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    : 'border-[var(--color-line)] text-[var(--color-muted)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t.access}>
          <div className="space-y-2">
            {[
              ['voice', t.voice],
              ['largeText', t.largeText],
              ['highContrast', t.contrast],
            ].map(([key, label]) => (
              <label key={key} className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--color-line)] px-3 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(draft.accessibility?.[key])}
                  onChange={(event) => updateAccess(key, event.target.checked)}
                  className="size-4"
                />
                {label}
              </label>
            ))}
          </div>
        </Field>

        <p className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
          {t.privacy}
        </p>

        {status && (
          <p role="status" className="text-sm font-semibold text-[var(--color-good)]">
            {status}
          </p>
        )}
      </main>

      <footer className="sticky bottom-0 space-y-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] p-3">
        <button
          type="button"
          onClick={handleSave}
          className="min-h-12 w-full rounded-xl bg-[var(--color-accent)] text-sm font-bold text-[var(--color-on-accent)]"
        >
          {t.save}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="min-h-12 w-full rounded-xl border border-[var(--color-line)] text-sm font-semibold text-[var(--color-warn)]"
        >
          {t.remove}
        </button>
      </footer>
    </div>
  )
}
