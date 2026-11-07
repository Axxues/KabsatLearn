import { useState } from 'react'
import { answerOffline } from '../lib/rag.js'
import { speak } from '../lib/tts.js'

const CHIPS = [
  'Paano kung hinihingi ang OTP ko?',
  'Peke ba ang link na ito?',
  'May nagtext na ayuda, totoo ba?',
  'Nabiktima ako, ano gagawin?',
]

function Bubble({ message }) {
  const mine = message.role === 'user'
  return (
    <li className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          mine
            ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)]'
            : 'border border-[var(--color-line)] bg-[var(--color-surface)]'
        }`}
      >
        <p>{message.text}</p>
        {message.source && (
          <p className="mt-2 text-xs opacity-80">
            Source: {message.source.concept} · {message.confidence}% match
          </p>
        )}
        {!message.source && !mine && message.answered && (
          <p className="mt-2 text-xs font-medium text-[var(--color-warn)]">Walang tugma sa na-download na aralin.</p>
        )}
        {!mine && (
          <button
            type="button"
            onClick={() => speak(message.text)}
            className="mt-2 min-h-9 rounded-lg border border-[var(--color-line)] px-2 text-xs font-medium"
          >
            Pakinggan
          </button>
        )}
      </div>
    </li>
  )
}

export default function KabsatAI({ capsule, onExit }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Kumusta! Ako si Kabsat. Itanong mo ang kahit ano tungkol sa "${capsule.title}". Sagot ko ay galing lang sa aralin mo.`,
    },
  ])
  const [input, setInput] = useState('')

  const ask = (question) => {
    const text = question.trim()
    if (!text) return

    const result = answerOffline(text, capsule)
    setMessages((current) => [
      ...current,
      { role: 'user', text },
      {
        role: 'assistant',
        text: result.reply,
        source: result.source,
        confidence: result.confidence,
        answered: true,
      },
    ])
    setInput('')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <button type="button" onClick={onExit} className="min-h-11 rounded-lg px-2 text-sm font-medium text-[var(--color-accent)]">
          ← Back
        </button>
        <div className="text-right">
          <p className="text-sm font-bold">Kabsat AI</p>
          <p className="text-xs text-[var(--color-muted)]">Offline · grounded sa aralin</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-3">
          {messages.map((message, index) => (
            <Bubble key={index} message={message} />
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => ask(chip)}
              className="min-h-9 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-medium text-[var(--color-muted)]"
            >
              {chip}
            </button>
          ))}
        </div>
      </main>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          ask(input)
        }}
        className="sticky bottom-0 flex gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] p-3"
      >
        <label className="sr-only" htmlFor="ask">
          Tanong kay Kabsat
        </label>
        <input
          id="ask"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Itanong kay Kabsat…"
          className="min-h-12 flex-1 rounded-xl border border-[var(--color-line)] px-3 text-sm"
        />
        <button
          type="submit"
          className="min-h-12 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-on-accent)]"
        >
          Send
        </button>
      </form>
    </div>
  )
}
