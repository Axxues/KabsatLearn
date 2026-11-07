import { beforeEach, describe, expect, test } from 'vitest'
import {
  clearCourseProgress,
  getCompetencyCourseProgress,
  getCoursePage,
  getCourseProgress,
  markCourseCompleted,
  saveCoursePage,
} from './courseProgress.js'

describe('courseProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('getCoursePage returns 0 when nothing is stored', () => {
    expect(getCoursePage('capsule-101', 5)).toBe(0)
  })

  test('saveCoursePage stores the page index and updates max page in localStorage', () => {
    saveCoursePage('capsule-101', 2)
    expect(localStorage.getItem('kabsat_course_page_capsule-101')).toBe('2')
    expect(localStorage.getItem('kabsat_course_max_page_capsule-101')).toBe('2')

    // Going back to page 1 should not decrement max page
    saveCoursePage('capsule-101', 1)
    expect(localStorage.getItem('kabsat_course_page_capsule-101')).toBe('1')
    expect(localStorage.getItem('kabsat_course_max_page_capsule-101')).toBe('2')
  })

  test('getCoursePage returns the stored page index', () => {
    saveCoursePage('capsule-101', 3)
    expect(getCoursePage('capsule-101', 5)).toBe(3)
  })

  test('getCoursePage bounds checks: returns 0 if stored index is negative or >= totalCards', () => {
    localStorage.setItem('kabsat_course_page_capsule-101', '-1')
    expect(getCoursePage('capsule-101', 5)).toBe(0)

    localStorage.setItem('kabsat_course_page_capsule-101', '5')
    expect(getCoursePage('capsule-101', 5)).toBe(0)

    localStorage.setItem('kabsat_course_page_capsule-101', '10')
    expect(getCoursePage('capsule-101', 5)).toBe(0)

    localStorage.setItem('kabsat_course_page_capsule-101', 'invalid')
    expect(getCoursePage('capsule-101', 5)).toBe(0)
  })

  test('clearCourseProgress resets progress and clears all keys', () => {
    saveCoursePage('capsule-101', 3)
    markCourseCompleted('capsule-101')
    clearCourseProgress('capsule-101')
    expect(getCoursePage('capsule-101', 5)).toBe(0)
    expect(localStorage.getItem('kabsat_course_page_capsule-101')).toBeNull()
    expect(localStorage.getItem('kabsat_course_completed_capsule-101')).toBeNull()
    expect(localStorage.getItem('kabsat_course_max_page_capsule-101')).toBeNull()
    expect(getCourseProgress('capsule-101', 5)).toEqual({
      page: 0,
      maxPage: 0,
      completed: false,
      percent: 0,
    })
  })

  test('different course IDs store progress independently', () => {
    saveCoursePage('capsule-101', 2)
    saveCoursePage('capsule-102', 4)
    expect(getCoursePage('capsule-101', 5)).toBe(2)
    expect(getCoursePage('capsule-102', 6)).toBe(4)
  })

  test('markCourseCompleted sets completed flag and resets bookmark to 0', () => {
    saveCoursePage('capsule-101', 4)
    markCourseCompleted('capsule-101')

    expect(localStorage.getItem('kabsat_course_completed_capsule-101')).toBe('true')
    expect(localStorage.getItem('kabsat_course_page_capsule-101')).toBe('0')
    expect(getCoursePage('capsule-101', 6)).toBe(0)
  })

  test('getCourseProgress returns 0 when no progress exists', () => {
    const prog = getCourseProgress('capsule-101', 6)
    expect(prog).toEqual({
      page: 0,
      maxPage: 0,
      completed: false,
      percent: 0,
    })
  })

  test('getCourseProgress computes percent based on max cards seen', () => {
    // Navigated to page 2 (3 cards seen out of 6 -> 50%)
    saveCoursePage('capsule-101', 2, 6)
    const prog = getCourseProgress('capsule-101', 6)
    expect(prog).toEqual({
      page: 2,
      maxPage: 2,
      completed: false,
      percent: 50,
    })
  })

  test('getCourseProgress returns 100% when marked completed', () => {
    markCourseCompleted('capsule-101')
    const prog = getCourseProgress('capsule-101', 6)
    expect(prog).toEqual({
      page: 0,
      maxPage: 5,
      completed: true,
      percent: 100,
    })
  })

  test('getCompetencyCourseProgress returns null if no installed capsule covers competency', () => {
    expect(getCompetencyCourseProgress('disaster_ready', [{ id: 'capsule-101', installed: true }])).toBeNull()
    expect(getCompetencyCourseProgress('cyber_safety', [])).toBeNull()
  })

  test('getCompetencyCourseProgress returns average percent and hasActivity for matching capsules', () => {
    // Capsule 101 teaches cyber_safety and financial_literacy
    const installed = [{ id: 'capsule-101', installed: true }]

    // Initially no activity
    const initial = getCompetencyCourseProgress('cyber_safety', installed)
    expect(initial).toEqual({ percent: 0, hasActivity: false })

    // When completed
    markCourseCompleted('capsule-101')
    const completed = getCompetencyCourseProgress('cyber_safety', installed)
    expect(completed).toEqual({ percent: 100, hasActivity: true })
  })
})
