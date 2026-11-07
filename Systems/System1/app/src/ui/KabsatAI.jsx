import { useState, useRef, useEffect } from 'react'
import { answerOffline } from '../lib/rag.js'
import { speak } from '../lib/tts.js'
import { useI18n } from '../lib/i18n.jsx'
import {
  ArrowLeft,
  Bot,
  BookOpen,
  AlertCircle,
  Volume2,
  Send,
  Sparkles,
} from 'lucide-react'

function Bubble({ message }) {
  const { lang, t } = useI18n()
  const mine = message.role === 'user'
  const [speaking, setSpeaking] = useState(false)

  const handleSpeak = () => {
    setSpeaking(true)
    speak(message.text, { lang: lang === 'en' ? 'en-US' : 'fil-PH' })
    setTimeout(() => setSpeaking(false), 4500)
  }

  return (
    <li className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[88%] gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
        {!mine && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent-strong)] text-[var(--color-on-accent)] shadow-xs">
            <Bot className="size-4 stroke-[2.2]" aria-hidden="true" />
          </div>
        )}

        <div
          className={`space-y-2 rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs transition-all ${
            mine
              ? 'rounded-tr-xs bg-[var(--color-accent)] text-[var(--color-on-accent)]'
              : 'rounded-tl-xs border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)]'
          }`}
        >
          <p className="whitespace-pre-line">{message.text}</p>

          {/* Source Citation for Grounded Replies */}
          {message.source && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-accent)]/20 bg-[var(--color-accent-subtle)] px-2.5 py-1 text-xs text-[var(--color-accent)]">
              <BookOpen className="size-3.5 shrink-0 stroke-[2]" aria-hidden="true" />
              <span className="truncate font-semibold">
                {t('sourceCitation')} {message.source.concept}
              </span>
              <span className="ml-auto font-mono text-[10px] font-bold">
                {message.confidence}% match
              </span>
            </div>
          )}

          {/* Out of scope refusal alert */}
          {!message.source && !mine && message.answered && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-warn)]/30 bg-[var(--color-warn-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--color-warn)]">
              <AlertCircle className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
              <span>{t('outOfScopeAlert')}</span>
            </div>
          )}

          {/* Speech Playback Button for Assistant with Waveform Animation */}
          {!mine && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSpeak}
                className={`btn-press inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${
                  speaking
                    ? 'border-transparent bg-[var(--color-accent)] text-white shadow-xs'
                    : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Volume2 className={`size-3 stroke-[2.5] ${speaking ? 'animate-pulse' : ''}`} aria-hidden="true" />
                <span>{speaking ? t('speakingState') : t('listenMessage')}</span>
                {speaking && (
                  <span className="flex items-center gap-0.5 ml-0.5" aria-hidden="true">
                    <span className="w-0.5 h-2 rounded-full bg-white animate-soundwave-1" />
                    <span className="w-0.5 h-3 rounded-full bg-white animate-soundwave-2" />
                    <span className="w-0.5 h-2 rounded-full bg-white animate-soundwave-3" />
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

export default function KabsatAI({ capsule, onExit }) {
  const { t, translations } = useI18n()
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: t('aiWelcome', { title: capsule.title }),
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const chips = translations.quickChips || []

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onExit}
          className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
        >
          <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
          {t('back')}
        </button>

        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className="text-sm font-black text-[var(--color-ink)]">{t('aiTitle')}</span>
            <span className="size-2 rounded-full bg-[var(--color-good)] animate-pulse" aria-hidden="true" />
          </div>
          <p className="text-[11px] font-medium text-[var(--color-muted)]">
            {t('aiSubtitle')}
          </p>
        </div>
      </header>

      {/* Chat Messages Log */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <ul className="space-y-3.5">
          {messages.map((message, index) => (
            <Bubble key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </ul>

        {/* Suggested Prompt Chips */}
        <div className="pt-2">
          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
            <Sparkles className="size-3.5 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
            {t('quickQuestionsHeader')}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => ask(chip)}
                className="btn-press rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] shadow-2xs hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Message Input Bar */}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          ask(input)
        }}
        className="sticky bottom-0 z-30 flex gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 p-3 backdrop-blur-md"
      >
        <label className="sr-only" htmlFor="ask">
          {t('askPlaceholder')}
        </label>
        <input
          id="ask"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('askPlaceholder')}
          className="min-h-12 flex-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-hidden"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-press flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>{t('send')}</span>
          <Send className="size-4 stroke-[2.5]" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}
