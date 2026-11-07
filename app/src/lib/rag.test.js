import { describe, expect, it } from 'vitest'
import capsule101 from '../data/capsules/capsule-101.json'
import { answerOffline, answerOnline, SYSTEM_PROMPT } from './rag.js'

describe('answerOffline', () => {
  it('answers a covered question with a cited source', () => {
    const result = answerOffline('paano kung hinihingi ang OTP ko', capsule101, { name: 'Ana' })

    expect(result.source).not.toBeNull()
    expect(result.source.capsule).toBe(capsule101.title)
    expect(result.confidence).toBeGreaterThanOrEqual(65)
    expect(result.reply).toContain('Ana')
  })

  it('refuses an uncovered question instead of inventing an answer', () => {
    const result = answerOffline('sino ang presidente ng Pilipinas', capsule101)

    expect(result.source).toBeNull()
    expect(result.confidence).toBe(0)
    expect(result.reply).toContain(capsule101.title)
  })

  it('keeps answers grounded in the capsule text', () => {
    const result = answerOffline('nabiktima ako ng scam, ano gagawin', capsule101)
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

    expect(captured.system).toBe(SYSTEM_PROMPT)
    expect(captured.messages[0].content).toContain('CONTEXT:')
    expect(result.online).toBe(true)
  })
})
