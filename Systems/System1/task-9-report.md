# Task 9 report — Collapse the "Available to download" section by default

**Status: DONE_WITH_CONCERNS**

The feature is implemented exactly as specified, and every verification command
I ran for it passed: 143/143 on the full suite at the moment the change was
complete, 19/19 on my two test files at the end, oxlint 0, vite build 0, no emoji.

The concern is not about this task's behaviour:

1. Another session kept writing `CourseHub.jsx`, `CourseHub.test.jsx` and new
   `Dashboard`/`Profile` tests while I worked. At the end of the session the full
   suite reports 2 failures in `src/ui/Profile.test.jsx`, a file another session
   created at 12:53:42 — unrelated to CourseHub.
2. To capture the complete RED log I did one temporary revert/restore of
   `CourseHub.jsx` (about 60 seconds). If another writer touched that file in
   that window, my restore would have overwritten it. Details in section 9.

---

## 1. Files changed

Exactly the three files the brief allows are the ones **I** changed. Other
sessions also wrote to two of them afterwards — see section 9.

| File | Change |
|---|---|
| `Systems/System1/app/src/ui/CourseHub.jsx` | `ChevronDown` import; `const [availableOpen, setAvailableOpen] = useState(false)`; available section rewritten as a collapsible `<h2><button aria-expanded aria-controls>` heading with `<ul id="available-course-list" hidden={!availableOpen}>` |
| `Systems/System1/app/src/ui/CourseHub.test.jsx` | `expandAvailable()` helper; 2 new tests (collapsed by default, expand/collapse); 5 existing tests now call `expandAvailable()` and use `li button` instead of `button` |
| `Systems/System1/app/src/CourseCatalog.test.jsx` | `the other catalogue courses wait under available to download` expands the section before asserting titles |

No other source file was edited by me. `npx vite build` regenerated build output
under `app/dist/` (pre-existing, generated directory) — that is build output, not
a source change.

### `CourseHub.jsx` — the new block (matches the brief verbatim)

```jsx
{/* Available for Download Section */}
{available.length > 0 && (
  <section aria-labelledby="available-heading">
    <h2
      id="available-heading"
      className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
    >
      <button
        type="button"
        aria-expanded={availableOpen}
        aria-controls="available-course-list"
        onClick={() => setAvailableOpen((open) => !open)}
        className="btn-press flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-1 text-left hover:text-[var(--color-ink)]"
      >
        <span>{t('availableHeading')}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-[var(--color-muted)]">
            {t('availableCountTag', { n: available.length })}
          </span>
          <ChevronDown
            className={`size-4 stroke-[2.5] transition-transform duration-200 ${
              availableOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </span>
      </button>
    </h2>
    <ul id="available-course-list" hidden={!availableOpen} className="mt-2 space-y-3">
      {available.map((capsule) => (
        <CapsuleCard
          key={capsule.id}
          capsule={capsule}
          onOpen={onOpen}
          onDownload={setConfirmDownloadTarget}
          onShare={setShareTarget}
          downloading={downloadingId === capsule.id}
        />
      ))}
    </ul>
  </section>
)}
```

The installed section, `CapsuleCard`, the share modal, the download
confirmation modal and the download flow are untouched.

---

## 2. RED — tests written first, watched fail

Tests were written before any production change. First run (full suite):

```
 Test Files  3 failed | 19 passed (22)
      Tests  9 failed | 131 passed (140)
```

`EXIT=1`. The third failing file was unrelated: `src/ui/Dashboard.test.jsx` was
being rewritten by another session at that moment (file mtime 12:47:55, during
the run), and that failure disappeared once the file settled.

Because the suite changed underneath that run, RED was re-run against the same
unimplemented component to get a clean, attributable log. Result (exit 1):

```
 ❯ src/ui/CourseHub.test.jsx (14 tests | 7 failed) 634ms
 ❯ src/CourseCatalog.test.jsx (3 tests | 1 failed) 1781ms
⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 8 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/CourseCatalog.test.jsx > course catalogue in the app > the other catalogue courses wait under available to download
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > available card renders its KB size
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > available section is collapsed by default
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > available section expands and collapses on header click
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > card category tag and code come from the capsule when it carries a tone
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > download button uses high-contrast text and does not use variable ink color on white background
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > clicking an available course card opens download confirmation modal, cancel dismisses it
 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > confirming download in modal triggers onDownload with capsule id
 Test Files  2 failed | 21 passed (23)
      Tests  8 failed | 135 passed (143)
```

Failure reasons, all expected and all caused by the feature being absent:

- `expandAvailable()` / the two new tests:
  `TypeError: Cannot read properties of null (reading 'dispatchEvent')` at
  `toggle.dispatchEvent(...)` — there was no `h2 button` to click.
- `available section is collapsed by default` failed at line 133 with
  `TypeError: Cannot read properties of null (reading 'getAttribute')` —
  `section.querySelector('h2 button')` returned `null`.
- `the other catalogue courses wait under available to download` failed on the
  same missing toggle.

No test failed for a typo, a missing import, or a setup error.

### Tests added (verbatim from the brief)

```js
async function expandAvailable() {
  const section = container.querySelector('section[aria-labelledby="available-heading"]')
  const toggle = section.querySelector('h2 button')
  await act(async () => {
    toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  return section
}
```

- `available section is collapsed by default` — asserts
  `aria-expanded="false"`, `list.hidden === true`, and that the toggle still
  reads "Available to download when online" and "1 available".
- `available section expands and collapses on header click` — asserts
  `aria-expanded` and `hidden` flip to true/false and back.

### Existing tests tightened, not weakened

The five tests named in the brief now start with `await expandAvailable()` and
select the card's own control with `availableSection.querySelector('li button')`
(the first button in the section is the collapse toggle). The modal tests still
assert `downloadedId` is `null` before confirming and only becomes
`'capsule-201'` after pressing "Download Now".

---

## 3. GREEN

### 3a. Full suite at the moment my implementation was complete

`npx vitest run` from `D:\Hackathon\Systems\System1\app`:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  23 passed (23)
      Tests  143 passed (143)
   Start at  12:50:42
   Duration  6.84s (environment 71%, tests 13%, import 9%, setup 3%, transform 2%, worker 1%)
```

`EXIT=0`.

(The suite was 22 files / 140 tests when I started and 23 files / 143 tests when
I finished — another session added Dashboard tests mid-task. All pass.)

### 3b. My two test files, re-run at the end against the concurrent changes

Run after another session portalled the modals and added a 15th CourseHub test:

```
npx vitest run src/ui/CourseHub.test.jsx src/CourseCatalog.test.jsx
 Test Files  2 passed (2)
      Tests  19 passed (19)
TARGETED_EXIT=0
```

### 3c. Full suite at the end of my session — 2 failures, neither mine

```
npx vitest run
 ❯ src/ui/Profile.test.jsx (5 tests | 2 failed) 497ms
 FAIL  src/ui/Profile.test.jsx > Profile component > editing nickname and saving calls onSaved with updated data
 FAIL  src/ui/Profile.test.jsx > Profile component > clearing profile resets inputs and calls onSaved with empty profile
 Test Files  1 failed | 23 passed (24)
      Tests  2 failed | 148 passed (150)
FULL_EXIT=1
```

`src/ui/Profile.test.jsx` was created at **12:53:42** and `src/ui/Profile.jsx`
was written at **12:54:37** — both after my last green full run — by another
session. The failures are `expected "vi.fn()" to be called at least once` on
`onSavedMock`; they exercise the Profile form, not CourseHub, and I never touched
either file. They are reported by name, not omitted.

---

## 4. Lint

`npx oxlint` from `app/` (final run, after the concurrent Profile and portal
changes):

```
LINT_EXIT=0
src/ui/Profile.test.jsx:42:10: warning eslint(no-unused-vars): Function 'setSelectValue' is declared but never used.
src/lib/rag.test.js:3:39: warning eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used.
src/lib/i18n.jsx:378:17: warning react(only-export-components): Fast refresh only works when a file only exports components.
src/lib/capsuleStore.js:23:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/lib/capsuleStore.js:85:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/ui/CourseHub.jsx:17:3: warning eslint(no-unused-vars): Identifier 'Sparkles' is imported but never used.
```

Exit code 0, warnings only. Every warning pre-dates this task or belongs to
another session's files (`Profile.test.jsx`). My change introduces no new
warning: `ChevronDown` is imported and used.

## 5. Build

`npx vite build` from `app/`, final run (includes the other session's portal
work):

```
dist/assets/llm-DI1mN1Zl.js                      6,116.56 kB │ gzip: 2,190.28 kB
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rolldownOptions.output.codeSplitting to improve chunking:
...
✓ built in 1.12s

PWA v2.0.0
mode      generateSW
precache  14 entries (6554.31 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
BUILD_EXIT=0
```

An earlier build on my own tree also exited 0 (`✓ built in 1.29s`, 2104 modules
transformed). The >500 kB chunk advisory printed by Vite is pre-existing (the
WebLLM bundle).

The >500 kB chunk advisory printed by Vite is pre-existing (the WebLLM bundle).

## 6. Emoji check

Regex scan of every `.js/.jsx/.css/.html` file under `app/src` for surrogate-pair
characters, U+2600–U+27BF and U+FE0F:

```
NO_EMOJI_FOUND
```

---

## 7. Acceptance criteria

- [x] Collapsed on first render: `aria-expanded="false"`, `#available-course-list`
      has `hidden`.
- [x] Clicking the header toggles both `aria-expanded` and `hidden`
      (test: "available section expands and collapses on header click").
- [x] Heading and count stay visible while collapsed — both live inside the
      toggle button, which is always rendered.
- [x] Tapping the header does not open a modal or call `onDownload` — the toggle
      sits outside the `<li>` cards, so `CapsuleCard`'s click handler cannot fire;
      the two modal tests still prove `onDownload` is only called after
      confirmation.
- [x] Installed section, card layout and both modals unchanged.
- [x] `npx vitest run` → exit 0, 143/143 at the point my change was complete
      (3a). At the end of the session the same command reports 2 failures in
      `src/ui/Profile.test.jsx`, written by another session; my two test files
      are 19/19 green (3b, 3c).
- [x] `npx oxlint` → exit 0.
- [x] `npx vite build` → exit 0.
- [x] No emoji in `app/src`.
- [x] Only the three listed source files changed.
- [ ] Page-load default is collapsed after a remount — satisfied by
      `useState(false)` (component state, not persisted). There is no separate
      automated remount test; the state is not read from storage anywhere.

## 8. Design notes

- Heading outline preserved: the `<h2 id="available-heading">` remains a real
  heading; the button is *inside* it, so the page still reads
  `h1 → greeting h2 → installed h2 → available h2`.
- The count badge keeps `normal-case tracking-normal`, because the `h2`
  applies `uppercase tracking-wider`.
- Touch target: `min-h-11` (44px).
- Accessibility: `aria-expanded`, `aria-controls`, `type="button"`, chevron
  `aria-hidden="true"`. `hidden` keeps cards mounted (instant expand) while
  removing them from the accessibility tree and the layout.
- Motion: the chevron `transition-transform duration-200` is covered by the
  existing global `@media (prefers-reduced-motion: reduce)` rule in
  `src/index.css:218`, which forces `transition-duration: 0.01ms !important`.
- Colour roles use existing tokens only (`--color-muted`, `--color-ink`,
  `--color-surface-sunken`); no new hex, no new i18n keys.

---

## 9. Concurrency — read before review

The brief warned that `CourseHub.jsx` had been changed recently. It kept being
changed while I worked. Timeline observed from file mtimes:

| Time | File | Event |
|---|---|---|
| 12:47:55 | `src/ui/Dashboard.test.jsx` | recreated by another session, during my first RED run |
| 12:48:57 | `src/App.jsx` | written by another session |
| 12:49:29 | `src/ui/Dashboard.jsx` | written by another session |
| 12:49:21 | `src/ui/CourseHub.jsx` | another session added `import { createPortal } from 'react-dom'` (not yet used) |
| 12:50:08 | `src/ui/CourseHub.test.jsx` | my test file re-touched; re-read afterwards, only my tests present |
| 12:53:42 | `src/ui/Profile.test.jsx` | created by another session |
| 12:54:37 | `src/ui/Profile.jsx` | written by another session |
| 12:55:30 | `src/ui/CourseHub.test.jsx` | another session added a 15th test (share button label) — passes |
| 12:59:28 | `src/ui/CourseHub.jsx` | another session completed a portal refactor of both modals (`createPortal` now used at lines 435 and 528) |

**Current state of the shared file:** my available-section block (lines 389–430)
is intact and byte-identical to the brief; the other session's `createPortal`
work sits in the two modals and does not touch it. They also changed the two
modal tests' selectors from `container.querySelector(...)` to
`document.body.querySelector(...)` so the portalled dialogs are found. Their
assertions are unchanged and still strong (`onDownload` not called before
confirming, `'capsule-201'` only after "Download Now"). Both modal tests pass.

**What I did that needs disclosure:** to capture the complete RED log I
temporarily restored the old available-section markup, ran the suite, then
restored my implementation from a backup (`Copy-Item`, 12:49:41). The window was
roughly 12:49:45–12:50:45. The backup already contained the other session's
`createPortal` import, so that part of their work was preserved — and their
portal refactor landed later at 12:59:28 regardless. But if they had written
`CourseHub.jsx` inside that ~60-second window, my restore would have overwritten
it; there is no git history to diff against. The final file passes tests, lint
and build, and contains both my change and their portal work.

Because of the simultaneous writers the suite grew from 22 files / 140 tests at
the start to 24 files / 150 tests at the end. My own two files are green at the
end (19/19). The only failing file at the end is `src/ui/Profile.test.jsx`, which
another session created at 12:53:42 — see 3c.

## 10. Commands run (all from `D:\Hackathon\Systems\System1\app`)

```
npx vitest run                                         -> exit 1 (RED, 8 failures, expected)
npx vitest run                                         -> exit 0 (143 passed, my finished tree)
npx vitest run src/ui/CourseHub.test.jsx src/CourseCatalog.test.jsx
                                                       -> exit 0 (19 passed, final)
npx vitest run                                         -> exit 1 (2 failures in another session's Profile.test.jsx, final tree)
npx oxlint                                             -> exit 0 (warnings only)
npx vite build                                         -> exit 0
```
