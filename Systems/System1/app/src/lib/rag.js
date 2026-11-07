import { buildIndex, retrieve } from './bm25.js'
import { detectLanguage, matchesLanguage } from './lang.js'
import translations from '../data/translations/en.json'

const indexCache = new WeakMap()

function indexFor(capsule) {
  if (!indexCache.has(capsule)) indexCache.set(capsule, buildIndex(capsule.chunks))
  return indexCache.get(capsule)
}

export const THRESHOLD = 1.2

export function systemPrompt(language) {
  const replyLanguage =
    language === 'en'
      ? 'Reply in simple English, at most 60 words.'
      : 'Reply in simple Taglish, at most 60 words.'

  return (
    'You are Kabsat, a tutor for out-of-school youth in San Fernando, La Union. ' +
    'Answer only from CONTEXT. If CONTEXT does not contain the answer, say you do not know ' +
    'and name a capsule to download. ' +
    replyLanguage +
    ' Never give medical, legal, or financial advice beyond the CONTEXT. ' +
    'Use the CONTEXT wording for key terms instead of translating them.'
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
export function answerOffline(query, capsule, { name = '', threshold = THRESHOLD } = {}) {
  const asked = detectLanguage(query)
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
