let warned = false

export function speak(text, { lang = 'fil-PH' } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { ok: false, reason: 'unsupported' }
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.95

  const voices = window.speechSynthesis.getVoices()
  const filipino = voices.find((voice) => voice.lang?.toLowerCase().startsWith('fil'))

  if (filipino) {
    utterance.voice = filipino
  } else if (!warned) {
    warned = true
  }

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)

  return { ok: true, usedFallbackVoice: !filipino }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
