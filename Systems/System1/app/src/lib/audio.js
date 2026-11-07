let context = null

function getContext() {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext ?? window.webkitAudioContext
  if (!AudioCtor) return null
  if (!context) context = new AudioCtor()
  return context
}

function tone(frequency, duration, type = 'sine', gainValue = 0.06, delay = 0) {
  const ctx = getContext()
  if (!ctx) return

  const start = ctx.currentTime + delay
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(gainValue, start)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration)
}

export function playCorrect() {
  tone(660, 0.12, 'triangle')
  tone(990, 0.16, 'triangle', 0.06, 0.1)
}

export function playWrong() {
  tone(180, 0.22, 'sawtooth', 0.05)
}

export function playLevelUp() {
  ;[523, 659, 784, 1047].forEach((frequency, index) => {
    tone(frequency, 0.12, 'triangle', 0.05, index * 0.08)
  })
}

export function playTick() {
  tone(440, 0.05, 'square', 0.02)
}
