import { useMemo, useState, useEffect, useCallback } from 'react'
import { speak, stopSpeaking } from '../lib/tts.js'
import { useI18n } from '../lib/i18n.jsx'
import { getCoursePage, getCourseProgress, markCourseCompleted, saveCoursePage } from '../lib/courseProgress.js'
import { queueEvent } from '../lib/telemetry.js'
import AnimatedSuccessCheck from './AnimatedSuccessCheck.jsx'
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  ShieldAlert,
  Lightbulb,
  Lock,
  X,
} from 'lucide-react'

function Drill({ drill, onComplete }) {
  const { t } = useI18n()
  const [selected, setSelected] = useState([])
  const flags = useMemo(
    () => drill.segments.map((segment, index) => (segment.flag ? index : -1)).filter((i) => i >= 0),
    [drill],
  )
  const foundAll = flags.every((index) => selected.includes(index))

  const toggle = (index) => {
    if (!drill.segments[index].flag) return
    setSelected((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    )
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border-2 border-[var(--color-line)] bg-[var(--color-surface)] shadow-md transition-all">
      {/* Challenge Header Banner */}
      <div className="flex items-center gap-2.5 border-b border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-4 py-3">
        <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--color-terracotta)]/15 text-[var(--color-terracotta)]">
          <ShieldAlert className="size-4 stroke-[2.5]" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-terracotta)]">
            {t('drillBadge')}
          </h3>
          <p className="text-xs font-semibold text-[var(--color-ink)]">
            {t('drillSubtitle')}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm font-medium leading-snug text-[var(--color-ink)]">
          {drill.prompt}
        </p>

        {/* Tappable Word Segments */}
        <div
          className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-3 text-sm leading-relaxed"
          aria-live="polite"
        >
          {drill.segments.map((segment, index) => {
            const isSelected = selected.includes(index)
            return (
              <button
                key={`${segment.text}-${index}`}
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isSelected}
                className={`btn-press rounded-lg px-2 py-1 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[var(--color-terracotta)] text-white shadow-xs'
                    : segment.flag
                      ? 'border border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-subtle)] text-[var(--color-ink)]'
                      : 'cursor-default text-[var(--color-ink)]'
                }`}
              >
                {segment.text}
              </button>
            )
          })}
        </div>

        {/* Status Feedback with Technique 06: Draw the win */}
        {foundAll ? (
          <div className="flex items-start gap-2.5 rounded-xl border border-[var(--color-good)]/30 bg-[var(--color-good-subtle)] p-3 text-xs font-semibold text-[var(--color-good)] animate-pop-in">
            <span className="flex size-5 shrink-0 items-center justify-center">
              <AnimatedSuccessCheck className="size-5" circleColor="var(--color-good)" tickColor="var(--color-good)" />
            </span>
            <p>
              {t('drillFoundAll', { hint: drill.hint })}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs">
            <span className="font-semibold text-[var(--color-muted)]">
              {t('drillProgress', { current: selected.length, total: flags.length })}
            </span>
            <span className="text-[11px] text-[var(--color-muted)]">
              {drill.hint}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onComplete}
          disabled={!foundAll}
          className="btn-press flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-sm hover:bg-[var(--color-accent-strong)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{t('drillContinue')}</span>
          <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function StoryReader({ capsule, onExit }) {
  const { lang, t } = useI18n()
  const totalCards = capsule?.cards?.length || 0
  const [index, setIndex] = useState(() => getCoursePage(capsule?.id, totalCards))
  const [maxUnlocked, setMaxUnlocked] = useState(() => {
    const prog = getCourseProgress(capsule?.id, totalCards)
    if (prog.completed) return totalCards > 0 ? totalCards - 1 : 0
    const storedPage = getCoursePage(capsule?.id, totalCards)
    return Math.max(storedPage, prog.maxPage ?? 0)
  })
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [notice, setNotice] = useState(null)
  const [isNoticeExiting, setIsNoticeExiting] = useState(false)

  const card = capsule?.cards?.[index] || capsule?.cards?.[0]
  const isLast = index === totalCards - 1

  const dismissNotice = useCallback(() => {
    setIsNoticeExiting(true)
    const exitDelay = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 20 : 250
    setTimeout(() => {
      setNotice(null)
      setIsNoticeExiting(false)
    }, exitDelay)
  }, [])

  const triggerNotice = (msg) => {
    setIsNoticeExiting(false)
    setNotice(msg)
  }

  useEffect(() => {
    if (notice && !isNoticeExiting) {
      const timer = setTimeout(() => {
        dismissNotice()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [notice, isNoticeExiting, dismissNotice])

  const goToPage = (nextIndex) => {
    const clamped = Math.max(0, Math.min(nextIndex, totalCards - 1))
    setIndex(clamped)
    setMaxUnlocked((current) => Math.max(current, clamped))
    saveCoursePage(capsule?.id, clamped, totalCards)
  }

  const handleSegmentClick = (targetIndex) => {
    if (targetIndex <= maxUnlocked) {
      goToPage(targetIndex)
    } else {
      triggerNotice(t('pageNotCompleted'))
    }
  }

  const handleFinish = () => {
    markCourseCompleted(capsule?.id)
    setMaxUnlocked(totalCards > 0 ? totalCards - 1 : 0)
    queueEvent({ type: 'course_completed', capsuleId: capsule?.id, competency: capsule?.competency })
    onExit()
  }

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  const handleSpeak = () => {
    if (isPlayingAudio) {
      stopSpeaking()
      setIsPlayingAudio(false)
    } else {
      setIsPlayingAudio(true)
      speak(`${card.title}. ${card.body}`, {
        lang: lang === 'en' ? 'en-US' : 'fil-PH',
        onEnd: () => setIsPlayingAudio(false),
      })
    }
  }

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200"
      style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      {/* Top Safe Area Shield: keeps the mobile device status bar/panel area clean when scrolling */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg)] pointer-events-none"
        style={{ height: 'var(--sat)' }}
        aria-hidden="true"
      />

      {/* Floating Top Popup Notification with In and Out Animations */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`${
            isNoticeExiting ? 'animate-toast-down-out' : 'animate-toast-down'
          } fixed left-1/2 z-50 flex w-[90%] max-w-[390px] items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-3.5 shadow-2xl backdrop-blur-md transition-all`}
          style={{ top: 'calc(var(--sat) + 1rem)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-warn-subtle)] text-[var(--color-warn)]">
              <Lock className="size-4 stroke-[2.5]" aria-hidden="true" />
            </span>
            <p className="truncate text-xs font-bold text-[var(--color-ink)]">{notice}</p>
          </div>
          <button
            type="button"
            onClick={dismissNotice}
            className="btn-press flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
            aria-label="Close notification"
          >
            <X className="size-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Reader Header */}
      <header className="safe-sticky-header z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onExit}
          className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
          {t('back')}
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--color-accent)]">
            {t('cardProgress', { current: index + 1, total: totalCards })}
          </span>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 px-4 py-5">
        {/* Segmented Progress Track with Interactive Navigation & Feedback */}
        <div
          className="flex items-center gap-1.5"
          role="tablist"
          aria-label="Progreso sa kurso"
        >
          {capsule.cards.map((c, i) => {
            const isCompleted = i <= maxUnlocked
            const isActive = i === index
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSegmentClick(i)}
                aria-label={t('cardProgress', { current: i + 1, total: totalCards })}
                data-progress-segment={i}
                data-unlocked={isCompleted ? 'true' : 'false'}
                className="group relative flex-1 py-2 cursor-pointer focus:outline-hidden"
              >
                <span
                  className={`block h-1.5 w-full rounded-full transition-all duration-300 ${
                    isCompleted
                      ? isActive
                        ? 'bg-[var(--color-accent)] shadow-xs scale-y-125'
                        : 'bg-[var(--color-accent)] opacity-85 hover:opacity-100'
                      : 'bg-[var(--color-line)] hover:bg-[var(--color-line)]/80'
                  }`}
                />
              </button>
            )
          })}
        </div>

        {/* Content Card Presentation with Technique 05: Fast, then slow */}
        <article key={card.id} className="mt-5 space-y-4 page-enter">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-accent)]">
            <span>{t('coursePrefix')} {capsule.title}</span>
          </div>

          <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--color-ink)]">
            {card.title}
          </h1>

          {/* Audio Readout Tool with Equalizer Waveform Animation */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSpeak}
              className={`btn-press flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-all ${
                isPlayingAudio
                  ? 'bg-[var(--color-accent)] text-white border-transparent shadow-md'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-accent)]'
              }`}
            >
              <Volume2 className={`size-4 stroke-[2.5] ${isPlayingAudio ? 'text-white animate-pulse' : 'text-[var(--color-accent)]'}`} aria-hidden="true" />
              <span>{isPlayingAudio ? t('speakingState') : t('listenButton')}</span>

              {isPlayingAudio && (
                <div className="flex items-center gap-0.5 ml-1" aria-hidden="true">
                  <span className="w-1 rounded-full bg-white animate-soundwave-1" />
                  <span className="w-1 rounded-full bg-white animate-soundwave-2" />
                  <span className="w-1 rounded-full bg-white animate-soundwave-3" />
                </div>
              )}
            </button>
            <span className="text-[11px] text-[var(--color-muted)]">
              {t('ttsLabel')}
            </span>
          </div>

          {/* Story Card Body */}
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4.5 shadow-sm">
            <p className="text-[16px] leading-relaxed text-[var(--color-ink)] whitespace-pre-line">
              {card.body}
            </p>
          </div>

          {/* Practical Learner Tip Callout */}
          {card.tip && (
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-terracotta)]/25 bg-[var(--color-terracotta-subtle)] p-4 text-xs leading-relaxed text-[var(--color-ink)]">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--color-terracotta)] text-white font-bold">
                <Lightbulb className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="font-bold text-[var(--color-terracotta)]">{t('tipTitle')}</p>
                <p className="mt-0.5 text-[var(--color-ink)]">{card.tip}</p>
              </div>
            </div>
          )}

          {/* Interactive Red-Flag Drill */}
          {card.drill && (
            <Drill
              drill={card.drill}
              onComplete={() => (isLast ? handleFinish() : goToPage(index + 1))}
            />
          )}
        </article>
      </main>

      {/* Bottom Sticky Action Footer */}
      {!card.drill && (
        <footer className="sticky bottom-0 z-30 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 p-4 backdrop-blur-md">
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => goToPage(index - 1)}
              disabled={index === 0}
              className="btn-press flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
              <span>{t('previous')}</span>
            </button>
            <button
              type="button"
              onClick={() => (isLast ? handleFinish() : goToPage(index + 1))}
              className="btn-press flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
            >
              <span>{isLast ? t('finishCourse') : t('nextLesson')}</span>
              <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
