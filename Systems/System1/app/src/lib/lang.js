const TAGALOG_MARKERS = new Set([
  'ang', 'ng', 'sa', 'ay', 'hindi', 'ako', 'ikaw', 'ka', 'po', 'ba', 'mga', 'ito',
  'iyan', 'yan', 'paano', 'bakit', 'ano', 'saan', 'kailan', 'sino', 'gusto', 'pwede',
  'puwede', 'may', 'wala', 'naman', 'lang', 'din', 'rin', 'yung', 'natin', 'tayo',
  'kayo', 'sila', 'siya', 'totoo', 'peke', 'pera', 'trabaho', 'ayuda', 'nabiktima',
  'gawin', 'gagawin', 'tanong', 'sagot', 'kung', 'para', 'dapat', 'pwede', 'meron',
])

const ENGLISH_MARKERS = new Set([
  'the', 'is', 'are', 'was', 'were', 'what', 'how', 'why', 'when', 'where', 'who',
  'can', 'could', 'should', 'would', 'do', 'does', 'did', 'my', 'your', 'i', 'you',
  'we', 'they', 'it', 'this', 'that', 'there', 'about', 'if', 'and', 'or', 'not',
  'have', 'has', 'need', 'want', 'tell', 'explain', 'please', 'with', 'without',
])

/**
 * Best-effort language detection for short chat messages.
 *
 * Taglish is treated as Tagalog: one Tagalog function word is enough to mean the
 * learner is speaking Filipino, because English nouns inside Tagalog are normal.
 */
export function detectLanguage(text) {
  const words = String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return 'tl'

  let tagalog = 0
  let english = 0

  for (const word of words) {
    if (TAGALOG_MARKERS.has(word)) tagalog += 1
    else if (ENGLISH_MARKERS.has(word)) english += 1
  }

  if (tagalog === 0 && english === 0) return 'tl'
  return tagalog >= english ? 'tl' : 'en'
}

/** True when `text` is in the expected language, used to reject bad LLM output. */
export function matchesLanguage(text, language) {
  return detectLanguage(text) === language
}

export const LANGUAGE_NAME = { tl: 'Tagalog', en: 'English' }
