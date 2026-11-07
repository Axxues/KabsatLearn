import { buildIndex, retrieve } from './bm25.js'

const indexCache = new WeakMap()

function indexFor(capsule) {
  if (!indexCache.has(capsule)) indexCache.set(capsule, buildIndex(capsule.chunks))
  return indexCache.get(capsule)
}

const THRESHOLD = 1.2

export const SYSTEM_PROMPT =
  'You are Kabsat, a tutor for out-of-school youth in San Fernando, La Union. ' +
  'Answer only from CONTEXT. If CONTEXT does not contain the answer, say you do not know ' +
  'and name a capsule to download. Reply in simple Taglish, at most 60 words. ' +
  'Never give medical, legal, or financial advice beyond the CONTEXT.'

function refusal(capsule) {
  return (
    `Kabsat, hindi ko pa sakop ang tanong na iyan. ` +
    `Subukan ang mga aralin sa "${capsule.title}" o mag-download ng panibagong capsule.`
  )
}

/**
 * Offline generation: compose a grounded answer from the best chunk.
 * No invention. Refuses when the retrieval score is below threshold.
 */
export function answerOffline(query, capsule, { name = 'Kabsat', threshold = THRESHOLD } = {}) {
  const results = retrieve(indexFor(capsule), query, 3)
  const top = results[0]

  if (!top || top.score < threshold) {
    return { reply: refusal(capsule), source: null, confidence: 0, matches: results }
  }

  const confidence = Math.min(98, Math.round(60 + top.score * 6))
  const reply = `Kabsat ${name}, tungkol sa ${top.chunk.concept}: ${top.chunk.text}`

  return {
    reply,
    source: { id: top.chunk.source_id, concept: top.chunk.concept, capsule: capsule.title },
    confidence,
    matches: results,
  }
}

export async function answerOnline(query, capsule, { endpoint, fetchImpl = fetch } = {}) {
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
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION: ${query}` }],
      }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    const reply = data.reply ?? data.content ?? ''
    if (!reply) throw new Error('empty reply')
    return { reply, source: results[0].chunk.source_id, confidence: 80, online: true }
  } catch {
    return { ...answerOffline(query, capsule), fellBack: true }
  }
}
