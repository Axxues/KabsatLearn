import { useState, useRef, useEffect } from 'react'
// The on-device model runtime is ~6 MB, so it is loaded only when the learner
// asks for an explanation. Static import would make every launch parse it.
const llm = () => import('../lib/llm.js')
import { speak, stopSpeaking } from '../lib/tts.js'
import { useI18n } from '../lib/i18n.jsx'
import { useKabsatAiState } from '../lib/useKabsatAiState.js'
import {
  ArrowLeft,
  Bot,
  BookOpen,
  AlertCircle,
  Volume2,
  Send,
  Sparkles,
  Zap,
  Square,
  RotateCcw,
} from 'lucide-react'

function Bubble({
  message,
  canExplain,
  onExplain,
  isSpeaking = false,
  onToggleSpeak,
}) {
  const { lang, t } = useI18n()
  const mine = message.role === 'user'
  const [localSpeaking, setLocalSpeaking] = useState(false)

  const activeSpeaking = onToggleSpeak ? isSpeaking : localSpeaking

  const handleSpeakClick = () => {
    if (onToggleSpeak) {
      onToggleSpeak()
      return
    }
    if (localSpeaking) {
      stopSpeaking()
      setLocalSpeaking(false)
    } else {
      setLocalSpeaking(true)
      speak(message.text, {
        lang: lang === 'en' ? 'en-US' : 'fil-PH',
        onEnd: () => setLocalSpeaking(false),
      })
    }
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
          {message.thinking ? (
            <div className="flex items-center gap-2 py-1 text-xs font-semibold text-[var(--color-muted)]">
              <Sparkles className="size-3.5 animate-spin text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
              <span>{message.text || (lang === 'en' ? 'Kabsat is thinking…' : 'Nag-iisip si Kabsat…')}</span>
            </div>
          ) : (
            <p className="whitespace-pre-line">{message.text}</p>
          )}

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
          {!message.source && !mine && message.answered && message.kind !== 'persona' && (
            <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-warn)]/30 bg-[var(--color-warn-subtle)] px-2.5 py-1 text-xs font-semibold text-[var(--color-warn)]">
              <AlertCircle className="size-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
              <span>{t('outOfScopeAlert')}</span>
            </div>
          )}

          {canExplain && !mine && message.source && message.kind !== 'generated' && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onExplain}
                className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-subtle)] px-2.5 py-1 text-xs font-bold text-[var(--color-accent)]"
              >
                <Sparkles className="size-3 stroke-[2.5]" aria-hidden="true" />
                <span>{lang === 'en' ? 'Explain more' : 'Ipaliwanag pa'}</span>
              </button>
            </div>
          )}

          {/* Fallback notice: the model was unavailable or failed the language guard */}
          {message.kind === 'fallback' && (
            <p className="text-[11px] font-semibold text-[var(--color-warn)]">
              {lang === 'en'
                ? 'On-device AI unavailable — showing the lesson text.'
                : 'Walang on-device AI — teksto ng aralin ang ipinapakita.'}
            </p>
          )}

          {/* Speech Playback Button for Assistant with Waveform Animation */}
          {!mine && (
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSpeakClick}
                aria-label={
                  activeSpeaking
                    ? (lang === 'en' ? 'Stop speaking' : 'Itigil ang pagsasalita')
                    : (lang === 'en' ? 'Listen to message' : 'Pakinggan ang mensahe')
                }
                className={`btn-press inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${
                  activeSpeaking
                    ? 'border-transparent bg-[var(--color-accent)] text-white shadow-xs'
                    : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                <Volume2 className={`size-3 stroke-[2.5] ${activeSpeaking ? 'animate-pulse' : ''}`} aria-hidden="true" />
                <span>{activeSpeaking ? (lang === 'en' ? 'Speaking...' : 'Nagsasalita…') : t('listenMessage')}</span>
                {activeSpeaking && (
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

export default function KabsatAI({
  capsule,
  onExit,
  messages: propMessages,
  input: propInput,
  setInput: propSetInput,
  isProcessing: propIsProcessing,
  model: propModel,
  prepareModel: propPrepareModel,
  known: propKnown,
  ask: propAsk,
  explainAt: propExplainAt,
  stop: propStop,
  resetSession: propResetSession,
  installedCapsules,
}) {
  const { t, lang, translations } = useI18n()
  const fallback = useKabsatAiState({
    capsule,
    installedCapsules: installedCapsules ?? (capsule ? [capsule] : []),
    t,
    lang,
  })

  const messages = propMessages ?? fallback.messages
  const input = propInput ?? fallback.input
  const setInput = propSetInput ?? fallback.setInput
  const isProcessing = propIsProcessing ?? fallback.isProcessing
  const model = propModel ?? fallback.model
  const prepareModel = propPrepareModel ?? fallback.prepareModel
  const known = propKnown ?? fallback.known
  const ask = propAsk ?? fallback.ask
  const explainAt = propExplainAt ?? fallback.explainAt
  const stop = propStop ?? fallback.stop
  const resetSession = propResetSession ?? fallback.resetSession
  const messagesEndRef = useRef(null)
  const [speakingIndex, setSpeakingIndex] = useState(null)

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  const handleToggleSpeak = (idx, text) => {
    if (speakingIndex === idx) {
      stopSpeaking()
      setSpeakingIndex(null)
    } else {
      setSpeakingIndex(idx)
      speak(text, {
        lang: lang === 'en' ? 'en-US' : 'fil-PH',
        onEnd: () => {
          setSpeakingIndex((prev) => (prev === idx ? null : prev))
        },
      })
    }
  }

  // Warm the model when the tab opens if it is already downloaded. Loading it
  // from cache takes ~20 s, and paying that on the first question made the tutor
  // feel broken. This is silent: a failure just leaves the button in place.
  useEffect(() => {
    if (!known) return
    let cancelled = false
    llm()
      .then(({ loadEngine }) => loadEngine())
      .then(() => {
        if (!cancelled) setModel({ state: 'ready', progress: 1 })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [known])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const chips = translations.quickChips || []

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-[var(--color-bg)] text-[var(--color-ink)]">
      {/* Top Safe Area Shield: keeps the mobile device status bar/panel area clean when scrolling */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg)] pointer-events-none"
        style={{ height: 'var(--sat)' }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="safe-sticky-header z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              stopSpeaking()
              onExit?.()
            }}
            className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
            <span>{t('back')}</span>
          </button>

          {messages.length > 1 && (
            <button
              type="button"
              onClick={() => {
                stopSpeaking()
                setSpeakingIndex(null)
                resetSession()
              }}
              title={t('clearSessionTooltip')}
              aria-label={t('newChat')}
              className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-accent)] transition-all"
            >
              <RotateCcw className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>{t('newChat')}</span>
            </button>
          )}
        </div>

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

      {model.state === 'ready' ? (
        <div className="inline-flex w-full items-center gap-1.5 border-b border-[var(--color-line)] bg-[var(--color-accent-subtle)] px-4 py-1.5 text-[11px] font-bold text-[var(--color-accent)]">
          <Zap className="size-3.5 stroke-[2]" aria-hidden="true" />
          {lang === 'en' ? 'On-device AI ready · works offline' : 'On-device AI handa · gumagana offline'}
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2">
          <button
            type="button"
            onClick={prepareModel}
            disabled={model.state === 'loading'}
            className="btn-press inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-2.5 py-1.5 text-[11px] font-bold text-[var(--color-muted)] disabled:opacity-60"
          >
            {model.state === 'loading'
              ? `${lang === 'en' ? 'Downloading' : 'Dina-download'} ${Math.round(model.progress * 100)}%`
              : known
                ? lang === 'en' ? 'Load on-device AI' : 'I-load ang AI'
                : lang === 'en' ? 'Download on-device AI (~400 MB)' : 'I-download ang AI (~400 MB)'}
          </button>
          {model.state === 'error' && (
            <span className="text-[11px] font-semibold text-[var(--color-warn)]">
              {lang === 'en' ? 'Download failed' : 'Bigo ang download'}
            </span>
          )}
        </div>
      )}

      {/* Chat Messages Log */}
      <main className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        <ul className="space-y-3.5">
          {messages.map((message, index) => (
            <Bubble
              key={index}
              message={message}
              canExplain={model.state === 'ready'}
              onExplain={() => explainAt(index)}
              isSpeaking={speakingIndex === index}
              onToggleSpeak={() => handleToggleSpeak(index, message.text)}
            />
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
                disabled={isProcessing}
                onClick={() => ask(chip)}
                className={`btn-press rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted)] shadow-2xs hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] ${
                  isProcessing ? 'opacity-50 pointer-events-none' : ''
                }`}
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
          if (isProcessing) return
          const text = event.target.elements?.ask?.value || input
          ask(text)
        }}
        className="shrink-0 flex gap-2.5 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 pt-3 pb-7 backdrop-blur-md"
      >
        <label className="sr-only" htmlFor="ask">
          {t('askPlaceholder')}
        </label>
        <input
          id="ask"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={isProcessing ? (lang === 'en' ? 'Thinking…' : 'Nag-iisip…') : t('askPlaceholder')}
          disabled={isProcessing}
          className="min-h-12 flex-1 rounded-2xl border border-[var(--color-line)] bg-[var(--color-bg)] px-4 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:outline-hidden disabled:opacity-60"
        />
        {isProcessing ? (
          <button
            type="button"
            onClick={stop}
            aria-label={t('stop')}
            className="btn-press flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-terracotta)] px-4 text-sm font-bold text-white shadow-md hover:opacity-95"
          >
            <span>{t('stop')}</span>
            <Square className="size-3.5 fill-current stroke-[2]" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-press flex min-h-12 items-center justify-center gap-1.5 rounded-2xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{t('send')}</span>
            <Send className="size-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        )}
      </form>
    </div>
  )
}
