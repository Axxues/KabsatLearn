import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './capsuleStore.js'
import { masteryByCompetency, proposedRemediations } from './mastery.js'
import { clearQueue, flush, queueEvent, queueSize } from './telemetry.js'

beforeEach(async () => {
  await db.telemetry.clear()
})

describe('telemetry queue', () => {
  it('flushes an empty queue without throwing', async () => {
    await expect(flush()).resolves.toEqual({ sent: 0, failed: 0, simulated: true })
  })

  it('queues answers and flushes them to an endpoint', async () => {
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: true })
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: false })
    expect(await queueSize()).toBe(2)

    const fakeFetch = vi.fn(async () => ({ ok: true }))
    const result = await flush({ endpoint: 'https://example.test/telemetry', fetchImpl: fakeFetch })

    expect(result).toEqual({ sent: 2, failed: 0, simulated: false })
    expect(fakeFetch).toHaveBeenCalledTimes(1)
    expect(await queueSize()).toBe(0)
  })

  it('keeps the queue when the flush fails', async () => {
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: true })
    const failing = async () => ({ ok: false, status: 503 })

    const result = await flush({ endpoint: 'https://example.test/telemetry', fetchImpl: failing })

    expect(result).toEqual({ sent: 0, failed: 1, simulated: false })
    expect(await queueSize()).toBe(1)
    await clearQueue()
  })

  it('stores only a pseudonymous learner id', async () => {
    await queueEvent({ type: 'answer', competency: 'cyber_safety', correct: true })
    const [event] = await db.telemetry.toArray()
    expect(event.learnerId).toMatch(/^K-\d{4}$/)
  })
})

describe('mastery', () => {
  const events = [
    { type: 'answer', competency: 'cyber_safety', correct: true },
    { type: 'answer', competency: 'cyber_safety', correct: true },
    { type: 'answer', competency: 'cyber_safety', correct: false },
    { type: 'answer', competency: 'digital_livelihood', correct: false },
    { type: 'answer', competency: 'digital_livelihood', correct: false },
  ]

  it('computes mastery per competency', () => {
    const rows = masteryByCompetency(events)
    const safety = rows.find((row) => row.competency === 'cyber_safety')
    expect(safety.mastery).toBe(67)
    expect(safety.attempts).toBe(3)
  })

  it('reports null mastery for untouched competencies', () => {
    const rows = masteryByCompetency(events)
    const disaster = rows.find((row) => row.competency === 'disaster_ready')
    expect(disaster.mastery).toBeNull()
  })

  it('proposes remediation only below the threshold, weakest first', () => {
    const proposed = proposedRemediations(events)
    expect(proposed.map((row) => row.competency)).toEqual(['digital_livelihood'])
  })
})
