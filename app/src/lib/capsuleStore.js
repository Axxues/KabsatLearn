import Dexie from 'dexie'
import { canonicalJson, validateCapsule } from './schema.js'

export const db = new Dexie('kabsatlearn')
db.version(1).stores({
  capsules: 'id',
  progress: 'learnerId',
  telemetry: '++id, learnerId, ts, type',
})

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** SHA-256 over the canonical JSON of everything except the hash field. */
export async function hashCapsule(capsule) {
  const { hash, ...rest } = capsule
  const data = new TextEncoder().encode(canonicalJson(rest))
  return toHex(await crypto.subtle.digest('SHA-256', data))
}

async function readInput(input) {
  if (typeof input === 'string') return JSON.parse(input)
  if (typeof Blob !== 'undefined' && input instanceof Blob) {
    return JSON.parse(await input.text())
  }
  return input
}

/**
 * Install a capsule that arrived from outside the app.
 * A missing hash is accepted only when requireHash is false.
 */
export async function installCapsule(input, { requireHash = true } = {}) {
  let capsule
  try {
    capsule = await readInput(input)
  } catch {
    return { ok: false, error: 'parse' }
  }

  const validation = validateCapsule(capsule)
  if (!validation.ok) {
    return { ok: false, error: 'schema', errors: validation.errors }
  }

  if (requireHash) {
    if (typeof capsule.hash !== 'string') return { ok: false, error: 'integrity' }
    const expected = await hashCapsule(capsule)
    if (expected !== capsule.hash) return { ok: false, error: 'integrity' }
  }

  const record = { ...capsule, hash: capsule.hash ?? (await hashCapsule(capsule)) }
  await db.capsules.put(record)
  return { ok: true, id: record.id }
}

/** Install a capsule that shipped with the app. */
export async function seedCapsule(capsule) {
  return installCapsule(capsule, { requireHash: false })
}

export async function listCapsules() {
  return db.capsules.toArray()
}

export async function getCapsule(id) {
  return db.capsules.get(id)
}

export async function removeCapsule(id) {
  return db.capsules.delete(id)
}

/** Serialise a capsule for sharing, with a fresh hash. */
export async function exportCapsule(id) {
  const capsule = await getCapsule(id)
  if (!capsule) return null
  const { hash, ...rest } = capsule
  const withHash = { ...rest, hash: await hashCapsule(rest) }
  return JSON.stringify(withHash, null, 2)
}
