export const CAPSULE_VERSION = 1

export const BANDS = ['foundational', 'core', 'stretch']

export const COMPETENCIES = [
  'cyber_safety',
  'financial_literacy',
  'digital_livelihood',
  'disaster_ready',
  'digital_literacy',
  'family_health',
  'business_operations',
]

export const COMPETENCY_LABELS = {
  cyber_safety: 'Cyber safety',
  financial_literacy: 'Financial literacy',
  digital_livelihood: 'Digital livelihood',
  disaster_ready: 'Disaster readiness',
  digital_literacy: 'Digital literacy',
  family_health: 'Family planning',
  business_operations: 'Business operations',
}

/** Sort keys so two equal payloads always hash the same. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value)
}

export function validateCapsule(obj) {
  const errors = []
  const fail = (message) => errors.push(message)

  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, errors: ['capsule must be an object'] }
  }

  if (typeof obj.id !== 'string' || obj.id.length === 0) fail('id must be a non-empty string')
  if (obj.version !== CAPSULE_VERSION) fail(`version must be ${CAPSULE_VERSION}`)
  if (typeof obj.title !== 'string' || obj.title.length === 0) fail('title is required')

  if (!Array.isArray(obj.cards) || obj.cards.length === 0) {
    fail('cards must be a non-empty array')
  } else {
    obj.cards.forEach((card, i) => {
      if (!card || typeof card.id !== 'string') fail(`cards[${i}].id is required`)
      if (typeof card?.title !== 'string') fail(`cards[${i}].title is required`)
      if (typeof card?.body !== 'string') fail(`cards[${i}].body is required`)
    })
  }

  if (!Array.isArray(obj.questions) || obj.questions.length === 0) {
    fail('questions must be a non-empty array')
  } else {
    obj.questions.forEach((q, i) => {
      if (!q || typeof q.id !== 'string') fail(`questions[${i}].id is required`)
      if (!BANDS.includes(q?.band)) {
        fail(`questions[${i}].band must be one of ${BANDS.join(', ')}`)
      }
      if (typeof q?.stem !== 'string') fail(`questions[${i}].stem is required`)
      if (!Array.isArray(q?.options) || q.options.length !== 4) {
        fail(`questions[${i}].options must have exactly 4 entries`)
      }
      if (!Number.isInteger(q?.answer) || q.answer < 0 || q.answer > 3) {
        fail(`questions[${i}].answer must be an index 0-3`)
      }
      if (!COMPETENCIES.includes(q?.competency)) {
        fail(`questions[${i}].competency is not recognised`)
      }
    })
  }

  if (!Array.isArray(obj.chunks) || obj.chunks.length === 0) {
    fail('chunks must be a non-empty array')
  } else {
    obj.chunks.forEach((chunk, i) => {
      if (!chunk || typeof chunk.id !== 'string') fail(`chunks[${i}].id is required`)
      if (typeof chunk?.text !== 'string' || chunk.text.length === 0) {
        fail(`chunks[${i}].text is required`)
      }
      if (!Array.isArray(chunk?.keywords)) fail(`chunks[${i}].keywords must be an array`)
    })
  }

  return { ok: errors.length === 0, errors }
}
