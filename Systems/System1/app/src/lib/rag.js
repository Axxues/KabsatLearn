import { buildIndex, retrieve } from './bm25.js'
import { detectLanguage, matchesLanguage } from './lang.js'
import { matchPersona, personaAnswer } from './persona.js'
import translations from '../data/translations/en.json'

const indexCache = new WeakMap()

function indexFor(capsule) {
  if (!indexCache.has(capsule)) indexCache.set(capsule, buildIndex(capsule.chunks))
  return indexCache.get(capsule)
}

export const THRESHOLD = 1.2

export function systemPrompt(language) {
  const replyLanguage = language === 'en' ? 'English' : 'simple Taglish'
  return (
    'You are Kabsat, an offline tutor for out-of-school youth in San Fernando, La Union. ' +
    'Answer ONLY from CONTEXT. If CONTEXT lacks the answer, say you do not know. ' +
    `Reply in ${replyLanguage}, at most 45 words. Keep key terms exactly as written.`
  )
}

/** Kept for callers that expect a constant; English is the default. */
export const SYSTEM_PROMPT = systemPrompt('en')

function bodyFor(chunk, capsule, language) {
  if (language === 'tl') return { text: chunk.text, language: 'tl' }
  const translated = translations[capsule.id]?.[chunk.id]
  if (translated) return { text: translated, language: 'en' }
  // No translation available: answer in the language the source is written in
  // rather than inventing an English rendering.
  return { text: chunk.text, language: 'tl' }
}

export function normalizeForMatch(str) {
  if (typeof str !== 'string') return ''
  return str
    .toLowerCase()
    .replace(/[?!.,;:—–\-'"“”‘’()¿¡]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function matchPredefinedLesson(query, capsuleOrCapsules, language = 'tl') {
  const normalizedQuery = normalizeForMatch(query)
  if (!normalizedQuery || !capsuleOrCapsules) return null

  const capsules = Array.isArray(capsuleOrCapsules) ? capsuleOrCapsules : [capsuleOrCapsules]

  for (const capsule of capsules) {
    if (!capsule) continue

    if (Array.isArray(capsule.cards)) {
      for (const card of capsule.cards) {
        if (card?.title && normalizeForMatch(card.title) === normalizedQuery) {
          return {
            reply: `${card.body ?? ''}${card.tip ? `\n\n${language === 'en' ? 'Tip' : 'Payo'}: ${card.tip}` : ''}`,
            source: {
              concept: card.title,
              capsuleId: capsule.id,
              capsuleTitle: capsule.title,
              cardId: card.id,
            },
            confidence: 100,
            matches: [],
            lang: language,
            kind: 'predefined',
          }
        }
      }
    }

    if (Array.isArray(capsule.questions)) {
      for (const question of capsule.questions) {
        if (question?.stem && normalizeForMatch(question.stem) === normalizedQuery) {
          return {
            reply: `${language === 'en' ? 'Correct answer:' : 'Tamang sagot:'} "${question.options?.[question.answer] ?? ''}".${question.hint ? ` ${question.hint}` : ''}`,
            source: {
              concept: question.stem,
              capsuleId: capsule.id,
              capsuleTitle: capsule.title,
              questionId: question.id,
            },
            confidence: 100,
            matches: [],
            lang: language,
            kind: 'predefined',
          }
        }
      }
    }
  }

  return null
}

function refusal(capsule, language) {
  if (language === 'en') {
    return `I don't cover that yet. Try the lessons in "${capsule.title}, or download another capsule.`
  }
  return `Kabsat, hindi ko pa sakop ang tanong na iyan. Subukan ang mga aralin sa "${capsule.title}" o mag-download ng panibagong capsule.`
}

/**
 * Offline generation: compose a grounded answer from the best chunk, in the
 * language of the question. No invention. Refuses when retrieval is weak.
 */
export function answerOffline(query, capsule, { name = '', threshold = THRESHOLD, installedCapsules = [] } = {}) {
  const asked = detectLanguage(query)

  const candidateCapsules = installedCapsules && installedCapsules.length > 0 ? installedCapsules : capsule
  const predefined = matchPredefinedLesson(query, candidateCapsules, asked)
  if (predefined) {
    return predefined
  }

  // Social questions are answered directly, not treated as missing knowledge.
  const persona = matchPersona(query)
  if (persona) {
    return {
      reply: personaAnswer(persona, asked),
      source: null,
      confidence: 100,
      matches: [],
      lang: asked,
      kind: 'persona',
    }
  }

  const results = retrieve(indexFor(capsule), query, 3)
  const top = results[0]

  if (!top || top.score < threshold) {
    return {
      reply: refusal(capsule, asked),
      source: null,
      confidence: 0,
      matches: results,
      lang: asked,
    }
  }

  const body = bodyFor(top.chunk, capsule, asked)
  const confidence = Math.min(98, Math.round(60 + top.score * 6))

  const greeting = body.language === 'en' ? 'Kabsat here' : name ? `Kabsat ${name}` : 'Kabsat'
  const joiner = body.language === 'en' ? 'about' : 'tungkol sa'
  const reply = `${greeting} — ${joiner} ${top.chunk.concept}: ${body.text}`

  return {
    reply,
    source: { id: top.chunk.source_id, concept: top.chunk.concept, capsule: capsule.title },
    confidence,
    matches: results,
    lang: body.language,
  }
}

export async function answerOnline(query, capsule, { endpoint, fetchImpl = fetch } = {}) {
  const language = detectLanguage(query)
  const results = retrieve(indexFor(capsule), query, 3)
  if (!endpoint || results.length === 0) {
    return answerOffline(query, capsule)
  }

  const context = results.map((r) => r.chunk.text).join('\n---\n')

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt(language),
        messages: [{ role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION: ${query}` }],
      }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const reply = data.reply ?? data.content ?? ''
    if (!reply) throw new Error('empty reply')
    return { reply, source: results[0].chunk.source_id, confidence: 80, online: true, lang: language }
  } catch {
    return { ...answerOffline(query, capsule), fellBack: true }
  }
}

/** Reject generated text that drifted out of the question's language. */
export function guardLanguage(text, language) {
  return matchesLanguage(text, language)
}

/**
 * Retrieve the context the offline tutor should cite, already in the language of
 * the question, so the LLM is asked to compose rather than translate.
 */
export function contextFor(query, capsule, k = 2) {
  const language = detectLanguage(query)
  const results = retrieve(indexFor(capsule), query, k)
  return {
    language,
    chunks: results.map((result) => ({
      id: result.chunk.id,
      concept: result.chunk.concept,
      text: bodyFor(result.chunk, capsule, language).text,
    })),
  }
}
