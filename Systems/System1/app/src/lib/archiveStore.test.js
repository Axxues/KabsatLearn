import { beforeEach, describe, expect, it } from 'vitest'
import {
  archiveCourse,
  getArchivedCourseIds,
  isCourseArchived,
  unarchiveCourse,
} from './archiveStore'

describe('archiveStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns empty array when nothing is stored', () => {
    expect(getArchivedCourseIds()).toEqual([])
    expect(isCourseArchived('kabsat-101')).toBe(false)
  })

  it('archives a course and prevents duplicates', () => {
    archiveCourse('kabsat-101')
    expect(getArchivedCourseIds()).toEqual(['kabsat-101'])
    expect(isCourseArchived('kabsat-101')).toBe(true)

    archiveCourse('kabsat-101')
    expect(getArchivedCourseIds()).toEqual(['kabsat-101'])

    archiveCourse('kabsat-102')
    expect(getArchivedCourseIds()).toEqual(['kabsat-101', 'kabsat-102'])
  })

  it('unarchives a course', () => {
    archiveCourse('kabsat-101')
    archiveCourse('kabsat-102')
    unarchiveCourse('kabsat-101')
    expect(getArchivedCourseIds()).toEqual(['kabsat-102'])
    expect(isCourseArchived('kabsat-101')).toBe(false)
    expect(isCourseArchived('kabsat-102')).toBe(true)
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('kabsat_archived_courses', 'invalid{json')
    expect(getArchivedCourseIds()).toEqual([])
  })
})
