import { describe, expect, it } from 'vitest'
import capsule101 from '../data/capsules/capsule-101.json'
import { answerOffline, answerOnline, matchPredefinedLesson, normalizeForMatch } from './rag.js'

describe('normalizeForMatch', () => {
  it('handles casing, spacing, and punctuation', () => {
    expect(normalizeForMatch('  Ang OTP ay susi ng bahay mo?!  ')).toBe('ang otp ay susi ng bahay mo')
    expect(normalizeForMatch('Hello, World!')).toBe('hello world')
    expect(normalizeForMatch('¿Qué tal?')).toBe('qué tal')
    expect(normalizeForMatch('Bago magbayad gamit ang QR, ano ang dapat tingnan?')).toBe(
      'bago magbayad gamit ang qr ano ang dapat tingnan',
    )
    expect(normalizeForMatch('Ang    OTP   ay')).toBe('ang otp ay')
    expect(normalizeForMatch('“Kabsat” — ‘Ligtas’')).toBe('kabsat ligtas')
    expect(normalizeForMatch('')).toBe('')
    expect(normalizeForMatch(null)).toBe('')
    expect(normalizeForMatch(undefined)).toBe('')
  })
})

describe('matchPredefinedLesson', () => {
  it('returns instant lesson card match with body and tip', () => {
    const resultTl = matchPredefinedLesson('Ang OTP ay susi ng bahay mo', capsule101, 'tl')
    expect(resultTl).not.toBeNull()
    expect(resultTl.kind).toBe('predefined')
    expect(resultTl.confidence).toBe(100)
    expect(resultTl.lang).toBe('tl')
    expect(resultTl.reply).toContain(capsule101.cards[0].body)
    expect(resultTl.reply).toContain(`Payo: ${capsule101.cards[0].tip}`)
    expect(resultTl.source).toEqual({
      concept: capsule101.cards[0].title,
      capsuleId: capsule101.id,
      capsuleTitle: capsule101.title,
      cardId: capsule101.cards[0].id,
    })

    const resultEn = matchPredefinedLesson('ang otp ay susi ng bahay mo?', capsule101, 'en')
    expect(resultEn).not.toBeNull()
    expect(resultEn.lang).toBe('en')
    expect(resultEn.reply).toContain(`Tip: ${capsule101.cards[0].tip}`)
  })

  it('returns instant quiz question match with correct answer', () => {
    const resultTl = matchPredefinedLesson(
      'May tumawag na taga-GCash at hiningi ang OTP mo. Ano ang gagawin mo?',
      capsule101,
      'tl',
    )
    expect(resultTl).not.toBeNull()
    expect(resultTl.kind).toBe('predefined')
    expect(resultTl.confidence).toBe(100)
    expect(resultTl.lang).toBe('tl')
    expect(resultTl.reply).toBe('Tamang sagot: "Hindi ibibigay at ibablock ang number".')
    expect(resultTl.source).toEqual({
      concept: capsule101.questions[0].stem,
      capsuleId: capsule101.id,
      capsuleTitle: capsule101.title,
      questionId: capsule101.questions[0].id,
    })

    // Question with hint in English
    const mockCapsule = {
      id: 'mock-1',
      title: 'Mock Capsule',
      cards: [],
      questions: [
        {
          id: 'q-hint',
          stem: 'Ano ang gagawin bago magbayad?',
          options: ['Tingnan ang QR', 'Ibigay ang PIN'],
          answer: 0,
          hint: 'Huwag basta magbayad.',
        },
      ],
    }
    const resultEn = matchPredefinedLesson('Ano ang gagawin bago magbayad?', mockCapsule, 'en')
    expect(resultEn).not.toBeNull()
    expect(resultEn.lang).toBe('en')
    expect(resultEn.reply).toBe('Correct answer: "Tingnan ang QR". Huwag basta magbayad.')
  })

  it('searches across an array of capsules and returns null when not found', () => {
    const arrayResult = matchPredefinedLesson('Ang OTP ay susi ng bahay mo', [capsule101], 'tl')
    expect(arrayResult).not.toBeNull()
    expect(arrayResult.kind).toBe('predefined')

    const notFound = matchPredefinedLesson('Walang ganitong aralin dito', [capsule101], 'tl')
    expect(notFound).toBeNull()
  })
})

describe('answerOffline', () => {
  it('returns predefined result when query matches card title', () => {
    const result = answerOffline('ang otp ay susi ng bahay mo?', capsule101)
    expect(result.kind).toBe('predefined')
    expect(result.confidence).toBe(100)
    expect(result.source.cardId).toBe('c1')
    expect(result.reply).toContain(capsule101.cards[0].body)
  })

  it('searches installedCapsules if provided', () => {
    const emptyCap = { id: 'empty', title: 'Empty', cards: [], questions: [], chunks: [] }
    const result = answerOffline('Ang OTP ay susi ng bahay mo', emptyCap, {
      installedCapsules: [capsule101],
    })
    expect(result.kind).toBe('predefined')
    expect(result.source.cardId).toBe('c1')
  })

  it('answers a covered question with a cited source', () => {
    const result = answerOffline('paano kung hinihingi ang OTP ko', capsule101, { name: 'Ana' })

    expect(result.source).not.toBeNull()
    expect(result.source.capsule).toBe(capsule101.title)
    expect(result.confidence).toBeGreaterThanOrEqual(65)
    expect(result.reply).toContain('Ana')
  })

  it('does not greet the learner twice when no name is given', () => {
    const result = answerOffline('paano ang OTP', capsule101)
    expect(result.reply.startsWith('Kabsat Kabsat')).toBe(false)
    expect(result.reply.startsWith('Kabsat —')).toBe(true)
  })

  it('answers in English when the question is in English', () => {
    const result = answerOffline('What should I do if someone asks for my OTP?', capsule101)

    expect(result.lang).toBe('en')
    expect(result.reply).toContain('Kabsat here')
    expect(result.reply).toContain('one-time password')
  })

  it('answers in Tagalog when the question is in Tagalog', () => {
    const result = answerOffline('Paano kung hinihingi ang OTP ko?', capsule101)

    expect(result.lang).toBe('tl')
    expect(result.reply).toContain('tungkol sa')
  })

  it('refuses in the language of the question', () => {
    const english = answerOffline('Who is the president of the Philippines', capsule101)

    expect(english.lang).toBe('en')
    expect(english.source).toBeNull()
    expect(english.reply).toContain("don't cover")
  })

  it('refuses an uncovered question instead of inventing an answer', () => {
    const result = answerOffline('sino ang presidente ng Pilipinas', capsule101)

    expect(result.source).toBeNull()
    expect(result.confidence).toBe(0)
    expect(result.reply).toContain(capsule101.title)
  })

  it('keeps answers grounded in the capsule text', () => {    const result = answerOffline('nabiktima ako ng scam, ano gagawin', capsule101)
    const chunk = capsule101.chunks.find((c) => c.id === result.matches[0].chunk.id)

    expect(result.source).not.toBeNull()
    expect(result.reply).toContain(chunk.text)
  })
})

describe('answerOnline', () => {
  it('falls back to the offline answer when no endpoint is configured', async () => {
    const result = await answerOnline('paano ang OTP', capsule101)
    expect(result.online).toBeUndefined()
    expect(result.source).not.toBeNull()
  })

  it('falls back when the endpoint throws', async () => {
    const failing = async () => {
      throw new Error('network down')
    }
    const result = await answerOnline('paano ang OTP', capsule101, {
      endpoint: 'https://example.invalid/chat',
      fetchImpl: failing,
    })

    expect(result.fellBack).toBe(true)
    expect(result.source).not.toBeNull()
  })

  it('sends the guarded system prompt when the endpoint works', async () => {
    let captured = null
    const fakeFetch = async (_url, options) => {
      captured = JSON.parse(options.body)
      return { ok: true, json: async () => ({ reply: 'Mula sa CONTEXT: huwag ibigay ang OTP.' }) }
    }

    const result = await answerOnline('paano ang OTP', capsule101, {
      endpoint: 'https://example.test/chat',
      fetchImpl: fakeFetch,
    })

    expect(captured.system).toContain('Taglish')
    expect(captured.messages[0].content).toContain('CONTEXT:')
    expect(result.online).toBe(true)
  })
})
