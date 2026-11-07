import { useState, useRef, useEffect, useCallback } from 'react'
import { answerOffline, contextFor } from './rag.js'

const llm = () => import('./llm.js')

export function useKabsatAiState({ capsule, t, lang }) {
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: t('aiWelcome', { title: capsule.title }),
    },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [model, setModel] = useState({ state: 'idle', progress: 0 })
  const [known, setKnown] = useState(() => {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem('kabsat_llm_cached') === '1'
  })

  const messagesRef = useRef(messages)
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const abortControllerRef = useRef(null)

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsProcessing(false)
    setMessages((current) =>
      current.map((msg, idx) =>
        idx === current.length - 1 && msg.thinking
          ? {
              ...msg,
              thinking: false,
              answered: true,
              text: msg.text || (lang === 'en' ? 'Response generation stopped.' : 'Itinigil ang pagbuo ng sagot.'),
            }
          : msg,
      ),
    )
  }, [lang])

  const prepareModel = async () => {
    setModel({ state: 'loading', progress: 0 })
    try {
      const { loadEngine } = await llm()
      await loadEngine((report) => setModel({ state: 'loading', progress: report.progress ?? 0 }))
      setModel({ state: 'ready', progress: 1 })
      setKnown(true)
      localStorage.setItem('kabsat_llm_cached', '1')
    } catch {
      setModel({ state: 'error', progress: 0 })
    }
  }

  const ask = useCallback(
    async (question, { delay = 1000 } = {}) => {
      const text = question?.trim()
      if (!text) return

      const abortController = new AbortController()
      abortControllerRef.current = abortController
      const { signal } = abortController

      const retrieved = answerOffline(text, capsule)
      setInput('')
      setIsProcessing(true)

      setMessages((current) => [...current, { role: 'user', text }])

      const waitDelay = (ms) =>
        new Promise((resolve) => {
          if (ms <= 0 || signal.aborted) {
            resolve()
            return
          }
          const timer = setTimeout(resolve, ms)
          signal.addEventListener('abort', () => {
            clearTimeout(timer)
            resolve()
          })
        })

      // Persona questions are the only predefined answers.
      if (retrieved.kind === 'persona') {
        setMessages((current) => [
          ...current,
          {
            role: 'assistant',
            text: '',
            thinking: true,
            answered: false,
          },
        ])

        await waitDelay(delay)
        if (signal.aborted) return

        setMessages((current) =>
          current.map((msg, idx) =>
            idx === current.length - 1
              ? {
                  ...msg,
                  role: 'assistant',
                  text: retrieved.reply,
                  source: null,
                  confidence: 100,
                  kind: 'persona',
                  answered: true,
                  thinking: false,
                }
              : msg,
          ),
        )
        setIsProcessing(false)
        abortControllerRef.current = null
        return
      }

      // Content questions go to the on-device model with fallback to retrieved answer
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: '',
          thinking: true,
          answered: true,
          source: retrieved.source,
          confidence: retrieved.confidence,
          kind: 'content',
        },
      ])

      const patchLast = (update) =>
        setMessages((current) =>
          current.map((entry, position) => (position === current.length - 1 ? { ...entry, ...update } : entry)),
        )

      try {
        const { explain, engineReady, loadEngine, isModelCached } = await llm()
        if (signal.aborted) return

        if (!engineReady()) {
          const cached = await isModelCached()
          if (!cached) {
            await waitDelay(delay)
            if (signal.aborted) return
            patchLast({ text: retrieved.reply, thinking: false, kind: 'fallback', needsModel: true })
            return
          }

          if (signal.aborted) return
          await loadEngine((report) =>
            patchLast({
              thinking: true,
              text: `${lang === 'en' ? 'Loading on-device AI' : 'Naglo-load ng AI'} ${Math.round(
                (report.progress ?? 0) * 100,
              )}%`,
            }),
          )
          if (signal.aborted) return
          patchLast({ text: '', thinking: true })
        }

        const { language, chunks } = contextFor(text, capsule, 1)
        if (signal.aborted) return

        const generated = await explain({
          query: text,
          chunks,
          language,
          signal,
          onToken: (partial) => {
            if (!signal.aborted) patchLast({ text: partial, thinking: false })
          },
        })

        if (signal.aborted) return

        if (generated && generated.ok && generated.text) {
          patchLast({ text: generated.text, thinking: false, kind: 'generated' })
        } else if (generated && generated.aborted) {
          patchLast({
            text: lang === 'en' ? 'Response generation stopped.' : 'Itinigil ang pagbuo ng sagot.',
            thinking: false,
          })
        } else {
          patchLast({ text: retrieved.reply, thinking: false, kind: 'fallback', guardFailed: true })
        }
      } catch {
        if (!signal.aborted) {
          await waitDelay(delay)
          if (!signal.aborted) {
            patchLast({ text: retrieved.reply, thinking: false, kind: 'fallback' })
          }
        }
      } finally {
        if (!signal.aborted) {
          setIsProcessing(false)
          abortControllerRef.current = null
        }
      }
    },
    [capsule, lang],
  )

  const explainAt = useCallback(
    async (index) => {
      const currentMessages = messagesRef.current
      const target = currentMessages[index]
      const question = [...currentMessages.slice(0, index)].reverse().find((entry) => entry.role === 'user')
      if (!target || !question) return

      const abortController = new AbortController()
      abortControllerRef.current = abortController
      const { signal } = abortController

      const { language, chunks } = contextFor(question.text, capsule, 1)

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: '',
          thinking: true,
          answered: true,
          source: target.source,
          confidence: target.confidence,
        },
      ])
      setIsProcessing(true)

      const patchLast = (update) =>
        setMessages((current) =>
          current.map((entry, position) => (position === current.length - 1 ? { ...entry, ...update } : entry)),
        )

      try {
        const { explain } = await llm()
        if (signal.aborted) return
        const result = await explain({
          query: question.text,
          chunks,
          language,
          signal,
          onToken: (text) => {
            if (!signal.aborted) patchLast({ text, thinking: false })
          },
        })
        if (signal.aborted) return
        patchLast({
          text: result.ok && result.text ? result.text : target.text,
          thinking: false,
          guardFailed: !result.ok,
        })
      } catch {
        if (!signal.aborted) {
          patchLast({ text: target.text, thinking: false, guardFailed: true })
        }
      } finally {
        if (!signal.aborted) {
          setIsProcessing(false)
          abortControllerRef.current = null
        }
      }
    },
    [capsule],
  )

  return {
    messages,
    setMessages,
    input,
    setInput,
    isProcessing,
    stop,
    model,
    prepareModel,
    ask,
    explainAt,
    known,
  }
}
