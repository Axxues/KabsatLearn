import { db } from './capsuleStore.js'

const LEARNER_KEY = 'kabsatlearn.learner'

/** Pseudonymous learner id. Never a name. */
export function getLearnerId() {
  if (typeof localStorage === 'undefined') return 'K-0000'
  let id = localStorage.getItem(LEARNER_KEY)
  if (!id) {
    id = `K-${Math.floor(1000 + Math.random() * 9000)}`
    localStorage.setItem(LEARNER_KEY, id)
  }
  return id
}

export async function queueEvent(event) {
  return db.telemetry.add({
    learnerId: getLearnerId(),
    ts: Date.now(),
    ...event,
  })
}

export async function queueSize() {
  return db.telemetry.count()
}

export async function listQueue() {
  return db.telemetry.toArray()
}

export async function clearQueue() {
  const items = await db.telemetry.toArray()
  if (items.length > 0) await db.telemetry.bulkDelete(items.map((item) => item.id))
}

/**
 * Flush queued events. With no endpoint, simulate a barangay Wi-Fi reconnect.
 * An empty queue is a no-op, never an error.
 */
export async function flush({ endpoint, fetchImpl = fetch } = {}) {
  const items = await db.telemetry.toArray()
  if (items.length === 0) return { sent: 0, failed: 0, simulated: !endpoint }

  if (!endpoint) {
    await clearQueue()
    return { sent: items.length, failed: 0, simulated: true }
  }

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: items }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    await clearQueue()
    return { sent: items.length, failed: 0, simulated: false }
  } catch {
    return { sent: 0, failed: items.length, simulated: false }
  }
}
