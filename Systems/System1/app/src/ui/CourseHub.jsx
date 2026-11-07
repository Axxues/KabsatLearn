import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../lib/i18n.jsx'
import {
  ShieldCheck,
  Briefcase,
  Heart,
  Package,
  Download,
  Share2,
  UploadCloud,
  MapPin,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Archive,
} from 'lucide-react'

function DigitalSafetyArt() {
  return (
    <svg
      viewBox="0 0 160 110"
      className="absolute -right-2 -bottom-2 h-[115%] w-auto max-w-[170px] pointer-events-none select-none opacity-85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="55" r="45" fill="white" fillOpacity="0.08" />
      <circle cx="50" cy="30" r="25" fill="#60a5fa" fillOpacity="0.12" />
      <path
        d="M20,75 L45,75 L60,50 L95,50"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.25"
        strokeDasharray="2 3"
      />
      <circle cx="20" cy="75" r="2.5" fill="#93c5fd" fillOpacity="0.6" />
      <circle cx="95" cy="50" r="2.5" fill="#60a5fa" fillOpacity="0.6" />

      {/* Smartphone silhouette */}
      <rect
        x="72"
        y="14"
        width="54"
        height="88"
        rx="10"
        fill="#1e3a8a"
        fillOpacity="0.4"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />
      <rect x="77" y="24" width="44" height="66" rx="5" fill="white" fillOpacity="0.07" />
      <line x1="91" y1="19" x2="107" y2="19" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />

      {/* Security Shield */}
      <path
        d="M99,35 C111,35 115,39 115,48 C115,62 99,71 99,71 C99,71 83,62 83,48 C83,39 87,35 99,35 Z"
        fill="#3b82f6"
        fillOpacity="0.4"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <path
        d="M93,49 L97,53 L105,44"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Padlock */}
      <rect
        x="30"
        y="42"
        width="32"
        height="26"
        rx="5"
        fill="#1d4ed8"
        fillOpacity="0.5"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.5"
      />
      <path
        d="M37,42 L37,32 C37,25 55,25 55,32 L55,42"
        stroke="white"
        strokeWidth="2"
        strokeOpacity="0.6"
      />
      <circle cx="46" cy="52" r="2.5" fill="white" fillOpacity="0.8" />
      <line x1="46" y1="54" x2="46" y2="60" stroke="white" strokeWidth="1.5" strokeOpacity="0.8" />
    </svg>
  )
}

function OnlineWorkArt() {
  return (
    <svg
      viewBox="0 0 160 110"
      className="absolute -right-2 -bottom-2 h-[115%] w-auto max-w-[170px] pointer-events-none select-none opacity-85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="110" cy="50" r="45" fill="white" fillOpacity="0.08" />
      <circle cx="45" cy="35" r="25" fill="#fde047" fillOpacity="0.1" />

      {/* Desktop Monitor */}
      <rect
        x="80"
        y="12"
        width="66"
        height="44"
        rx="4"
        fill="#7c2d12"
        fillOpacity="0.35"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.35"
      />
      <line x1="92" y1="24" x2="134" y2="24" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
      <line x1="92" y1="31" x2="124" y2="31" stroke="white" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round" />
      <path d="M107,56 L119,56 M113,56 L113,66 M101,66 L125,66" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />

      {/* Laptop */}
      <rect
        x="42"
        y="34"
        width="56"
        height="35"
        rx="3"
        fill="#ea580c"
        fillOpacity="0.35"
        stroke="white"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <path d="M54,47 L48,51 L54,55 M64,47 L70,51 L64,55" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="57" y1="56" x2="61" y2="46" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
      <polygon
        points="34,69 106,69 110,74 30,74"
        fill="white"
        fillOpacity="0.25"
        stroke="white"
        strokeWidth="1.2"
        strokeOpacity="0.5"
      />

      {/* Coffee Takeout Cup */}
      <path d="M18,36 L30,36 L28,58 L20,58 Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.2" strokeOpacity="0.45" />
      <rect x="16" y="33" width="16" height="4" rx="1.5" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
      <line x1="21" y1="45" x2="27" y2="45" stroke="#fde047" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />

      {/* Stack of books/documents */}
      <path d="M12,65 C22,63 32,63 42,65 L42,71 C32,69 22,69 12,71 Z" fill="#c2410c" fillOpacity="0.4" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
      <path d="M12,72 C22,70 32,70 42,72 L42,77 C32,75 22,75 12,77 Z" fill="#9a3412" fillOpacity="0.4" stroke="white" strokeWidth="1.2" strokeOpacity="0.4" />
    </svg>
  )
}

const TONE_STYLES = {
  safety: {
    gradient: 'bg-gradient-to-br from-[#0c2a5e] via-[#1d4ed8] to-[#0284c7]',
    Icon: ShieldCheck,
    Art: DigitalSafetyArt,
  },
  work: {
    gradient: 'bg-gradient-to-br from-[#7c2d12] via-[#c2410c] to-[#ea580c]',
    Icon: Briefcase,
    Art: OnlineWorkArt,
  },
  family: {
    gradient: 'bg-gradient-to-br from-[#134e4a] via-[#115e59] to-[#0f766e]',
    Icon: Heart,
    Art: OnlineWorkArt,
  },
  business: {
    gradient: 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]',
    Icon: Package,
    Art: OnlineWorkArt,
  },
}

function CapsuleCard({
  capsule,
  onOpen,
  onDownload,
  onShare,
  onArchive,
  downloading,
  menuOpen,
  onToggleMenu,
}) {
  const { t } = useI18n()
  const installed = Boolean(capsule.installed)

  const isSafety = capsule.tone
    ? capsule.tone === 'safety'
    : capsule.id === 'capsule-101' || /safety|digital|wallet/i.test(capsule.title)
  const categoryTag = capsule.category ?? (isSafety ? 'Digital Safety' : 'Hanapbuhay')
  const categoryCode = capsule.code ?? (isSafety ? 'KABSAT-101' : 'KABSAT-102')
  const tone = capsule.tone ?? (isSafety ? 'safety' : 'work')
  const { gradient, Icon: CategoryIcon, Art } = TONE_STYLES[tone] ?? TONE_STYLES.work

  return (
    <li
      onClick={() => {
        if (menuOpen) {
          onToggleMenu(null)
          return
        }
        if (installed) {
          onOpen(capsule.id)
        } else {
          onDownload(capsule)
        }
      }}
      className={`card-tactile group relative rounded-2xl cursor-pointer p-4 sm:p-5 text-white shadow-md transition-all hover:shadow-xl hover:scale-[1.01] ${menuOpen ? 'z-30' : ''} ${gradient}`}
    >
      {/* Thematic Vector Illustration */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        aria-hidden="true"
      >
        <Art />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-[96px]">
        {/* Top Line: Category / Code Tag + Available KB Badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xs border border-white/20">
            <CategoryIcon className="size-3 stroke-[2.5]" aria-hidden="true" />
            <span>{categoryTag}</span>
            <span className="opacity-60">·</span>
            <span className="opacity-90">{categoryCode}</span>
          </span>

          {!installed && (
            <span className="rounded-full border border-white/25 bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md tabular-nums">
              {capsule.kb} KB
            </span>
          )}
        </div>

        {/* Title Row: Title on the left, 3-dots menu or download button on the right */}
        <div className="mt-2.5 flex items-start justify-between gap-3">
          <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight text-white drop-shadow-xs line-clamp-2">
            {capsule.title}
          </h2>

          {installed ? (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleMenu(menuOpen ? null : capsule.id)
                }}
                aria-label={`Options for ${capsule.title}`}
                className="btn-press flex size-8 items-center justify-center rounded-xl border border-white/30 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors"
              >
                <MoreVertical className="size-4 stroke-[2.2]" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-10 z-30 min-w-[140px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-xl animate-pop-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMenu(null)
                      onShare(capsule)
                    }}
                    className="btn-press flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <Share2 className="size-3.5 stroke-[2.2]" aria-hidden="true" />
                    <span>{t('passCourse')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMenu(null)
                      if (onArchive) onArchive(capsule)
                    }}
                    className="btn-press flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <Archive className="size-3.5 stroke-[2.2]" aria-hidden="true" />
                    <span>{t('archiveAction')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDownload(capsule)
              }}
              disabled={downloading}
              className="btn-press shrink-0 flex items-center gap-1.5 rounded-xl border border-white/30 bg-white text-slate-900 hover:bg-white/90 px-3 py-1.5 text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>{downloading ? t('downloading') : t('downloadCourse', { kb: capsule.kb })}</span>
            </button>
          )}
        </div>

        {/* Bottom Line: Subtitle */}
        <p className="mt-1 text-xs font-medium text-white line-clamp-1">
          {capsule.subtitle}
        </p>

        {/* Simulated download progress bar with animation if downloading */}
        {downloading && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-white">
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin stroke-[2.5]" aria-hidden="true" />
                {t('downloadingMsg')}
              </span>
              <span className="animate-pulse">{t('downloading')}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-white transition-all duration-300" />
            </div>
          </div>
        )}
      </div>
    </li>
  )
}

export default function CourseHub({
  capsules,
  onOpen,
  onDownload,
  onShare,
  onArchive,
  onImport,
  downloadingId,
}) {
  const { t } = useI18n()
  const [shareTarget, setShareTarget] = useState(null)
  const [confirmDownloadTarget, setConfirmDownloadTarget] = useState(null)
  const [availableOpen, setAvailableOpen] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    if (!activeMenuId) return
    const handleClickOutside = () => setActiveMenuId(null)
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveMenuId(null)
    }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeMenuId])

  if (capsules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="size-10 animate-spin text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-[var(--color-muted)]">{t('loadingCourses')}</p>
      </div>
    )
  }

  const installed = capsules.filter((c) => c.installed)
  const available = capsules.filter((c) => !c.installed)

  return (
    <div className="space-y-6">
      {/* Community Learner Greeting Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-strong)] p-4.5 text-[var(--color-on-accent)] shadow-md">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xs">
            <MapPin className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>{t('locationTag')}</span>
          </div>
          <h2 className="mt-2 text-lg font-extrabold leading-tight tracking-tight">
            {t('greetingTitle')}
          </h2>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
          width="96"
          height="96"
          style={{ width: '6rem', height: '6rem' }}
          className="pointer-events-none absolute -bottom-2 -right-2 size-24 opacity-25 filter brightness-200"
        />
      </section>

      {/* Interactive Import Card */}
      <label className="card-tactile group flex min-h-16 cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]/50">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] group-hover:scale-105 transition-transform duration-150">
          <UploadCloud className="size-5 stroke-[2]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[var(--color-ink)]">
            {t('importTitle')}
          </p>
          <p className="text-[11px] text-[var(--color-muted)]">
            {t('importSubtitle')}
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-[10px] font-bold text-[var(--color-accent)]">
          {t('importButton')}
        </span>
        <input
          type="file"
          accept=".kabsat,application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImport(file)
            event.target.value = ''
          }}
        />
      </label>

      {/* Installed Capsules Section */}
      <section aria-labelledby="installed-heading">
        <div className="flex items-center justify-between pb-2">
          <h2
            id="installed-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            {t('onThisPhone')}
          </h2>
          <span className="rounded-full bg-[var(--color-good-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-good)]">
            {installed.length === 1
              ? t('courseCountSingle', { n: installed.length })
              : t('courseCountPlural', { n: installed.length })}
          </span>
        </div>
        <ul className="mt-2 space-y-3">
          {installed.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              onOpen={onOpen}
              onDownload={onDownload}
              onShare={setShareTarget}
              onArchive={onArchive}
              downloading={downloadingId === capsule.id}
              menuOpen={activeMenuId === capsule.id}
              onToggleMenu={setActiveMenuId}
            />
          ))}
        </ul>
      </section>

      {/* Available for Download Section */}
      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <h2
            id="available-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            <button
              type="button"
              aria-expanded={availableOpen}
              aria-controls="available-course-list"
              onClick={() => setAvailableOpen((open) => !open)}
              className="btn-press flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-1 text-left hover:text-[var(--color-ink)]"
            >
              <span>{t('availableHeading')}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-[var(--color-muted)]">
                  {t('availableCountTag', { n: available.length })}
                </span>
                <ChevronDown
                  className={`size-4 stroke-[2.5] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    availableOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>
          </h2>
          <div className={`accordion-grid ${availableOpen ? 'is-expanded' : ''}`}>
            <div className="accordion-inner">
              <ul id="available-course-list" hidden={!availableOpen} className="mt-2 space-y-3 p-1">
                {available.map((capsule) => (
                  <CapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    onOpen={onOpen}
                    onDownload={setConfirmDownloadTarget}
                    onShare={setShareTarget}
                    downloading={downloadingId === capsule.id}
                  />
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Share Options Modal - Centered Dialog via Portal */}
      {shareTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={() => setShareTarget(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <div
              className="relative m-auto w-full max-w-[360px] rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-2xl transition-all animate-pop-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                    <Share2 className="size-5 stroke-[2.2]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 id="share-modal-title" className="text-base font-bold text-[var(--color-ink)]">
                      {t('shareModalTitle')}
                    </h3>
                    <p className="truncate text-xs font-medium text-[var(--color-muted)]">
                      {shareTarget.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShareTarget(null)}
                  className="btn-press flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                  aria-label={t('shareModalClose')}
                >
                  <X className="size-4 stroke-[2.5]" aria-hidden="true" />
                </button>
              </div>

              {/* Options List */}
              <div className="py-4 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                  {t('shareModalSubtitle')}
                </p>

                {/* Option: Download .kabsat file */}
                <button
                  type="button"
                  onClick={() => {
                    const target = shareTarget
                    setShareTarget(null)
                    onShare(target.id, 'download')
                  }}
                  className="btn-press card-tactile flex w-full items-center justify-between gap-3.5 rounded-2xl border-2 border-[var(--color-accent)]/20 bg-[var(--color-surface-hover)] p-4 text-left transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-xs">
                      <Download className="size-5 stroke-[2.5]" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--color-ink)]">
                          {t('shareOptionDownloadTitle')}
                        </p>
                        <span className="rounded-full bg-[var(--color-accent-subtle)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--color-accent)]">
                          .kabsat
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                        {t('shareOptionDownloadSub')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                </button>
              </div>

              {/* Modal Cancel Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShareTarget(null)}
                  className="btn-press flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                >
                  {t('shareModalCancel')}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Download Confirmation Modal - Centered Dialog via Portal */}
      {confirmDownloadTarget &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={() => setConfirmDownloadTarget(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-download-modal-title"
          >
            <div
              className="relative m-auto w-full max-w-[360px] rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-2xl transition-all animate-pop-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                    <Download className="size-5 stroke-[2.2]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 id="confirm-download-modal-title" className="text-base font-bold text-[var(--color-ink)]">
                      {t('confirmDownloadTitle')}
                    </h3>
                    <p className="truncate text-xs font-medium text-[var(--color-muted)]">
                      {confirmDownloadTarget.title} · {confirmDownloadTarget.kb} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDownloadTarget(null)}
                  className="btn-press flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                  aria-label={t('shareModalClose')}
                >
                  <X className="size-4 stroke-[2.5]" aria-hidden="true" />
                </button>
              </div>

              {/* Explanation Prompt */}
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">
                {t('confirmDownloadPrompt')}
              </p>

              {/* Action Buttons: Cancel and Download Now */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDownloadTarget(null)}
                  className="btn-press flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2.5 text-xs font-bold text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                >
                  {t('confirmDownloadCancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const targetId = confirmDownloadTarget.id
                    setConfirmDownloadTarget(null)
                    onDownload(targetId)
                  }}
                  className="btn-press flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] py-2.5 text-xs font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
                >
                  <Download className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                  <span>{t('confirmDownloadAction')}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}
