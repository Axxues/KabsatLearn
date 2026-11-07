# Task 13 Brief: Course Progress Integration in Mastery by Competency & Dashboard

## Context
When learners read courses in `StoryReader.jsx`, their reading progress is saved locally via `courseProgress.js`. However, previously:
1. "Mastery by Competency" on the Insights Dashboard (`Dashboard.jsx` and `mastery.js`) calculated mastery ONLY from `event.type === 'answer'` telemetry records from the Quiz Arena.
2. If a learner read 100% of a course (e.g. `capsule-101` which teaches `cyber_safety` and `financial_literacy`), but had not taken a quiz, the dashboard displayed `—` (empty). If they took a quiz and got 0 correct, it showed `0% Needs Help`, completely ignoring that they studied the course.
3. In `StoryReader.jsx`, clicking "Finish Course" called `clearCourseProgress`, which wiped the progress back to `0`, making finished courses appear as 0% progress.
4. There was no course completion event queued or persistent record of course completion.

## Goal
Integrate course reading and completion progress into `courseProgress.js`, `StoryReader.jsx`, `mastery.js`, and `Dashboard.jsx` so that the "Mastery by Competency" section reflects actual course reading progress and completion alongside quiz performance.

---

## Detailed Requirements

### 1. `Systems/System1/app/src/lib/courseProgress.js`
- Keep existing APIs backward-compatible:
  - `getCoursePage(capsuleId, totalCards)`: returns saved current card index (0-based) to open reader at.
  - `saveCoursePage(capsuleId, pageIndex, totalCards)`:
    - Stores `kabsat_course_page_${capsuleId}` = `String(pageIndex)`.
    - Updates `kabsat_course_max_page_${capsuleId}` to `Math.max(currentMax, pageIndex)`.
  - `clearCourseProgress(capsuleId)`: clears `kabsat_course_page_${capsuleId}`, `kabsat_course_completed_${capsuleId}`, and `kabsat_course_max_page_${capsuleId}`.
- Add new exports:
  - `markCourseCompleted(capsuleId)`:
    - Sets `kabsat_course_completed_${capsuleId}` to `'true'`.
    - Resets bookmark `kabsat_course_page_${capsuleId}` to `'0'` (so subsequent review opens at lesson 1, while preserving `completed` status).
  - `getCourseProgress(capsuleId, totalCards = 6)`:
    - Returns `{ page: number, maxPage: number, completed: boolean, percent: number }`.
    - If `localStorage.getItem('kabsat_course_completed_' + capsuleId) === 'true'`:
      Returns `{ page: 0, maxPage: (totalCards || 6) - 1, completed: true, percent: 100 }`.
    - If no progress keys exist in `localStorage` for this capsule:
      Returns `{ page: 0, maxPage: 0, completed: false, percent: 0 }`.
    - Otherwise:
      `cardsSeen = Math.min(totalCards, Math.max(1, maxPage + 1))`
      `percent = Math.min(100, Math.round((cardsSeen / totalCards) * 100))`
      Returns `{ page, maxPage, completed: false, percent }`.
  - `getCompetencyCourseProgress(competency, installedCapsules = [])`:
    - Filters `installedCapsules` to those that teach `competency`:
      (using `CAPSULE_BY_ID[c.id] || c` to access full capsule metadata: `Array.isArray(full.competency) ? full.competency.includes(competency) : full.competency === competency`).
    - If no installed capsule covers `competency`, returns `null`.
    - For matching capsules, computes average progress percent:
      `sumPercent = sum of getCourseProgress(c.id, full.cards?.length || 6).percent`
      `hasActivity = true if any matching capsule has percent > 0 or completed === true`
      Returns `{ percent: Math.round(sumPercent / matching.length), hasActivity }`.

### 2. `Systems/System1/app/src/ui/StoryReader.jsx`
- Import `markCourseCompleted` from `../lib/courseProgress.js`.
- Import `queueEvent` from `../lib/telemetry.js`.
- In `handleFinish`:
  - Call `markCourseCompleted(capsule?.id)`.
  - Call `queueEvent({ type: 'course_completed', capsuleId: capsule.id, competency: capsule.competency })`.
  - Call `onExit()`.
- On `goToPage(nextIndex)`:
  - Pass `totalCards` to `saveCoursePage(capsule?.id, clamped, totalCards)`.

### 3. `Systems/System1/app/src/lib/mastery.js`
- Import `getCompetencyCourseProgress` from `./courseProgress.js`.
- Update `masteryByCompetency(events, activeCompetencies = null, installedCapsules = [])`:
  - Calculate `quizScore = bucket.attempts === 0 ? null : Math.round((bucket.correct / bucket.attempts) * 100)`.
  - Look up course reading progress: `const courseProg = getCompetencyCourseProgress(competency, installedCapsules)`.
  - Calculate mastery:
    - If `bucket.attempts > 0 && courseProg?.hasActivity`:
      // Combine 50% course reading progress + 50% quiz score
      `mastery = Math.round(courseProg.percent * 0.5 + quizScore * 0.5)`
    - Else if `bucket.attempts > 0`:
      `mastery = quizScore`
    - Else if `courseProg?.hasActivity`:
      `mastery = courseProg.percent`
    - Else:
      `mastery = null`
  - Return each item as:
    ```javascript
    {
      competency,
      label: COMPETENCY_LABELS[competency],
      attempts: bucket.attempts,
      correct: bucket.correct,
      quizMastery: quizScore,
      courseProgress: courseProg?.hasActivity ? courseProg.percent : null,
      mastery,
    }
    ```
- Update `proposedRemediations(events, threshold = 60, activeCompetencies = null, installedCapsules = [])`:
  - Pass `installedCapsules` to `masteryByCompetency(events, activeCompetencies, installedCapsules)`.
  - For reason string:
    `row.attempts > 0 ? `${row.label} mastery at ${row.mastery}% across ${row.attempts} answers` : `${row.label} course progress at ${row.mastery}%``

### 4. `Systems/System1/app/src/ui/Dashboard.jsx`
- Pass `installedList` into `masteryByCompetency(events, activeCompetencies, installedList)`.
- Pass `installedList` into `proposedRemediations(events, 60, activeCompetencies, installedList)`.
- Update `Bar` component to accept `{ label, value, courseProgress, quizMastery }`:
  - Display detail breakdown subtitle when `courseProgress !== null` or `quizMastery !== null`:
    - Both: `${t('courseProgressLabel')}: ${courseProgress}% · ${t('quizScoreLabel')}: ${quizMastery}%`
    - Course only: `${t('courseProgressLabel')}: ${courseProgress}%`
    - Quiz only: `${t('quizScoreLabel')}: ${quizMastery}%`
    - Use `text-[10px] text-[var(--color-muted)] font-medium mt-0.5`.
  - Progress bar width: `value === null ? 0 : Math.max(4, value)`.
  - Level badge:
    - `isHigh` (`value >= 70`): `t('masteryHigh')` ('Strong' / 'Matatag')
    - `isMid` (`value >= 50 && value < 70`): `t('masteryMid')` ('Moderate' / 'Katamtaman')
    - `isLow` (`value < 50`): `t('masteryLow')` ('Needs Help' / 'Gabayan')

### 5. `Systems/System1/app/src/lib/i18n.jsx`
- Add to Filipino dictionary (`fil`):
  - `courseProgressLabel`: `'Kurso'`
  - `quizScoreLabel`: `'Pagsusulit'`
- Add to English dictionary (`en`):
  - `courseProgressLabel`: `'Course'`
  - `quizScoreLabel`: `'Quiz'`
- Ensure NO emojis in strings or anywhere.

### 6. Tests & Acceptance Criteria
- Run `npx vitest run` in `Systems/System1/app`.
- In `courseProgress.test.js`:
  - Test `markCourseCompleted` and `getCourseProgress`.
  - Test `getCompetencyCourseProgress` returns correct average percent and `hasActivity`.
- In `StoryReader.test.jsx`:
  - Test that clicking "Finish Course" marks the course completed and logs `course_completed` event.
- In `Dashboard.test.jsx`:
  - Test that course reading progress alone shows percentage in Mastery by Competency even with 0 quiz attempts (e.g. 100% or 50% instead of `—`).
  - Test that course progress and quiz answers combine properly (e.g. 100% course + 0% quiz -> 50% mastery).
  - Test that existing telemetry-only test still passes (50% with 1/2 correct and no course progress).
- Run `npx oxlint` to ensure 0 lint errors.
- Run `npx vite build` to ensure clean build.
- Write full report to `task-13-report.md`.
