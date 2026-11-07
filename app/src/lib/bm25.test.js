import { describe, expect, it } from 'vitest'
import capsule101 from '../data/capsules/capsule-101.json'
import { buildIndex, retrieve, tokenize } from './bm25.js'

const index = buildIndex(capsule101.chunks)

describe('tokenize', () => {
  it('lowercases and strips punctuation', () => {
    expect(tokenize('OTP, please!')).toEqual(['otp', 'please'])
  })

  it('drops stopwords', () => {
    expect(tokenize('ano ang otp ko')).toEqual(['otp'])
  })
})

describe('retrieve', () => {
  it('ranks the OTP chunk first for an OTP question', () => {
    const results = retrieve(index, 'paano kung hinihingi ang OTP ko')
    expect(results[0].chunk.id).toBe('k1')
  })

  it('expands synonyms so "code" reaches the OTP chunk', () => {
    const results = retrieve(index, 'may humingi ng code')
    expect(results[0].chunk.id).toBe('k1')
  })

  it('finds the ayuda chunk for a DSWD question', () => {
    const results = retrieve(index, 'totoo ba ang ayuda ng dswd')
    expect(results[0].chunk.id).toBe('k3')
  })

  it('returns nothing for an unrelated query', () => {
    const results = retrieve(index, 'quantum chromodynamics')
    expect(results).toEqual([])
  })

  it('never returns more than k results', () => {
    const results = retrieve(index, 'otp code pin scam link pera', 2)
    expect(results.length).toBeLessThanOrEqual(2)
  })
})
