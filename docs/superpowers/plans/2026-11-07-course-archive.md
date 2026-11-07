# Course Archiving & Archive Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build course archiving functionality including a header profile dropdown menu, 3-dots course card context menu, and a dedicated offline Archive Page with unarchive and read capabilities.

**Architecture:** Persist archived course IDs in localStorage via a dedicated `archiveStore` utility module. Connect the top header profile button to a popover dropdown toggle that switches between learner profile and archive views. Refactor installed cards in `CourseHub` to render a 3-dots action menu with Share and Archive actions. Exclude archived courses from the active Course Hub and Quiz Arena selector, and render a dedicated `ArchivePage` with course cards, reading progress, and unarchive actions.

**Tech Stack:** React 19, Tailwind CSS, Lucide icons, Vitest, Testing Library, Dexie DB.

**Spec:** `docs/superpowers/specs/2026-11-07-course-archive-design.md`

## Global Constraints

- Max mobile width 430px centered with safe-area padding (`var(--sat)` and `var(--sab)`).
- Zero raw emoji characters in source code or UI (enforced by `no-emoji.test.js`).
- Strict bilingual support (`tl` and `en`) with no hardcoded UI strings.
- Retain all offline course data and reading progress upon archiving.
- Pass 100% of Vitest tests, oxlint with 0 errors, and clean Vite build.

## Review Focus

- Archiving all downloaded courses leaves `quizCourses` empty: `QuizArena` and `App.jsx` must render an empty state and avoid accessing undefined.
- Clicking outside or on menu items in header dropdown or card 3-dots menu must reliably dismiss the popover without ghost clicks.
- Re-importing or downloading an archived course via peer share must auto-unarchive it.
- Opening a course from `ArchivePage` in `StoryReader` and closing it must return the user back to `ArchivePage`.
- Fast switching between language and theme while on `ArchivePage` must maintain layout, contrast, and translations.

---

### Task 1: `archiveStore` Persistence Module

**Files:**
- Create: `Systems/System1/app/src/lib/archiveStore.js`
- Test: `Systems/System1/app/src/lib/archiveStore.test.js`

**Interfaces:**
- Consumes: `localStorage`
- Produces:
  - `getArchivedCourseIds(): string[]`
  - `archiveCourse(id: string): string[]`
  - `unarchiveCourse(id: string): string[]`
  - `isCourseArchived(id: string): boolean`

- [ ] **Step 1: Write the failing tests in `archiveStore.test.js`**

```javascript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Systems/System1/app; npx vitest run src/lib/archiveStore.test.js`
Expected: FAIL with "Cannot find module './archiveStore'"

- [ ] **Step 3: Implement `archiveStore.js`**

Create `Systems/System1/app/src/lib/archiveStore.js`:
```javascript
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
      // storage unavailable or full
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Systems/System1/app; npx vitest run src/lib/archiveStore.test.js`
Expected: PASS (4 tests)

---

### Task 2: Localization Strings in `i18n.jsx`

**Files:**
- Modify: `Systems/System1/app/src/lib/i18n.jsx:100-200`
- Test: `Systems/System1/app/src/lib/i18n.test.jsx`

**Interfaces:**
- Consumes: None
- Produces: Localization dictionary keys for archive header menu, course actions, archive page, and toasts.

- [ ] **Step 1: Write test for archive translations in `i18n.test.jsx`**

Add test assertions in `Systems/System1/app/src/lib/i18n.test.jsx`:
```javascript
  it('provides archive translations in tl and en without raw emoji', () => {
    const keys = [
      'profileMenu',
      'archiveMenu',
      'archiveTitle',
      'archiveEmptyTitle',
      'archiveEmptyDesc',
      'archiveAction',
      'unarchiveAction',
      'toastArchived',
      'toastUnarchived',
      'quizEmptyArchive',
      'openArchive',
    ]
    for (const key of keys) {
      expect(DICTIONARY[key]).toBeDefined()
      expect(DICTIONARY[key].tl).toBeTruthy()
      expect(DICTIONARY[key].en).toBeTruthy()
    }
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Systems/System1/app; npx vitest run src/lib/i18n.test.jsx`
Expected: FAIL on missing keys

- [ ] **Step 3: Add archive translation strings in `i18n.jsx`**

Add to `DICTIONARY` in `Systems/System1/app/src/lib/i18n.jsx`:
- `profileMenu`: `{ tl: 'Profile', en: 'Profile' }`
- `archiveMenu`: `{ tl: 'Archive', en: 'Archive' }`
- `archiveTitle`: `{ tl: 'Naka-archive na Kurso', en: 'Archived Courses' }`
- `archiveEmptyTitle`: `{ tl: 'Walang naka-archive na kurso', en: 'No archived courses' }`
- `archiveEmptyDesc`: `{ tl: 'Ang mga kursong ia-archive mo mula sa Courses ay lilitaw rito.', en: 'Courses you archive from the Courses Hub will appear here.' }`
- `archiveAction`: `{ tl: 'I-archive', en: 'Archive' }`
- `unarchiveAction`: `{ tl: 'Ibalik sa Kurso', en: 'Unarchive' }`
- `toastArchived`: `{ tl: 'Na-archive na ang kurso', en: 'Course archived' }`
- `toastUnarchived`: `{ tl: 'Naibalik na sa mga aktibong kurso', en: 'Course restored to active courses' }`
- `quizEmptyArchive`: `{ tl: 'Walang aktibong kurso para sa pagsusulit. Mag-unarchive mula sa Archive o mag-download ng bago.', en: 'No active courses for quiz. Restore a course from Archive or download one.' }`
- `openArchive`: `{ tl: 'Buksan ang Archive', en: 'Open Archive' }`
- `archivedCount`: `{ tl: (n) => `${n} ${n === 1 ? 'kurso' : 'mga kurso'}`, en: (n) => `${n} ${n === 1 ? 'course' : 'courses'}` }`

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Systems/System1/app; npx vitest run src/lib/i18n.test.jsx`
Expected: PASS

---

### Task 3: Course Card 3-Dots Menu in `CourseHub.jsx`

**Files:**
- Modify: `Systems/System1/app/src/ui/CourseHub.jsx`
- Test: `Systems/System1/app/src/ui/CourseHub.test.jsx`

**Interfaces:**
- Consumes: `onArchive(capsule)`, `onShare(capsule)`
- Produces: 3-dots button (`MoreVertical`) replacing the standalone Share button on downloaded cards.

- [ ] **Step 1: Write tests for 3-dots card menu in `CourseHub.test.jsx`**

Add tests:
- `renders 3-dots menu button on installed course card and opens dropdown with Share and Archive`
- `clicking Archive in 3-dots menu triggers onArchive with capsule`
- `clicking outside dismisses the 3-dots dropdown menu`

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Systems/System1/app; npx vitest run src/ui/CourseHub.test.jsx`
Expected: FAIL (no 3-dots button)

- [ ] **Step 3: Update `CapsuleCard` in `CourseHub.jsx`**

In `Systems/System1/app/src/ui/CourseHub.jsx`:
- Import `MoreVertical`, `Archive` from `lucide-react`.
- Add local state `menuOpen` to `CapsuleCard` (or track `openMenuId` at `CourseHub` level).
- When `installed === true`, render a 3-dots icon button:
  ```jsx
  <div className="relative shrink-0">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setMenuOpen((prev) => !prev)
      }}
      aria-label={`Options for ${capsule.title}`}
      className="btn-press flex size-8 items-center justify-center rounded-xl border border-white/30 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition-colors"
    >
      <MoreVertical className="size-4 stroke-[2.2]" aria-hidden="true" />
    </button>
    {menuOpen && (
      <div
        className="absolute right-0 top-10 z-30 min-w-[140px] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false)
            onShare(capsule)
          }}
          className="btn-press flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
        >
          <Share2 className="size-3.5 stroke-[2.2]" aria-hidden="true" />
          <span>{t('passCourse')}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMenuOpen(false)
            onArchive(capsule)
          }}
          className="btn-press flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
        >
          <Archive className="size-3.5 stroke-[2.2]" aria-hidden="true" />
          <span>{t('archiveAction')}</span>
        </button>
      </div>
    )}
  </div>
  ```
- Add document click listener to close menu on outside clicks.
- Pass `onArchive` prop from `CourseHub` down to `CapsuleCard`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Systems/System1/app; npx vitest run src/ui/CourseHub.test.jsx`
Expected: PASS (all tests pass)

---

### Task 4: Dedicated `ArchivePage.jsx` Component

**Files:**
- Create: `Systems/System1/app/src/ui/ArchivePage.jsx`
- Test: `Systems/System1/app/src/ui/ArchivePage.test.jsx`

**Interfaces:**
- Props:
  - `archivedCourses: Capsule[]`
  - `onClose: () => void`
  - `onOpenCourse: (capsule: Capsule) => void`
  - `onUnarchive: (id: string) => void`
- Produces: Standalone full-page component for viewing and managing archived courses.

- [ ] **Step 1: Write unit tests in `ArchivePage.test.jsx`**

```javascript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ArchivePage from './ArchivePage'
import { I18nProvider } from '../lib/i18n'

describe('ArchivePage', () => {
  const dummyCourses = [
    {
      id: 'kabsat-101',
      title: 'Ligtas na Digital Wallet',
      subtitle: 'Anti-scam at OTP safety',
      competency: 'CYBER_SAFETY',
      kb: 8,
      cards: [{ id: 'c1' }, { id: 'c2' }],
    },
  ]

  it('renders header with back button and count', () => {
    render(
      <I18nProvider>
        <ArchivePage archivedCourses={dummyCourses} onClose={vi.fn()} onOpenCourse={vi.fn()} onUnarchive={vi.fn()} />
      </I18nProvider>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Archive/i)
    expect(screen.getByText(/1 kurso|1 course/i)).toBeInTheDocument()
  })

  it('renders empty state when no courses are archived', () => {
    render(
      <I18nProvider>
        <ArchivePage archivedCourses={[]} onClose={vi.fn()} onOpenCourse={vi.fn()} onUnarchive={vi.fn()} />
      </I18nProvider>
    )
    expect(screen.getByText(/Walang naka-archive|No archived courses/i)).toBeInTheDocument()
  })

  it('calls onUnarchive when Unarchive button is clicked', async () => {
    const user = userEvent.setup()
    const onUnarchive = vi.fn()
    render(
      <I18nProvider>
        <ArchivePage archivedCourses={dummyCourses} onClose={vi.fn()} onOpenCourse={vi.fn()} onUnarchive={onUnarchive} />
      </I18nProvider>
    )
    const unarchiveBtn = screen.getByRole('button', { name: /Ibalik sa Kurso|Unarchive/i })
    await user.click(unarchiveBtn)
    expect(onUnarchive).toHaveBeenCalledWith('kabsat-101')
  })

  it('calls onOpenCourse when card body is tapped', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    render(
      <I18nProvider>
        <ArchivePage archivedCourses={dummyCourses} onClose={vi.fn()} onOpenCourse={onOpen} onUnarchive={vi.fn()} />
      </I18nProvider>
    )
    const cardTitle = screen.getByText('Ligtas na Digital Wallet')
    await user.click(cardTitle)
    expect(onOpen).toHaveBeenCalledWith(dummyCourses[0])
  })

  it('calls onClose when back button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <I18nProvider>
        <ArchivePage archivedCourses={[]} onClose={onClose} onOpenCourse={vi.fn()} onUnarchive={vi.fn()} />
      </I18nProvider>
    )
    const backBtn = screen.getByRole('button', { name: /Bumalik|Back/i })
    await user.click(backBtn)
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Systems/System1/app; npx vitest run src/ui/ArchivePage.test.jsx`
Expected: FAIL with "Cannot find module './ArchivePage'"

- [ ] **Step 3: Implement `ArchivePage.jsx`**

Create `Systems/System1/app/src/ui/ArchivePage.jsx`:
- Layout: Safe-area top header with back button (`ArrowLeft`), page title `t('archiveTitle')`, count badge.
- Main area:
  - If `archivedCourses.length === 0`: render empty state card with `Archive` icon, `t('archiveEmptyTitle')`, and `t('archiveEmptyDesc')`.
  - If courses exist: render cards styled with consistent course themes, title, competency badge, reading progress indicator from `getCourseProgress(capsule.id)`, and an "Unarchive" button with `ArchiveRestore` icon.
  - Tapping card opens `onOpenCourse(capsule)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Systems/System1/app; npx vitest run src/ui/ArchivePage.test.jsx`
Expected: PASS (all tests pass)

---

### Task 5: Header Profile Dropdown and App Integration in `App.jsx`

**Files:**
- Modify: `Systems/System1/app/src/App.jsx`
- Modify: `Systems/System1/app/src/ui/QuizArena.jsx`
- Test: `Systems/System1/app/src/App.test.jsx`

**Interfaces:**
- Consumes: `archiveStore`, `ArchivePage`, `CourseHub`
- Produces: Complete app integration with profile menu, archive screen routing, course filtering, and empty quiz tolerance.

- [ ] **Step 1: Write integration tests in `App.test.jsx`**

Add tests:
- `renders profile dropdown menu when clicking user button with Profile and Archive options`
- `clicking Archive in profile dropdown navigates to ArchivePage`
- `archiving a course moves it from CourseHub to ArchivePage and excludes it from QuizArena`
- `unarchiving a course restores it to CourseHub and QuizArena`

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Systems/System1/app; npx vitest run src/App.test.jsx`
Expected: FAIL (profile dropdown not yet present)

- [ ] **Step 3: Update `App.jsx` and `QuizArena.jsx`**

In `App.jsx`:
1. Import `archiveCourse`, `unarchiveCourse`, `getArchivedCourseIds` from `./lib/archiveStore`.
2. Import `ArchivePage` from `./ui/ArchivePage`.
3. State:
   - `const [archivedIds, setArchivedIds] = useState(getArchivedCourseIds)`
   - `const [showArchive, setShowArchive] = useState(false)`
   - `const [profileMenuOpen, setProfileMenuOpen] = useState(false)`
4. Header:
   - Wrap the Profile button in a relative container.
   - On click, toggle `profileMenuOpen`.
   - Popover contains:
     - `Profile` button: calls `setShowProfile(true); setProfileMenuOpen(false)`
     - `Archive` button: calls `setShowArchive(true); setProfileMenuOpen(false)`
   - Add outside click listener for `profileMenuOpen`.
5. Handlers:
   - `handleArchive(capsule)`: calls `archiveCourse(capsule.id)`, updates `archivedIds`, shows toast `t('toastArchived')`.
   - `handleUnarchive(id)`: calls `unarchiveCourse(id)`, updates `archivedIds`, shows toast `t('toastUnarchived')`.
   - In `importFile` and download callbacks: call `unarchiveCourse(id)` so imported courses are immediately active.
6. Filtering:
   - `activeCapsules = capsules.filter((c) => !archivedIds.includes(c.id))`
   - `archivedCapsules = capsules.filter((c) => c.installed && archivedIds.includes(c.id))`
   - Pass `activeCapsules` to `CourseHub`.
   - Pass `quizCourses` filtered from active installed capsules.
7. Render `<ArchivePage>` when `showArchive === true`:
   ```jsx
   {showArchive && (
     <ArchivePage
       archivedCourses={archivedCapsules}
       onClose={() => setShowArchive(false)}
       onOpenCourse={(c) => {
         setShowArchive(false)
         setReaderId(c.id)
       }}
       onUnarchive={handleUnarchive}
     />
   )}
   ```
8. In `QuizArena.jsx`:
   - If `!capsule` or `courses.length === 0`, render clean empty state:
     - Icon: `BookOpen`
     - Prompt: `t('quizEmptyArchive')`
     - Button: `t('openArchive')` invoking `onSelectArchive` or `onExit`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Systems/System1/app; npx vitest run src/App.test.jsx`
Expected: PASS

---

### Task 6: Full Verification and Build Validation

**Files:**
- None (verification of all modules)

- [ ] **Step 1: Run full Vitest test suite**

Run: `cd Systems/System1/app; npx vitest run`
Expected: PASS on all test files (185+ tests).

- [ ] **Step 2: Run Oxlint**

Run: `cd Systems/System1/app; npx oxlint src/lib/archiveStore.js src/ui/ArchivePage.jsx src/ui/CourseHub.jsx src/App.jsx`
Expected: 0 errors.

- [ ] **Step 3: Run Vite production build**

Run: `cd Systems/System1/app; npx vite build`
Expected: Build successfully completes in `< 3s`.
