import { beforeEach, describe, expect, it } from 'vitest'
import capsule101 from '../data/capsules/capsule-101.json'
import { db, seedCapsule } from './capsuleStore.js'
import { capsuleFile, importCapsuleFile } from './share.js'

beforeEach(async () => {
  await db.capsules.clear()
  await seedCapsule(JSON.parse(JSON.stringify(capsule101)))
})

describe('capsuleFile', () => {
  it('produces a .kabsat file that carries a hash', async () => {
    const file = await capsuleFile('capsule-101')
    expect(file.name).toBe('capsule-101.kabsat')

    const parsed = JSON.parse(await file.text())
    expect(typeof parsed.hash).toBe('string')
    expect(parsed.hash).toHaveLength(64)
  })

  it('throws for a capsule that is not installed', async () => {
    await expect(capsuleFile('capsule-999')).rejects.toThrow(/not found/)
  })
})

describe('importCapsuleFile', () => {
  it('round-trips a shared capsule into a fresh device', async () => {
    const file = await capsuleFile('capsule-101')
    await db.capsules.clear()

    const result = await importCapsuleFile(file)
    expect(result).toEqual({ ok: true, id: 'capsule-101' })
  })

  it('refuses a file altered in transit', async () => {
    const file = await capsuleFile('capsule-101')
    const parsed = JSON.parse(await file.text())
    const tampered = new File([JSON.stringify({ ...parsed, title: 'Hacked' })], 'x.kabsat')

    const result = await importCapsuleFile(tampered)
    expect(result).toEqual({ ok: false, error: 'integrity' })
  })
})
