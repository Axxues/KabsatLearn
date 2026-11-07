import { Capacitor } from '@capacitor/core'

/**
 * Text to speech.
 *
 * On Android we use the native TextToSpeech engine through the Capacitor plugin,
 * because the WebView's speechSynthesis often has no Filipino voice even when the
 * OS does. This device reports `fil-PH` among its 81 installed voices, so the
 * Filipino readout is a real Filipino voice rather than an English engine
 * pronouncing Tagalog.
 *
 * The language follows the interface: Filipino UI reads in fil-PH, English UI in
 * en-US. Web builds fall back to the browser's speechSynthesis.
 */
let pluginPromise = null

function nativePlugin() {
  if (!Capacitor.isNativePlatform()) return Promise.resolve(null)
  if (!pluginPromise) {
    // Wrap the proxy in a plain object. Capacitor plugin proxies define a `then`
    // that throws, so returning the proxy from a promise makes `await` try to
    // unwrap it as a thenable: "TextToSpeech.then() is not implemented".
    pluginPromise = import('@capacitor-community/text-to-speech')
      .then((module) => ({ tts: module.TextToSpeech }))
      .catch(() => null)
  }
  return pluginPromise
}

let currentSession = null

/** Map 'en', 'en-US', 'fil-PH', 'tl' to the two voices we support. */
export function normaliseVoice(value) {
  const tag = String(value ?? '').toLowerCase()
  if (tag === 'en' || tag.startsWith('en-')) return 'en-US'
  return 'fil-PH'
}

export async function stopSpeaking() {
  if (currentSession) {
    const session = currentSession
    currentSession = null
    try {
      session.onEnd?.()
    } catch {
      // ignore handler errors
    }
  }
  const native = await nativePlugin()
  const plugin = native?.tts ?? null
  if (plugin) {
    try {
      await plugin.stop()
    } catch {
      // nothing to stop
    }
    return
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export async function speak(text, { lang = 'fil-PH', onStart, onEnd, onError } = {}) {
  // If there's an active speech session, stop it first
  if (currentSession) {
    await stopSpeaking()
  }

  const voice = normaliseVoice(lang)
  const content = String(text ?? '').trim()
  if (!content) {
    onEnd?.()
    return { ok: false, reason: 'empty' }
  }

  const session = {
    cancelled: false,
    onEnd: () => {
      if (session.cancelled) return
      session.cancelled = true
      if (currentSession === session) {
        currentSession = null
      }
      onEnd?.()
    },
  }
  currentSession = session

  const native = await nativePlugin()
  const plugin = native?.tts ?? null
  if (plugin) {
    try {
      await plugin.stop()
      if (!session.cancelled) onStart?.()
      await plugin.speak({
        text: content,
        lang: voice,
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
      })
      session.onEnd()
      return { ok: true, engine: 'native', lang: voice }
    } catch (error) {
      onError?.(error)
      session.onEnd()
      return { ok: false, engine: 'native', lang: voice, error: error?.message ?? 'speak failed' }
    }
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    session.onEnd()
    return { ok: false, reason: 'unsupported', lang: voice }
  }

  const utterance = new SpeechSynthesisUtterance(content)
  utterance.lang = voice
  utterance.rate = 0.95

  const voices = window.speechSynthesis.getVoices()
  const exact = voices.find((candidate) => candidate.lang?.toLowerCase() === voice.toLowerCase())
  const prefix = voices.find((candidate) => candidate.lang?.toLowerCase().startsWith(voice.slice(0, 2).toLowerCase()))
  const chosen = exact ?? prefix
  if (chosen) utterance.voice = chosen

  utterance.onstart = () => {
    if (!session.cancelled) onStart?.()
  }
  utterance.onend = () => {
    session.onEnd()
  }
  utterance.onerror = (e) => {
    onError?.(e)
    session.onEnd()
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)

  return { ok: true, engine: 'web', lang: voice, matched: Boolean(chosen) }
}

/** Voices the OS actually offers, used to tell the user when Filipino is missing. */
export async function availableVoices() {
  const native = await nativePlugin()
  const plugin = native?.tts ?? null
  if (plugin) {
    try {
      const result = await plugin.getSupportedLanguages()
      return result?.languages ?? []
    } catch {
      return []
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.getVoices().map((voice) => voice.lang)
  }
  return []
}
