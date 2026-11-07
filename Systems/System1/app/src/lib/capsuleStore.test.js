import { beforeEach, describe, expect, it } from 'vitest'
import capsule101 from '../data/capsules/capsule-101.json'
import {
  db,
  exportCapsule,
  getCapsule,
  hashCapsule,
  installCapsule,
  listCapsules,
  seedCapsule,
} from './capsuleStore.js'

const clone = (value) => JSON.parse(JSON.stringify(value))

beforeEach(async () => {
  await db.capsules.clear()
})

describe('capsule store', () => {
  it('installs a valid capsule and lists it', async () => {
    const result = await seedCapsule(clone(capsule101))
    expect(result).toEqual({ ok: true, id: 'capsule-101' })

    const listed = await listCapsules()
    expect(listed.map((c) => c.id)).toEqual(['capsule-101'])
  })

  it('rejects a capsule whose contents were altered after hashing', async () => {
    const base = clone(capsule101)
    const hash = await hashCapsule(base)
    const tampered = { ...base, hash, title: 'Altered title' }

    const result = await installCapsule(tampered)

    expect(result).toEqual({ ok: false, error: 'integrity' })
    expect(await getCapsule('capsule-101')).toBeUndefined()
  })

  it('accepts an untampered capsule that carries its hash', async () => {
    const base = clone(capsule101)
    const signed = { ...base, hash: await hashCapsule(base) }

    const result = await installCapsule(JSON.stringify(signed))

    expect(result).toEqual({ ok: true, id: 'capsule-101' })
  })

  it('rejects an imported capsule that has no hash', async () => {
    const result = await installCapsule(clone(capsule101))
    expect(result).toEqual({ ok: false, error: 'integrity' })
  })

  it('rejects malformed JSON without throwing', async () => {
    const result = await installCapsule('{ not json')
    expect(result).toEqual({ ok: false, error: 'parse' })
  })

  it('rejects a schema-valid-JSON but invalid capsule', async () => {
    const broken = { ...clone(capsule101), questions: [] }
    const result = await installCapsule(broken, { requireHash: false })
    expect(result.ok).toBe(false)
    expect(result.error).toBe('schema')
  })

  it('round-trips through export and import with a stable hash', async () => {
    await seedCapsule(clone(capsule101))
    const exported = await exportCapsule('capsule-101')
    await db.capsules.clear()

    const result = await installCapsule(exported)
    expect(result).toEqual({ ok: true, id: 'capsule-101' })
  })

  it('produces the same hash regardless of key order', async () => {
    const a = { ...clone(capsule101) }
    const b = Object.fromEntries(Object.entries(clone(capsule101)).reverse())
    expect(await hashCapsule(a)).toBe(await hashCapsule(b))
  })
})
