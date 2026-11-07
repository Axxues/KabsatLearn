import { CAPSULE_BY_ID } from '../data/catalogue.js'

const STORAGE_PREFIX = 'kabsat_course_page_'
const COMPLETED_PREFIX = 'kabsat_course_completed_'
const MAX_PAGE_PREFIX = 'kabsat_course_max_page_'

export function getCoursePage(capsuleId, totalCards) {
  if (typeof window === 'undefined' || !capsuleId || !window.localStorage) {
    return 0
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${capsuleId}`)
    if (raw === null || raw === undefined) {
      return 0
    }
    const parsed = parseInt(raw, 10)
    if (Number.isNaN(parsed)) {
      return 0
    }
    if (parsed < 0 || parsed >= (totalCards || 0)) {
      return 0
    }
    return parsed
  } catch {
    return 0
  }
}

export function saveCoursePage(capsuleId, pageIndex, _totalCards) {
  if (typeof window === 'undefined' || !capsuleId || !window.localStorage) {
    return
  }
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${capsuleId}`, String(pageIndex))
    const maxKey = `${MAX_PAGE_PREFIX}${capsuleId}`
    const rawMax = window.localStorage.getItem(maxKey)
    const currentMax = rawMax !== null ? parseInt(rawMax, 10) : -1
    const nextMax = Number.isNaN(currentMax) ? pageIndex : Math.max(currentMax, pageIndex)
    window.localStorage.setItem(maxKey, String(nextMax))
  } catch {
    // Ignore storage quota or security errors
  }
}

export function clearCourseProgress(capsuleId) {
  if (typeof window === 'undefined' || !capsuleId || !window.localStorage) {
    return
  }
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${capsuleId}`)
    window.localStorage.removeItem(`${COMPLETED_PREFIX}${capsuleId}`)
    window.localStorage.removeItem(`${MAX_PAGE_PREFIX}${capsuleId}`)
  } catch {
    // Ignore storage errors
  }
}

export function markCourseCompleted(capsuleId) {
  if (typeof window === 'undefined' || !capsuleId || !window.localStorage) {
    return
  }
  try {
    window.localStorage.setItem(`${COMPLETED_PREFIX}${capsuleId}`, 'true')
    window.localStorage.setItem(`${STORAGE_PREFIX}${capsuleId}`, '0')
  } catch {
    // Ignore storage errors
  }
}

export function getCourseProgress(capsuleId, totalCards = 6) {
  const cards = totalCards && totalCards > 0 ? totalCards : 6
  if (typeof window === 'undefined' || !capsuleId || !window.localStorage) {
    return { page: 0, maxPage: 0, completed: false, percent: 0 }
  }
  try {
    const isCompleted = window.localStorage.getItem(`${COMPLETED_PREFIX}${capsuleId}`) === 'true'
    if (isCompleted) {
      return { page: 0, maxPage: cards - 1, completed: true, percent: 100 }
    }

    const completedRaw = window.localStorage.getItem(`${COMPLETED_PREFIX}${capsuleId}`)
    const pageRaw = window.localStorage.getItem(`${STORAGE_PREFIX}${capsuleId}`)
    const maxRaw = window.localStorage.getItem(`${MAX_PAGE_PREFIX}${capsuleId}`)

    if (completedRaw === null && pageRaw === null && maxRaw === null) {
      return { page: 0, maxPage: 0, completed: false, percent: 0 }
    }

    const page = getCoursePage(capsuleId, cards)
    const parsedMax = maxRaw !== null ? parseInt(maxRaw, 10) : page
    const maxPage = Number.isNaN(parsedMax) ? page : parsedMax
    const cardsSeen = Math.min(cards, Math.max(1, maxPage + 1))
    const percent = Math.min(100, Math.round((cardsSeen / cards) * 100))

    return { page, maxPage, completed: false, percent }
  } catch {
    return { page: 0, maxPage: 0, completed: false, percent: 0 }
  }
}

export function getCompetencyCourseProgress(competency, installedCapsules = []) {
  if (!competency || !installedCapsules || installedCapsules.length === 0) {
    return null
  }

  const matching = installedCapsules.filter((c) => {
    if (c.installed === false) return false
    const full = CAPSULE_BY_ID[c?.id] || c
    if (!full) return false
    const comp = full.competency
    return Array.isArray(comp) ? comp.includes(competency) : comp === competency
  })

  if (matching.length === 0) {
    return null
  }

  let sumPercent = 0
  let hasActivity = false

  for (const c of matching) {
    const full = CAPSULE_BY_ID[c?.id] || c
    const totalCards = Array.isArray(full.cards) ? full.cards.length : (typeof full.cards === 'number' ? full.cards : 6)
    const prog = getCourseProgress(c.id, typeof totalCards === 'number' ? totalCards : 6)
    sumPercent += prog.percent
    if (prog.percent > 0 || prog.completed === true) {
      hasActivity = true
    }
  }

  return {
    percent: Math.round(sumPercent / matching.length),
    hasActivity,
  }
}
