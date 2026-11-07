# Course Archiving & Archive Page Design Specification

**Date:** 2026-11-07  
**Project:** KabsatLearn (Offline-first Android PWA/Capacitor App)  
**Topic:** Course Archiving, Header Profile Dropdown, Card Context Menu, and Dedicated Archive Page

---

## 1. Intent and The Why

Learners in community hubs and off-grid areas accumulate downloaded micro-learning courses ("capsules"). Once a course is mastered, learners want to declutter their active Courses Hub without deleting the downloaded course files or losing their progress data. Because connectivity is intermittent and re-downloading consumes data, courses should be safely archived on the device, retrievable at any time, and readable even while archived.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
1. **Header Profile Dropdown**: Tapping the top-right Profile icon in the app header opens a dropdown menu with two options:
   - **Profile** (`UserRound` icon): Opens the learner profile modal.
   - **Archive** (`Archive` icon): Opens the dedicated Archive Page.
2. **Course Card 3-Dots Menu**:
   - On installed course cards in `CourseHub`, replace the floating "Share" button with a 3-dots button (`MoreVertical`) in the upper-right corner.
   - Tapping the 3-dots button opens a popover context menu with:
     - **Share** (`Share2` icon): Triggers Bluetooth/peer sharing dialog.
     - **Archive** (`Archive` icon): Moves the course into the Archive and shows a confirmation toast.
3. **Dedicated Archive Page (`ArchivePage.jsx`)**:
   - Full-view screen with a sticky safe-area header: Back button (`ArrowLeft`), page title ("Archive" / "Naka-archive"), and count tag badge (e.g. "1 course" / "1 kurso").
   - Lists archived courses with their visual card styling, title, competency badge, and progress.
   - Actions on each archived card:
     - **Tap card**: Opens `StoryReader` for reading the course offline.
     - **Unarchive action** (`ArchiveRestore` icon): Restores the course to the active Course Hub and Quizzes, showing a success toast.
   - Empty state illustration and helpful message when no courses are archived yet.
4. **App-wide Filter & Persistence**:
   - Persist archived course IDs in localStorage (`kabsat_archived_courses`).
   - Active `CourseHub` displays only non-archived courses.
   - `QuizArena` course selector dropdown displays only active (non-archived) downloaded courses.
   - Preserves all course bundle files on disk/IndexedDB (no data loss).

### Non-Goals
- Deleting course files from IndexedDB/Capacitor storage during archive (archiving is a visibility/organization state, not deletion).
- Bulk/multi-select archiving actions (single-course actions meet learner workflow cleanly).

### Anti-Goals
- Requiring network access to archive, unarchive, or read archived courses.
- Hiding archived courses so deeply that learners cannot read them without first unarchiving.
- Breaking existing keyboard or touch accessibility.

---

## 3. UI and UX Specifications

### 3.1 Header Profile Dropdown
- **Placement**: Directly below the top-right Profile button in `App.jsx`, aligned to the right edge with a safe margin (`right-4`).
- **Styling**: `rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl p-1.5 min-w-[160px] z-50 animate-pop-in`.
- **Options**:
  - `Profile` button: `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]`.
  - `Archive` button: `flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]`.
- **Dismissal**: Closes on click outside (backdrop or document listener) or when an option is selected.

### 3.2 Course Card 3-Dots Menu (`CourseHub.jsx`)
- **Trigger**: In `CapsuleCard`, when `installed === true`:
  - Position: Upper-right area of the card (replacing the standalone `Share` button).
  - Button: `btn-press size-8 flex items-center justify-center rounded-xl border border-white/30 bg-black/30 hover:bg-black/50 text-white backdrop-blur-md`.
  - Icon: `MoreVertical` (size-4).
- **Popover**:
  - `rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl p-1.5 min-w-[140px] z-30`.
  - Options:
    - **Share** (`Share2` icon): Calls `onShare(capsule)`.
    - **Archive** (`Archive` icon): Calls `onArchive(capsule)`.
  - Accessible label: `Options for {capsule.title}`.

### 3.3 Archive Page (`ArchivePage.jsx`)
- **Container**: `pageShell` with safe-area padding (`var(--sat)`, `var(--sab)`).
- **Header**:
  - Back button (`ArrowLeft`) with label `Bumalik` / `Back` invoking `onClose()`.
  - Title: `Archive` / `Naka-archive na Kurso`.
  - Subtitle or badge: Number of archived courses (`X courses` / `X na kurso`).
- **List / Card Presentation**:
  - Renders cards with the course theme gradients, artwork, title, and competency badge.
  - Progress indicator: Uses `getCourseProgress(capsule.id)` from `courseProgress.js` showing percentage read / completed badge.
  - Quick action button on card: `Unarchive` (`ArchiveRestore` icon, `text-xs font-bold`).
  - Tapping card body calls `onOpenCourse(capsule)`.
- **Empty State**:
  - When `archivedCourses.length === 0`:
    - Clean illustration/icon (`Archive` size-12 in soft accent background).
    - Title: "Walang naka-archive na kurso" / "No archived courses".
    - Description: "Ang mga kursong ia-archive mo mula sa Courses ay lilitaw rito." / "Courses you archive from the Courses Hub will appear here."

### 3.4 Edge Cases & System Integration
- **Empty Active Quiz Courses**: If a user archives all downloaded courses, `quizCourses` will be empty. `QuizArena` and `App.jsx` guard against `undefined` by rendering an empty state inside `QuizArena` ("Walang aktibong kurso para sa pagsusulit" / "No active courses for quiz") with a button to open the Archive or return to Course Hub.
- **Peer-to-Peer Import / Download**: If a learner imports or downloads a course that was previously archived, `unarchiveCourse(id)` is called to make it immediately active and visible in Course Hub.
- **Dashboard Mastery Retention**: Dashboard retains mastery calculation for all downloaded courses (active and archived) so learners do not lose their accumulated skill badges or competency progress when archiving.

---

## 4. State Management & Storage Interface

- **Storage Key**: `kabsat_archived_courses` in `localStorage`.
- **Format**: JSON array of string IDs: `string[]`, e.g. `["kabsat-101"]`.
- **Helper module**: `Systems/System1/app/src/lib/archiveStore.js`:
  - `getArchivedCourseIds(): string[]`
  - `archiveCourse(id: string): string[]`
  - `unarchiveCourse(id: string): string[]`
  - `isCourseArchived(id: string): boolean`
- **Integration in `App.jsx`**:
  - State `archivedIds`: initialized from `getArchivedCourseIds()`.
  - State `showArchive`: boolean toggle for displaying `ArchivePage`.
  - Filtering:
    - `activeCapsules = capsules.filter(c => !archivedIds.includes(c.id))`
    - `archivedCapsules = capsules.filter(c => c.installed && archivedIds.includes(c.id))`
    - `quizCourses = activeCapsules.filter(c => c.installed)` (guarantees archived courses never appear in Quiz Arena).

---

## 5. Localization (`tl` & `en`)

Add translation strings to `Systems/System1/app/src/lib/i18n.jsx`:
- `profileMenu`: `{ tl: 'Profile', en: 'Profile' }`
- `archiveMenu`: `{ tl: 'Archive', en: 'Archive' }`
- `archiveTitle`: `{ tl: 'Naka-archive na Kurso', en: 'Archived Courses' }`
- `archiveEmptyTitle`: `{ tl: 'Walang naka-archive', en: 'No archived courses' }`
- `archiveEmptyDesc`: `{ tl: 'Ang mga natapos o itinagong kurso ay makikita rito.', en: 'Completed or hidden courses will appear here.' }`
- `archiveAction`: `{ tl: 'I-archive', en: 'Archive' }`
- `unarchiveAction`: `{ tl: 'Ibalik sa Kurso', en: 'Unarchive' }`
- `toastArchived`: `{ tl: 'Na-archive na ang kurso', en: 'Course archived' }`
- `toastUnarchived`: `{ tl: 'Naibalik na sa mga kurso', en: 'Course restored to courses' }`
- `archivedCount`: `{ tl: (n) => `${n} ${n === 1 ? 'kurso' : 'mga kurso'}`, en: (n) => `${n} ${n === 1 ? 'course' : 'courses'}` }`

---

## 6. Verification and Acceptance Criteria

1. **Unit Tests**:
   - `archiveStore.test.js`: Validates adding, removing, retrieving, and deduplicating archived course IDs.
   - `ArchivePage.test.jsx`: Validates header, count, unarchive action button, card tap to open reader, and empty state.
   - `CourseHub.test.jsx`: Validates 3-dots button renders on installed cards, opens menu with Share and Archive, and excludes archived courses from list.
   - `QuizArena.test.jsx` / `App.test.jsx`: Validates archived courses are excluded from Quiz Arena selector.
2. **Quality Checks**:
   - Oxlint passes with 0 errors.
   - Full Vitest test suite (`npx vitest run`) passes.
   - Vite production build (`npx vite build`) completes with 0 errors.
