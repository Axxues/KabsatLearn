import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm'
import { guardLanguage, systemPrompt } from './rag.js'

/**
 * On-device generation for Kabsat AI.
 *
 * This is deliberately an enhancement layer: App shows the retrieved Tagalog or
 * English answer immediately, and the model only adds an optional explanation.
 * If the model is not downloaded, slow, or produces the wrong language, nothing
 * the learner depends on breaks.
 */
export const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'

let engine = null
let loading = null
let lastProgress = { text: '', progress: 0 }

export function engineReady() {
  return engine !== null
}

export function progressSnapshot() {
  return lastProgress
}

export async function isModelCached() {
  try {
    return await hasModelInCache(MODEL_ID)
  } catch {
    return false
  }
}

export async function loadEngine(onProgress) {
  if (engine) return engine
  if (loading) return loading

  loading = CreateMLCEngine(MODEL_ID, {
    initProgressCallback: (report) => {
      lastProgress = { text: report?.text ?? '', progress: report?.progress ?? 0 }
      onProgress?.(lastProgress)
    },
  })
    .then((created) => {
      engine = created
      return created
    })
    .finally(() => {
      loading = null
    })

  return loading
}

/**
 * Generate a short, grounded explanation. Returns the text and whether it passed
 * the language guard, so the caller can discard a bad answer.
 */
export async function explain({ query, chunks, language, onToken }) {
  const active = await loadEngine()
  const context = chunks.map((chunk) => chunk.text).join('\n---\n')

  const stream = await active.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt(language) },
      { role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION: ${query}` },
    ],
    stream: true,
    temperature: 0.2,
    max_tokens: 60,
  })

  let text = ''
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? ''
    if (delta) {
      text += delta
      onToken?.(text)
    }
  }

  return { text: text.trim(), ok: guardLanguage(text, language) }
}
