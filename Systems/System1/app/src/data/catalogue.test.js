import { describe, expect, test } from 'vitest'
import { CATALOG, CAPSULES, CAPSULE_BY_ID, SEEDED_IDS } from './catalogue.js'
import { BANDS, COMPETENCIES, validateCapsule } from '../lib/schema.js'
import translations from './translations/en.json'

const ORDERED_IDS = [
  'capsule-101',
  'capsule-102',
  'capsule-103',
  'capsule-104',
  'capsule-105',
  'capsule-106',
]
const NEW_IDS = ['capsule-103', 'capsule-104', 'capsule-105', 'capsule-106']
const BAND_COUNTS = { foundational: 4, core: 3, stretch: 3 }

const byId = (id) => CAPSULES.find((capsule) => capsule.id === id)

describe('course catalogue', () => {
  test('lists the shipped capsules in order', () => {
    expect(CAPSULES.map((capsule) => capsule.id)).toEqual(ORDERED_IDS)
  })

  test('catalog summary carries id plus category, code and tone for every course', () => {
    expect(CATALOG).toHaveLength(6)
    expect(CATALOG.map((entry) => entry.id)).toEqual(ORDERED_IDS)
    for (const entry of CATALOG) {
      expect(typeof entry.category).toBe('string')
      expect(entry.category.length).toBeGreaterThan(0)
      expect(typeof entry.code).toBe('string')
      expect(entry.code.length).toBeGreaterThan(0)
      expect(['safety', 'work', 'family', 'business']).toContain(entry.tone)
    }
  })

  test('every capsule is reachable by id', () => {
    for (const capsule of CAPSULES) {
      expect(CAPSULE_BY_ID[capsule.id]).toBe(capsule)
    }
  })

  test('only capsule 101 is seeded', () => {
    expect(SEEDED_IDS).toEqual(['capsule-101'])
  })

  test('every seeded id exists in the capsule index', () => {
    for (const id of SEEDED_IDS) {
      expect(CAPSULE_BY_ID[id], id).toBeTruthy()
    }
  })

  test('every capsule passes schema validation', () => {
    for (const capsule of CAPSULES) {
      const result = validateCapsule(capsule)
      expect(result.errors).toEqual([])
      expect(result.ok).toBe(true)
    }
  })

  test('new capsules ship six cards, ten questions and twelve chunks', () => {
    for (const id of NEW_IDS) {
      const capsule = byId(id)
      expect(capsule, id).toBeTruthy()
      expect(capsule.cards).toHaveLength(6)
      expect(capsule.questions).toHaveLength(10)
      expect(capsule.chunks).toHaveLength(12)
    }
  })

  test('new capsules spread questions across the three bands', () => {
    for (const id of NEW_IDS) {
      const bands = byId(id).questions.map((question) => question.band)
      for (const [band, count] of Object.entries(BAND_COUNTS)) {
        expect(bands.filter((value) => value === band).length, `${id} ${band}`).toBe(count)
      }
    }
  })

  test('new capsule chunks use known bands and four to six lowercase keywords', () => {
    for (const id of NEW_IDS) {
      for (const chunk of byId(id).chunks) {
        expect(BANDS, `${id} ${chunk.id} difficulty`).toContain(chunk.difficulty)
        expect(chunk.keywords.length, `${id} ${chunk.id} keyword count`).toBeGreaterThanOrEqual(4)
        expect(chunk.keywords.length, `${id} ${chunk.id} keyword count`).toBeLessThanOrEqual(6)
        for (const keyword of chunk.keywords) {
          expect(typeof keyword, `${id} ${chunk.id} keyword type`).toBe('string')
          if (typeof keyword !== 'string') continue
          expect(keyword, `${id} ${chunk.id} keyword must be lowercase`).toBe(keyword.toLowerCase())
        }
      }
    }
  })

  test('every question has four options, a valid answer index and a known competency', () => {
    for (const capsule of CAPSULES) {
      for (const question of capsule.questions) {
        expect(question.options, `${capsule.id} ${question.id}`).toHaveLength(4)
        expect(Number.isInteger(question.answer)).toBe(true)
        expect(question.answer).toBeGreaterThanOrEqual(0)
        expect(question.answer).toBeLessThanOrEqual(3)
        expect(COMPETENCIES).toContain(question.competency)
      }
    }
  })

  test('every chunk cites a real card and has an English translation', () => {
    for (const capsule of CAPSULES) {
      const cardIds = capsule.cards.map((card) => card.id)
      const block = translations[capsule.id]
      expect(block, capsule.id).toBeTruthy()
      for (const chunk of capsule.chunks) {
        expect(cardIds, `${capsule.id} ${chunk.id}`).toContain(chunk.source_id)
        expect(typeof block[chunk.id], `${capsule.id} ${chunk.id}`).toBe('string')
        expect(block[chunk.id].length).toBeGreaterThan(0)
      }
    }
  })

  test('competencies cover digital literacy, family planning and business operations', () => {
    expect(COMPETENCIES).toContain('digital_literacy')
    expect(COMPETENCIES).toContain('family_health')
    expect(COMPETENCIES).toContain('business_operations')
  })
})
