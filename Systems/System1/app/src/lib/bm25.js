const STOPWORDS = new Set([
  'ang', 'ng', 'sa', 'na', 'ay', 'at', 'ko', 'mo', 'ka', 'si', 'ni', 'ito', 'iyan',
  'ano', 'paano', 'bakit', 'saan', 'kung', 'may', 'mga', 'para', 'the', 'a', 'an',
  'is', 'are', 'to', 'of', 'and', 'in', 'on', 'it', 'my', 'me', 'do', 'how', 'what',
])

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token))
}

const SYNONYMS = {
  otp: ['code', 'pin', 'password', 'one', 'time', 'verification'],
  code: ['otp', 'pin'],
  pin: ['otp', 'password', 'code'],
  password: ['pin', 'otp'],
  link: ['website', 'domain', 'url', 'click'],
  website: ['link', 'domain'],
  domain: ['link', 'website'],
  scam: ['peke', 'fake', 'biktima', 'panloloko'],
  peke: ['scam', 'fake'],
  fake: ['scam', 'peke'],
  pera: ['money', 'bayad', 'padala', 'wallet'],
  money: ['pera', 'bayad'],
  bayad: ['fee', 'payment', 'pera'],
  fee: ['bayad', 'payment'],
  trabaho: ['job', 'work', 'employer', 'client'],
  job: ['trabaho', 'work', 'employer'],
  work: ['trabaho', 'job'],
  employer: ['job', 'client', 'trabaho'],
  ayuda: ['dswd', 'tulong', 'benefit'],
  dswd: ['ayuda', 'tulong'],
  sim: ['signal', 'network', 'swap'],
  refund: ['ibalik', 'screenshot', 'padala'],
  id: ['identity', 'litrato', 'account'],
}

function expand(tokens) {
  const out = new Set(tokens)
  for (const token of tokens) {
    for (const synonym of SYNONYMS[token] ?? []) out.add(synonym)
  }
  return [...out]
}

/**
 * Build a BM25 index over capsule chunks. Chunk keywords are indexed too, so
 * a short keyword list can outrank incidental body text.
 */
export function buildIndex(chunks) {
  const docs = chunks.map((chunk) => {
    const tokens = tokenize(`${chunk.text} ${(chunk.keywords ?? []).join(' ')} ${chunk.concept ?? ''}`)
    const termFreq = new Map()
    for (const token of tokens) termFreq.set(token, (termFreq.get(token) ?? 0) + 1)
    return { chunk, termFreq, length: tokens.length }
  })

  const docFreq = new Map()
  for (const doc of docs) {
    for (const term of doc.termFreq.keys()) docFreq.set(term, (docFreq.get(term) ?? 0) + 1)
  }

  const avgLength = docs.reduce((sum, doc) => sum + doc.length, 0) / (docs.length || 1)

  return { docs, docFreq, avgLength: avgLength || 1, total: docs.length }
}

const K1 = 1.5
const B = 0.75

export function retrieve(index, query, k = 3) {
  const queryTokens = expand(tokenize(query))
  if (queryTokens.length === 0) return []

  const results = index.docs.map((doc) => {
    let score = 0
    for (const token of queryTokens) {
      const tf = doc.termFreq.get(token) ?? 0
      if (tf === 0) continue
      const df = index.docFreq.get(token) ?? 0
      const idf = Math.log(1 + (index.total - df + 0.5) / (df + 0.5))
      score += idf * ((tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * doc.length) / index.avgLength)))
    }
    return { chunk: doc.chunk, score }
  })

  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}
