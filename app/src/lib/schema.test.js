import { describe, expect, it } from 'vitest'
import { canonicalJson, validateCapsule } from './schema.js'
import capsule101 from '../data/capsules/capsule-101.json'
import capsule102 from '../data/capsules/capsule-102.json'

describe('validateCapsule', () => {
  it('accepts both shipped capsules', () => {
    expect(validateCapsule(capsule101)).toEqual({ ok: true, errors: [] })
    expect(validateCapsule(capsule102)).toEqual({ ok: true, errors: [] })
  })

  it('rejects a capsule with no questions', () => {
    const broken = { ...capsule101, questions: [] }
    const result = validateCapsule(broken)
    expect(result.ok).toBe(false)
    expect(result.errors.join(' ')).toMatch(/questions/)
  })

  it('rejects a question with three options', () => {
    const broken = {
      ...capsule101,
      questions: [{ ...capsule101.questions[0], options: ['a', 'b', 'c'] }],
    }
    const result = validateCapsule(broken)
    expect(result.ok).toBe(false)
    expect(result.errors.join(' ')).toMatch(/exactly 4/)
  })

  it('rejects an unknown band', () => {
    const broken = {
      ...capsule101,
      questions: [{ ...capsule101.questions[0], band: 'impossible' }],
    }
    expect(validateCapsule(broken).ok).toBe(false)
  })

  it('rejects a version mismatch', () => {
    expect(validateCapsule({ ...capsule101, version: 99 }).ok).toBe(false)
  })
})

describe('canonicalJson', () => {
  it('produces the same string regardless of key order', () => {
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }))
  })

  it('keeps array order significant', () => {
    expect(canonicalJson([1, 2])).not.toBe(canonicalJson([2, 1]))
  })
})
