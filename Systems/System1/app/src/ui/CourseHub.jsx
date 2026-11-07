import { useState } from 'react'
import { useI18n } from '../lib/i18n.jsx'
import {
  ShieldCheck,
  Briefcase,
  BookOpen,
  HelpCircle,
  Zap,
  Play,
  Download,
  Share2,
  UploadCloud,
  MapPin,
  Loader2,
  X,
  ChevronRight,
} from 'lucide-react'

function CapsuleCard({ capsule, onOpen, onDownload, onShare, downloading }) {
  const { t } = useI18n()
  const installed = Boolean(capsule.installed)

  return (
    <li className="card-tactile group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4.5 shadow-sm transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md">
      {/* Decorative top accent bar for installed courses */}
      {installed && (
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-strong)]"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              {capsule.id === 'capsule-101' ? (
                <ShieldCheck className="size-4 stroke-[2.2]" aria-hidden="true" />
              ) : (
                <Briefcase className="size-4 stroke-[2.2]" aria-hidden="true" />
              )}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              {capsule.id === 'capsule-101' ? 'Digital Safety' : 'Hanapbuhay'}
            </span>
          </div>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-[var(--color-ink)]">
            {capsule.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
            {capsule.subtitle}
          </p>
        </div>

        {!installed && (
          <span className="shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-muted)]">
            {capsule.kb} KB
          </span>
        )}
      </div>

      {/* Meta counters */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-line)]/60 text-xs text-[var(--color-muted)]">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-sunken)] px-2.5 py-1 font-medium text-[var(--color-ink)]">
          <BookOpen className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
          {t('cardsMeta', { n: capsule.cards })}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-sunken)] px-2.5 py-1 font-medium text-[var(--color-ink)]">
          <HelpCircle className="size-3.5 text-[var(--color-terracotta)] stroke-[2]" aria-hidden="true" />
          {t('questionsMeta', { n: capsule.questions })}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
          <Zap className="size-3 text-[var(--color-warn)] fill-[var(--color-warn)]" aria-hidden="true" />
          {t('offlineMeta')}
        </span>
      </div>

      {/* Simulated download progress bar with animation */}
      {downloading && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-accent)]">
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin stroke-[2.5]" aria-hidden="true" />
              {t('downloadingMsg')}
            </span>
            <span className="animate-pulse">{t('downloading')}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-terracotta)] transition-all duration-300" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2.5">
        {installed ? (
          <button
            type="button"
            onClick={() => onOpen(capsule.id)}
            className="btn-press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-sm hover:bg-[var(--color-accent-strong)]"
          >
            <Play className="size-4 fill-current stroke-none" aria-hidden="true" />
            {t('openCourse')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDownload(capsule.id)}
            disabled={downloading}
            className="btn-press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-accent)] bg-transparent px-4 text-sm font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
          >
            <Download className="size-4 stroke-[2.5]" aria-hidden="true" />
            {downloading ? t('downloading') : t('downloadCourse', { kb: capsule.kb })}
          </button>
        )}
        <button
          type="button"
          onClick={() => onShare(capsule)}
          disabled={!installed}
          title={t('passTooltip')}
          aria-label={t('passAria', { title: capsule.title })}
          className="btn-press flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-xs font-semibold text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] disabled:opacity-40"
        >
          <Share2 className="size-4 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
          {t('passCourse')}
        </button>
      </div>
    </li>
  )
}

export default function CourseHub({
  capsules,
  onOpen,
  onDownload,
  onShare,
  onImport,
  downloadingId,
}) {
  const { t } = useI18n()
  const [shareTarget, setShareTarget] = useState(null)

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
          <p className="mt-1 text-xs leading-relaxed text-blue-100">
            {t('greetingSubtitle')}
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
        <img
          src="/logo.svg"
          alt=""
          aria-hidden="true"
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
              downloading={downloadingId === capsule.id}
            />
          ))}
        </ul>
      </section>

      {/* Available for Download Section */}
      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <div className="flex items-center justify-between pb-2">
            <h2
              id="available-heading"
              className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
            >
              {t('availableHeading')}
            </h2>
            <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]">
              {t('availableCountTag', { n: available.length })}
            </span>
          </div>
          <ul className="mt-2 space-y-3">
            {available.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onOpen={onOpen}
                onDownload={onDownload}
                onShare={setShareTarget}
                downloading={downloadingId === capsule.id}
              />
            ))}
          </ul>
        </section>
      )}

      {/* Share Options Modal - Centered Dialog */}
      {shareTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity"
          onClick={() => setShareTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <div
            className="relative w-full max-w-[390px] rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-2xl transition-all animate-pop-in"
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
        </div>
      )}
    </div>
  )
}
