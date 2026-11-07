import { useMemo } from 'react'
import {
  ArrowLeft,
  Archive,
  ArchiveRestore,
  ShieldCheck,
  Package,
  Heart,
  Briefcase,
  Check,
} from 'lucide-react'
import { useI18n } from '../lib/i18n.jsx'
import { getCourseProgress } from '../lib/courseProgress.js'

const TONE_STYLES = {
  safety: {
    gradient: 'bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb]',
    Icon: ShieldCheck,
  },
  work: {
    gradient: 'bg-gradient-to-br from-[#9a3412] via-[#c2410c] to-[#ea580c]',
    Icon: Package,
  },
  family: {
    gradient: 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#047857]',
    Icon: Heart,
  },
  business: {
    gradient: 'bg-gradient-to-br from-[#701a75] via-[#86198f] to-[#a21caf]',
    Icon: Briefcase,
  },
}

export default function ArchivePage({
  archivedCourses = [],
  onClose,
  onOpenCourse,
  onUnarchive,
}) {
  const { t, lang } = useI18n()

  const countLabel = useMemo(() => {
    const count = archivedCourses.length
    return count === 1
      ? t('archivedCountSingle', { n: count })
      : t('archivedCountPlural', { n: count })
  }, [archivedCourses.length, t])

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col bg-[var(--color-bg)] text-[var(--color-ink)] overflow-y-auto page-enter"
      style={{
        paddingTop: 'var(--sat)',
        paddingBottom: 'calc(var(--sab) + 1.5rem)',
      }}
    >
      {/* Top Safe Area Shield */}
      <div
        className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-bg)] pointer-events-none"
        style={{ height: 'var(--sat)' }}
        aria-hidden="true"
      />

      {/* Sticky Header with Back Button */}
      <header className="safe-sticky-header z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'fil' ? 'Bumalik' : 'Back'}
            className="btn-press flex size-9 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="size-4.5 stroke-[2.2]" aria-hidden="true" />
          </button>
          <div>
            <h1 className="text-base font-bold leading-tight text-[var(--color-ink)]">
              {t('archiveTitle')}
            </h1>
            <p className="text-[11px] font-medium text-[var(--color-muted)]">
              {countLabel}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[var(--color-surface-sunken)] px-2.5 py-1 text-xs font-bold text-[var(--color-muted)]">
          {archivedCourses.length}
        </span>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[430px] w-full mx-auto px-4 py-5">
        {archivedCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-muted)] shadow-inner">
              <Archive className="size-8 stroke-[1.8]" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[var(--color-ink)]">
              {t('archiveEmptyTitle')}
            </h2>
            <p className="mt-1.5 text-xs text-[var(--color-muted)] max-w-[280px] leading-relaxed">
              {t('archiveEmptyDesc')}
            </p>
          </div>
        ) : (
          <ul className="space-y-3.5">
            {archivedCourses.map((capsule) => {
              const isSafety = capsule.tone
                ? capsule.tone === 'safety'
                : capsule.id === 'capsule-101' || /safety|digital|wallet/i.test(capsule.title)
              const categoryTag = capsule.category ?? (isSafety ? 'Digital Safety' : 'Hanapbuhay')
              const categoryCode = capsule.code ?? (isSafety ? 'KABSAT-101' : 'KABSAT-102')
              const tone = capsule.tone ?? (isSafety ? 'safety' : 'work')
              const { gradient, Icon: CategoryIcon } = TONE_STYLES[tone] ?? TONE_STYLES.work
              const progress = getCourseProgress(capsule.id, capsule.cards?.length || 6)

              return (
                <li
                  key={capsule.id}
                  onClick={() => {
                    if (onOpenCourse) onOpenCourse(capsule)
                  }}
                  className={`card-tactile group relative overflow-hidden rounded-2xl cursor-pointer p-4 sm:p-5 text-white shadow-md transition-all hover:shadow-xl hover:scale-[1.01] ${gradient}`}
                >
                  <div className="relative z-10 flex flex-col justify-between min-h-[96px]">
                    {/* Top Row: Category Tag + Progress Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-xs border border-white/20">
                        <CategoryIcon className="size-3 stroke-[2.5]" aria-hidden="true" />
                        <span>{categoryTag}</span>
                        <span className="opacity-60">·</span>
                        <span className="opacity-90">{categoryCode}</span>
                      </span>

                      {progress.completed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-black/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 backdrop-blur-xs">
                          <Check className="size-3 stroke-[3]" aria-hidden="true" />
                          <span>100%</span>
                        </span>
                      ) : progress.percent > 0 ? (
                        <span className="rounded-full border border-white/25 bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-md tabular-nums">
                          {progress.percent}%
                        </span>
                      ) : null}
                    </div>

                    {/* Title Row + Unarchive Button */}
                    <div className="mt-2.5 flex items-start justify-between gap-3">
                      <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight text-white drop-shadow-xs line-clamp-2">
                        {capsule.title}
                      </h2>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onUnarchive) onUnarchive(capsule.id)
                        }}
                        aria-label={`${t('unarchiveAction')} ${capsule.title}`}
                        className="btn-press shrink-0 flex items-center gap-1.5 rounded-xl border border-white/30 bg-black/30 hover:bg-black/50 px-3 py-1.5 text-xs font-bold text-white shadow-xs backdrop-blur-md transition-colors"
                      >
                        <ArchiveRestore className="size-3.5 stroke-[2.2]" aria-hidden="true" />
                        <span>{t('unarchiveAction')}</span>
                      </button>
                    </div>

                    {/* Subtitle */}
                    <p className="mt-1 text-xs font-medium text-white/90 line-clamp-1">
                      {capsule.subtitle}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </div>
  )
}
