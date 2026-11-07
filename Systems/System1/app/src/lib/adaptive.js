export const BANDS = ['foundational', 'core', 'stretch']

export const BAND_LABELS = {
  foundational: 'Foundation',
  core: 'Core',
  stretch: 'Hard mode',
}

export function createState(band = 'core') {
  return { band, correctStreak: 0, wrongStreak: 0, answered: [] }
}

function up(band) {
  const index = BANDS.indexOf(band)
  return BANDS[Math.min(BANDS.length - 1, index + 1)]
}

function down(band) {
  const index = BANDS.indexOf(band)
  return BANDS[Math.max(0, index - 1)]
}

/**
 * Pick the next unanswered question for the current band.
 * Falls back to any unanswered question so the quiz never stalls while
 * questions remain — an empty band must not end the round early.
 */
export function nextQuestion(bank, state) {
  const remaining = bank.filter((q) => !state.answered.includes(q.id))
  if (remaining.length === 0) return { question: null, band: state.band, exhausted: true }

  const inBand = remaining.filter((q) => q.band === state.band)
  const question = inBand[0] ?? remaining[0]

  return { question, band: state.band, exhausted: false }
}

/** Kahoot-style scoring: fast answers are worth more, with a streak bonus. */
export function scoreAnswer({ correct, msRemaining, msTotal, streak }) {
  if (!correct) return 0
  const ratio = Math.max(0, Math.min(1, msRemaining / msTotal))
  const base = Math.round(1000 * ratio)
  const multiplier = Math.min(3, 1 + Math.floor(streak / 2))
  return Math.max(100, base) * multiplier
}

export function recordAnswer(state, { correct, ms, fastMs = 6000 }) {
  const correctStreak = correct ? state.correctStreak + 1 : 0
  const wrongStreak = correct ? 0 : state.wrongStreak + 1

  let band = state.band
  if (correct && correctStreak >= 2 && ms < fastMs) band = up(band)
  else if (!correct && wrongStreak >= 2) band = down(band)

  return {
    ...state,
    band,
    correctStreak,
    wrongStreak,
    changed: band !== state.band,
    answered: state.answered,
  }
}

export function markAnswered(state, id) {
  if (state.answered.includes(id)) return state
  return { ...state, answered: [...state.answered, id] }
}
