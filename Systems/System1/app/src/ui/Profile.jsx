import { useCallback, useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n.jsx'
import {
  AGE_BANDS,
  REGION_1_PROVINCES,
  REGION_1_MUNICIPALITIES,
  SECTORS,
  normalizeProfile,
  saveProfile,
} from '../lib/profile.js'
import AnimatedSuccessCheck from './AnimatedSuccessCheck.jsx'
import {
  ArrowLeft,
  User,
  Briefcase,
  Calendar,
  Map,
  MapPin,
  Languages,
  Check,
  ChevronDown,
  Loader2,
  X,
} from 'lucide-react'

const TEXT = {
  tl: {
    title: 'Profile',
    subtitle: 'Nasa phone mo lang ito. Hindi ito ipinapadala kahit saan.',
    learnerTitle: 'Profile ng Mag-aaral',
    sectionInfo: 'Impormasyon sa Mag-aaral',
    sectionPref: 'Wika',
    nickname: 'Palayaw',
    nicknameHint: 'Kung ano ang itatawag sa iyo ni Kabsat',
    sector: 'Ikaw ay',
    age: 'Edad',
    province: 'Lalawigan',
    selectProvince: 'Pumili ng lalawigan',
    selectProvinceFirst: 'Pumili muna ng probinsya',
    place: 'Munisipyo o lungsod',
    selectPlace: 'Pumili ng munisipyo o lungsod',
    language: 'Wika ng app',
    save: 'I-save',
    saving: 'I-sinasave…',
    saved: 'Na-save na',
    savedPopup: 'Na-save na ang iyong profile sa teleponong ito.',
    remove: 'Burahin ang data ko',
    skip: 'Bumalik',
    localBadge: 'Nasa phone lang',
    selectSector: 'Pumili ng sektor',
    selectAge: 'Pumili ng edad',
  },
  en: {
    title: 'Profile',
    subtitle: 'This stays on your phone. It is never sent anywhere.',
    learnerTitle: 'Learner Profile',
    sectionInfo: 'Learner Information',
    sectionPref: 'Language',
    nickname: 'Nickname',
    nicknameHint: 'What Kabsat should call you',
    sector: 'You are',
    age: 'Age band',
    province: 'Province',
    selectProvince: 'Select province',
    selectProvinceFirst: 'Select province first',
    place: 'Municipality or city',
    selectPlace: 'Select municipality or city',
    language: 'App language',
    save: 'Save',
    saving: 'Saving…',
    saved: 'Saved',
    savedPopup: 'Your profile has been saved on this device.',
    remove: 'Delete my data',
    skip: 'Back',
    localBadge: 'Local only',
    selectSector: 'Select sector',
    selectAge: 'Select age band',
  },
}

function SectionHeading({ title }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
      {title}
    </h2>
  )
}

function FormLabel({ label, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-[var(--color-ink)]">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-[var(--color-muted)]">{hint}</span>}
    </label>
  )
}

export default function Profile({ profile, onSaved, onClose }) {
  const { lang } = useI18n()
  const t = TEXT[lang] ?? TEXT.tl

  const [draft, setDraft] = useState(() => normalizeProfile(profile))
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [isToastExiting, setIsToastExiting] = useState(false)

  const dismissToast = useCallback(() => {
    setIsToastExiting(true)
    const exitDelay = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 120 : 250
    setTimeout(() => {
      setToast(null)
      setIsToastExiting(false)
    }, exitDelay)
  }, [])

  useEffect(() => {
    if (toast && !isToastExiting) {
      const timer = setTimeout(() => {
        dismissToast()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [toast, isToastExiting, dismissToast])

  // Inherit the current interface language until the learner picks one, so
  // saving a profile never flips the app's language by accident.
  const activeLanguage = draft.language || (lang === 'fil' ? 'tl' : 'en')

  const update = (key, value) => {
    setStatus('')
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleProvinceChange = (newProvince) => {
    setStatus('')
    setDraft((current) => {
      const available = REGION_1_MUNICIPALITIES[newProvince] || []
      const nextMunicipality = available.includes(current.municipality)
        ? current.municipality
        : ''
      return {
        ...current,
        province: newProvince,
        municipality: nextMunicipality,
      }
    })
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setStatus('')
    setIsToastExiting(false)
    setToast(null)
    const minDelay = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 20 : 450
    try {
      const [saved] = await Promise.all([
        saveProfile({ ...draft, language: activeLanguage }),
        new Promise((resolve) => setTimeout(resolve, minDelay)),
      ])
      setStatus(t.saved)
      setIsToastExiting(false)
      setToast(t.savedPopup)
      setDraft((current) => ({ ...current, language: activeLanguage }))
      onSaved?.(saved)
    } finally {
      setSaving(false)
    }
  }

  const initialLetter = draft.nickname?.trim() ? draft.nickname.trim()[0].toUpperCase() : null

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
      {/* Top Safe Sticky Header */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md"
        style={{ paddingTop: 'calc(var(--sat) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={onClose}
          className="btn-press flex h-9 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t.skip}</span>
        </button>
      </header>

      {/* Main Form Body */}
      <main className="flex-1 space-y-6 overflow-y-auto px-4 py-5 page-enter">
        {/* Learner Avatar Hero Card */}
        <section className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-center shadow-sm">
          {/* Subtle atmospheric accent glow */}
          <div
            className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-40 rounded-full bg-[var(--color-accent)]/10 blur-2xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto flex size-20 items-center justify-center rounded-full border-2 border-[var(--color-accent-border)] bg-[var(--color-accent-subtle)] shadow-inner">
            {initialLetter ? (
              <span className="text-2xl font-black text-[var(--color-accent-strong)]">
                {initialLetter}
              </span>
            ) : (
              <User className="size-9 text-[var(--color-accent-strong)] stroke-[2.2]" aria-hidden="true" />
            )}
          </div>

          <h1 className="relative mt-3 text-lg font-black tracking-tight text-[var(--color-ink)]">
            {draft.nickname?.trim() ? draft.nickname.trim() : t.learnerTitle}
          </h1>
          <p className="relative mt-1 text-xs text-[var(--color-muted)] leading-relaxed max-w-[280px] mx-auto">
            {t.subtitle}
          </p>
        </section>

        {/* Section 1: Learner Basic Info Card */}
        <section className="space-y-3">
          <SectionHeading title={t.sectionInfo} />

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm space-y-4">
            {/* Nickname Field */}
            <FormLabel label={t.nickname} hint={t.nicknameHint}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
                  <User className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <input
                  className="min-h-12 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] pl-10 pr-3.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors"
                  value={draft.nickname}
                  onChange={(event) => update('nickname', event.target.value)}
                  placeholder={lang === 'en' ? 'e.g. Ana' : 'hal. Ana'}
                  maxLength={30}
                />
              </div>
            </FormLabel>

            {/* Sector Dropdown */}
            <FormLabel label={t.sector}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
                  <Briefcase className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <select
                  className="min-h-12 w-full appearance-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors"
                  value={draft.sector}
                  onChange={(event) => update('sector', event.target.value)}
                >
                  <option value="">— {t.selectSector} —</option>
                  {SECTORS.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector[lang] ?? sector.en}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-muted)]">
                  <ChevronDown className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
              </div>
            </FormLabel>

            {/* Age Band Dropdown */}
            <FormLabel label={t.age}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
                  <Calendar className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <select
                  className="min-h-12 w-full appearance-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors"
                  value={draft.ageBand}
                  onChange={(event) => update('ageBand', event.target.value)}
                >
                  <option value="">— {t.selectAge} —</option>
                  {AGE_BANDS.map((band) => (
                    <option key={band} value={band}>
                      {band}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-muted)]">
                  <ChevronDown className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
              </div>
            </FormLabel>

            {/* Province Dropdown */}
            <FormLabel label={t.province}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
                  <Map className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <select
                  aria-label={t.province}
                  className="min-h-12 w-full appearance-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors"
                  value={draft.province}
                  onChange={(event) => handleProvinceChange(event.target.value)}
                >
                  <option value="">— {t.selectProvince} —</option>
                  {REGION_1_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-muted)]">
                  <ChevronDown className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
              </div>
            </FormLabel>

            {/* Municipality Dropdown */}
            <FormLabel label={t.place}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted)]">
                  <MapPin className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <select
                  aria-label={t.place}
                  disabled={!draft.province}
                  className={`min-h-12 w-full appearance-none rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] pl-10 pr-10 text-sm text-[var(--color-ink)] focus:border-[var(--color-accent)] focus:outline-hidden transition-colors ${
                    !draft.province
                      ? 'opacity-50 cursor-not-allowed bg-[var(--color-bg)]/60'
                      : ''
                  }`}
                  value={draft.municipality}
                  onChange={(event) => update('municipality', event.target.value)}
                >
                  <option value="">
                    — {!draft.province ? t.selectProvinceFirst : t.selectPlace} —
                  </option>
                  {(REGION_1_MUNICIPALITIES[draft.province] || []).map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--color-muted)]">
                  <ChevronDown className="size-4 stroke-[2.5]" aria-hidden="true" />
                </div>
              </div>
            </FormLabel>
          </div>
        </section>

        {/* Section 2: Preferences & Accessibility */}
        <section className="space-y-3">
          <SectionHeading title={t.sectionPref} />

          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm space-y-4">
            {/* Language Segmented Toggle */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                <Languages className="size-3.5 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                <span>{t.language}</span>
              </span>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {[
                  { id: 'tl', label: 'Filipino', sub: 'Tagalog' },
                  { id: 'en', label: 'English', sub: 'Ingles' },
                ].map((option) => {
                  const active = activeLanguage === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => update('language', option.id)}
                      aria-pressed={active}
                      className={`btn-press flex min-h-12 items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        active
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-accent-strong)] shadow-xs'
                          : 'border-[var(--color-line)] bg-[var(--color-bg)] text-[var(--color-muted)] hover:border-[var(--color-accent-border)]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold leading-tight">{option.label}</p>
                        <p className="text-[10px] text-[var(--color-muted)] leading-tight mt-0.5">{option.sub}</p>
                      </div>
                      {active && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
                          <Check className="size-3 stroke-[3]" aria-hidden="true" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>


        {/* Save Confirmation Banner */}
        {status && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-[var(--color-good)]/30 bg-[var(--color-good-subtle)] p-3 text-xs font-bold text-[var(--color-good)] animate-pop-in"
          >
            <AnimatedSuccessCheck className="size-4" circleColor="var(--color-good)" tickColor="var(--color-good)" />
            <span>{status}</span>
          </div>
        )}
      </main>

      {/* Floating Top Popup Notification with In and Out Animations */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`${
            isToastExiting ? 'animate-toast-down-out' : 'animate-toast-down'
          } fixed left-1/2 z-50 flex w-[90%] max-w-[390px] items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-3.5 shadow-2xl backdrop-blur-md transition-all`}
          style={{ top: 'calc(var(--sat) + 1rem)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-good-subtle)] text-[var(--color-good)]">
              <AnimatedSuccessCheck className="size-4.5" circleColor="var(--color-good)" tickColor="var(--color-good)" />
            </span>
            <p className="truncate text-xs font-bold text-[var(--color-ink)]">{toast}</p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="btn-press flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
            aria-label="Close notification"
          >
            <X className="size-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Sticky Bottom Actions */}
      <footer
        className="sticky bottom-0 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3.5 backdrop-blur-md"
        style={{ paddingBottom: 'calc(var(--sab) + 0.75rem)' }}
      >
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-press flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] text-sm font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)] transition-all disabled:opacity-85 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="size-4.5 animate-spin text-white stroke-[2.5]" aria-hidden="true" />
              <span>{t.saving}</span>
            </>
          ) : (
            <>
              <Check className="size-4 stroke-[3]" aria-hidden="true" />
              <span>{t.save}</span>
            </>
          )}
        </button>
      </footer>
    </div>
  )
}
