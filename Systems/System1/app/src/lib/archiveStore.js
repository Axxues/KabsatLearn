const STORAGE_KEY = 'kabsat_archived_courses'

export function getArchivedCourseIds() {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isCourseArchived(id) {
  if (!id) return false
  const ids = getArchivedCourseIds()
  return ids.includes(id)
}

export function archiveCourse(id) {
  if (!id) return getArchivedCourseIds()
  const ids = getArchivedCourseIds()
  if (!ids.includes(id)) {
    const next = [...ids, id]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable or quota exceeded
    }
    return next
  }
  return ids
}

export function unarchiveCourse(id) {
  if (!id) return getArchivedCourseIds()
  const ids = getArchivedCourseIds()
  const next = ids.filter((existing) => existing !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable
  }
  return next
}
