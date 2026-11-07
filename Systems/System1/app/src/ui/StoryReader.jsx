import { useMemo, useState } from 'react'
import { speak } from '../lib/tts.js'
import AnimatedSuccessCheck from './AnimatedSuccessCheck.jsx'
import {
  ArrowLeft,
  ArrowRight,
  Volume2,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react'

function Drill({ drill, onComplete }) {
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
            Subukan ang Galing
          </h3>
          <p className="text-xs font-semibold text-[var(--color-ink)]">
            Tukuyin ang mga kahina-hinalang bahagi
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
              Mahusay! Nakita mo ang lahat ng kahina-hinalang detalye. {drill.hint}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-3 py-2 text-xs">
            <span className="font-semibold text-[var(--color-muted)]">
              Nahanap: <span className="font-bold text-[var(--color-ink)]">{selected.length}</span> / {flags.length}
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
          <span>Magpatuloy sa Aralin</span>
          <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function StoryReader({ capsule, onExit }) {
  const [index, setIndex] = useState(0)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const card = capsule.cards[index]
  const isLast = index === capsule.cards.length - 1

  const handleSpeak = () => {
    setIsPlayingAudio(true)
    speak(`${card.title}. ${card.body}`)
    setTimeout(() => setIsPlayingAudio(false), 5000)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
      {/* Reader Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onExit}
          className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
          Bumalik
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-1 text-xs font-bold tabular-nums text-[var(--color-accent)]">
            Aralin {index + 1} ng {capsule.cards.length}
          </span>
        </div>
      </header>

      {/* Main Reading Canvas */}
      <main className="flex-1 px-4 py-5">
        {/* Segmented Progress Track with smooth animation */}
        <div
          className="flex gap-1.5"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={capsule.cards.length}
          aria-label="Progreso sa kurso"
        >
          {capsule.cards.map((c, i) => (
            <div
              key={c.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= index
                  ? 'bg-[var(--color-accent)] shadow-xs scale-y-110'
                  : 'bg-[var(--color-line)]'
              }`}
            />
          ))}
        </div>

        {/* Content Card Presentation with Technique 05: Fast, then slow */}
        <article key={card.id} className="mt-5 space-y-4 page-enter">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-accent)]">
            <span>Kurso: {capsule.title}</span>
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
              <span>{isPlayingAudio ? 'Nagsasalita…' : 'Pakinggan ang Aralin'}</span>

              {isPlayingAudio && (
                <div className="flex items-center gap-0.5 ml-1" aria-hidden="true">
                  <span className="w-1 rounded-full bg-white animate-soundwave-1" />
                  <span className="w-1 rounded-full bg-white animate-soundwave-2" />
                  <span className="w-1 rounded-full bg-white animate-soundwave-3" />
                </div>
              )}
            </button>
            <span className="text-[11px] text-[var(--color-muted)]">
              Filipino Text-to-Speech
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
                <p className="font-bold text-[var(--color-terracotta)]">Mahalagang Paalala</p>
                <p className="mt-0.5 text-[var(--color-ink)]">{card.tip}</p>
              </div>
            </div>
          )}

          {/* Interactive Red-Flag Drill */}
          {card.drill && (
            <Drill
              drill={card.drill}
              onComplete={() => (isLast ? onExit() : setIndex(index + 1))}
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
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="btn-press flex min-h-12 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
              <span>Nakaraan</span>
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onExit() : setIndex(index + 1))}
              className="btn-press flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
            >
              <span>{isLast ? 'Tapusin ang Kurso' : 'Susunod na Aralin'}</span>
              <ArrowRight className="size-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
