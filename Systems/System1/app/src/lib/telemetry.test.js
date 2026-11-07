import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from './capsuleStore.js'
import { masteryByCompetency, proposedRemediations } from './mastery.js'
import { clearQueue, flush, queueEvent, queueSize } from './telemetry.js'
import { markCourseCompleted, saveCoursePage } from './courseProgress.js'

beforeEach(async () => {
  localStorage.clear()
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

  it('combines 50% course progress and 50% quiz score', () => {
    // 2/3 correct quiz = 67%
    // Course completed = 100%
    markCourseCompleted('capsule-101')
    const installed = [{ id: 'capsule-101', installed: true }]
    const rows = masteryByCompetency(events, null, installed)
    const safety = rows.find((row) => row.competency === 'cyber_safety')

    // 100 * 0.5 + 67 * 0.5 = 50 + 33.5 = 84 (Math.round(83.5) = 84)
    expect(safety.courseProgress).toBe(100)
    expect(safety.quizMastery).toBe(67)
    expect(safety.mastery).toBe(84)
  })

  it('uses course progress alone when there are no quiz attempts', () => {
    // Capsule 101 also teaches financial_literacy, with 0 quiz attempts in events
    markCourseCompleted('capsule-101')
    const installed = [{ id: 'capsule-101', installed: true }]
    const rows = masteryByCompetency(events, null, installed)
    const fin = rows.find((row) => row.competency === 'financial_literacy')

    expect(fin.attempts).toBe(0)
    expect(fin.quizMastery).toBeNull()
    expect(fin.courseProgress).toBe(100)
    expect(fin.mastery).toBe(100)
  })

  it('formats remediation reason for course progress when attempts are 0', () => {
    // Navigated to page 1 out of 6 -> cardsSeen 2/6 = 33%
    saveCoursePage('capsule-101', 1, 6)
    const installed = [{ id: 'capsule-101', installed: true }]
    const proposed = proposedRemediations(events, 60, null, installed)
    const fin = proposed.find((row) => row.competency === 'financial_literacy')

    expect(fin).toBeDefined()
    expect(fin.mastery).toBe(33)
    expect(fin.reason).toBe('Financial literacy course progress at 33%')
  })
})
