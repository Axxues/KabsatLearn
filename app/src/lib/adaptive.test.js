import { describe, expect, it } from 'vitest'
import {
  BANDS,
  createState,
  markAnswered,
  nextQuestion,
  recordAnswer,
  scoreAnswer,
} from './adaptive.js'

const bank = [
  { id: 'f1', band: 'foundational' },
  { id: 'f2', band: 'foundational' },
  { id: 'c1', band: 'core' },
  { id: 'c2', band: 'core' },
  { id: 's1', band: 'stretch' },
]

describe('recordAnswer', () => {
  it('drops a band after two consecutive misses', () => {
    let state = createState('core')
    state = recordAnswer(state, { correct: false, ms: 3000 })
    expect(state.band).toBe('core')
    state = recordAnswer(state, { correct: false, ms: 3000 })
    expect(state.band).toBe('foundational')
    expect(state.changed).toBe(true)
  })

  it('does not drop after a single miss', () => {
    const state = recordAnswer(createState('core'), { correct: false, ms: 2000 })
    expect(state.band).toBe('core')
  })

  it('climbs a band after two fast correct answers', () => {
    let state = createState('core')
    state = recordAnswer(state, { correct: true, ms: 2500 })
    expect(state.band).toBe('core')
    state = recordAnswer(state, { correct: true, ms: 2000 })
    expect(state.band).toBe('stretch')
    expect(state.changed).toBe(true)
  })

  it('does not climb when the answers were slow', () => {
    let state = createState('core')
    state = recordAnswer(state, { correct: true, ms: 9000 })
    state = recordAnswer(state, { correct: true, ms: 9000 })
    expect(state.band).toBe('core')
  })

  it('never leaves the band range', () => {
    let low = createState('foundational')
    low = recordAnswer(low, { correct: false, ms: 1000 })
    low = recordAnswer(low, { correct: false, ms: 1000 })
    expect(low.band).toBe(BANDS[0])

    let high = createState('stretch')
    high = recordAnswer(high, { correct: true, ms: 1000 })
    high = recordAnswer(high, { correct: true, ms: 1000 })
    expect(high.band).toBe(BANDS[BANDS.length - 1])
  })
})

describe('nextQuestion', () => {
  it('prefers a question in the current band', () => {
    const { question } = nextQuestion(bank, createState('core'))
    expect(question.band).toBe('core')
  })

  it('falls back to another band when the current band is empty', () => {
    const state = { ...createState('stretch'), answered: ['s1'] }
    const { question } = nextQuestion(bank, state)
    expect(question).not.toBeNull()
    expect(question.id).not.toBe('s1')
  })

  it('returns null only when every question is answered', () => {
    const state = { ...createState('core'), answered: bank.map((q) => q.id) }
    expect(nextQuestion(bank, state).question).toBeNull()
  })

  it('never repeats an answered question', () => {
    let state = createState('core')
    const seen = new Set()
    for (let i = 0; i < bank.length; i += 1) {
      const { question } = nextQuestion(bank, state)
      expect(seen.has(question.id)).toBe(false)
      seen.add(question.id)
      state = markAnswered(state, question.id)
    }
  })
})

describe('scoreAnswer', () => {
  it('gives more points for faster correct answers', () => {
    const fast = scoreAnswer({ correct: true, msRemaining: 12000, msTotal: 15000, streak: 0 })
    const slow = scoreAnswer({ correct: true, msRemaining: 2000, msTotal: 15000, streak: 0 })
    expect(fast).toBeGreaterThan(slow)
  })

  it('awards nothing for a wrong answer', () => {
    expect(scoreAnswer({ correct: false, msRemaining: 15000, msTotal: 15000, streak: 5 })).toBe(0)
  })

  it('applies a streak multiplier', () => {
    const plain = scoreAnswer({ correct: true, msRemaining: 10000, msTotal: 15000, streak: 0 })
    const streaked = scoreAnswer({ correct: true, msRemaining: 10000, msTotal: 15000, streak: 4 })
    expect(streaked).toBeGreaterThan(plain)
  })
})
