import { useMemo, useState } from 'react'
import { speak } from '../lib/tts.js'

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
    <div className="mt-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-bg)] p-4">
      <p className="text-sm font-semibold">{drill.prompt}</p>
      <p className="mt-3 flex flex-wrap gap-1 text-sm leading-relaxed" aria-live="polite">
        {drill.segments.map((segment, index) => (
          <button
            key={`${segment.text}-${index}`}
            type="button"
            onClick={() => toggle(index)}
            aria-pressed={selected.includes(index)}
            className={`rounded px-1 py-0.5 text-left transition-colors ${
              selected.includes(index)
                ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]'
                : segment.flag
                  ? 'hover:bg-[var(--color-accent)]/10'
                  : 'cursor-default'
            }`}
          >
            {segment.text}
          </button>
        ))}
      </p>
      {foundAll ? (
        <p className="mt-3 text-sm font-medium text-[var(--color-good)]">
          Nakita mo lahat. {drill.hint}
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Nahanap: {selected.length} / {flags.length}. {drill.hint}
        </p>
      )}
      <button
        type="button"
        onClick={onComplete}
        disabled={!foundAll}
        className="mt-4 min-h-11 w-full rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-on-accent)] disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  )
}

export default function StoryReader({ capsule, onExit }) {
  const [index, setIndex] = useState(0)
  const card = capsule.cards[index]
  const isLast = index === capsule.cards.length - 1

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <button
          type="button"
          onClick={onExit}
          className="min-h-11 rounded-lg px-2 text-sm font-medium text-[var(--color-accent)]"
        >
          ← Back
        </button>
        <span className="text-xs font-semibold text-[var(--color-muted)]">
          {index + 1} / {capsule.cards.length}
        </span>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex gap-1" aria-hidden="true">
          {capsule.cards.map((c, i) => (
            <span
              key={c.id}
              className={`h-1 flex-1 rounded-full ${
                i <= index ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-line)]'
              }`}
            />
          ))}
        </div>

        <article className="mt-6">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.01em]">{card.title}</h1>

          <div className="mt-4 flex items-start gap-3">
            <button
              type="button"
              onClick={() => speak(`${card.title}. ${card.body}`)}
              className="min-h-11 shrink-0 rounded-xl border border-[var(--color-line)] px-3 text-sm font-medium"
            >
              Pakinggan
            </button>
          </div>

          <p className="mt-4 text-[16px] leading-relaxed">{card.body}</p>

          {card.tip && (
            <p className="mt-4 rounded-xl bg-[var(--color-accent)]/8 p-3 text-sm leading-relaxed text-[var(--color-accent-strong)]">
              {card.tip}
            </p>
          )}

          {card.drill && (
            <Drill
              drill={card.drill}
              onComplete={() => (isLast ? onExit() : setIndex(index + 1))}
            />
          )}
        </article>
      </main>

      {!card.drill && (
        <footer className="sticky bottom-0 border-t border-[var(--color-line)] bg-[var(--color-surface)] p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              className="min-h-12 rounded-xl border border-[var(--color-line)] px-4 text-sm font-medium disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (isLast ? onExit() : setIndex(index + 1))}
              className="min-h-12 flex-1 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-on-accent)]"
            >
              {isLast ? 'Finish course' : 'Next'}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
