# Task 1 Report — Remove the "Offline" chip from the app header

**Status:** DONE

## Files changed

All under `D:\Hackathon\Systems\System1\app\`:

| File | Change |
|---|---|
| `src/App.jsx` | Removed `OfflineBanner` import, `useOnline` import, `const online = useOnline()`, and `<OfflineBanner online={online} />` from the header's right-hand div. Nothing else touched. |
| `src/ui/OfflineBanner.jsx` | Deleted. |
| `src/App.test.jsx` | **New.** Header regression tests (written first, watched fail). |

No changes outside `Systems/System1/`. `useOnline.js`, `online.js`, and `online.test.js` were left intact as instructed.

## Edits in `App.jsx`

1. Imports (was lines 5–10, now 5–8):
   - Deleted `import { useOnline } from './lib/useOnline.js'`
   - Deleted `import OfflineBanner from './ui/OfflineBanner.jsx'`
2. `MainApp()` now starts with `const { lang, setLang, t } = useI18n()` (the `const online = useOnline()` line is gone).
3. Header right-hand block now starts directly with the language toggle comment; `<OfflineBanner online={online} />` and its trailing blank line removed. Theme toggle and all other markup unchanged.

Pre-deletion verification: `grep -n "online" src/App.jsx` showed only lines 6, 36 and 182 (import, declaration, JSX prop) — i.e. no other reference — so the hook and import were safe to delete.

## TDD trail

- Wrote `src/App.test.jsx` first. It server-renders `<App />` with `react-dom/server` and isolates the `<header>…</header>` markup.
  - Test 1: header must not match `/\b(online|offline)\b/i`.
  - Test 2: header must still contain "KabsatLearn", "La Union", "Mga Kurso", the logo (`alt="KabsatLearn logo"`) and the theme toggle (`aria-label="Switch to dark mode"`).
- RED (before any edit): `npx vitest run src/App.test.jsx` → `Tests 1 failed | 1 passed (2)`, the failure being the live `App status: Online` chip in the header. (Test 2 initially asserted `lucide-graduation-cap`; the current file uses the `icon.svg` logo instead, so I corrected the assertion to the real requirement and re-ran: 1 failed / 1 passed, failing only on the chip.)
- GREEN after edits + deletion: `Tests 2 passed (2)`.

## Verification (quoted)

### `npx vitest run` (from `app/`)

```
Test Files  9 passed (9)
Tests  57 passed (57)
EXIT=0
```

55 pre-existing + the 2 new header tests = 57, all passing.

### `npx oxlint` (from `app/`)

```
src/lib/capsuleStore.js:17:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used...
src/lib/capsuleStore.js:79:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used...
src/lib/i18n.jsx:345:17: warning react(only-export-components): Fast refresh only works when a file only exports components...
src/ui/Dashboard.jsx:85:5: warning react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders...
EXIT=0
```

Exit 0; 4 warnings, all pre-existing in files this task did not touch. No unused-import/`no-unused-vars` warning for `App.jsx` or `App.test.jsx`.

### `npx vite build` (from `app/`)

```
vite v8.3.6 building client environment for production...
✓ 2085 modules transformed.
dist/assets/index-oGkoFL8-.js  434.30 kB │ gzip: 131.86 kB
✓ built in 538ms
PWA v2.0.0 ... precache 12 entries (481.20 KiB)
EXIT=0
```

Build regenerated `app/dist/` as expected.

### Acceptance greps

```
--- OfflineBanner refs ---            (no output)
--- online in App.jsx ---             (no output)
--- OfflineBanner.jsx exists ---      False
```

## Notes for review

1. **Brief line numbers drift.** The brief cites `const online = useOnline()` at line 62 and `<OfflineBanner>` at ~174; in the current file they were lines 36 and 182. The brief also describes a `GraduationCap`-style cap icon; the current header renders the app logo `<img src="/icon.svg" alt="KabsatLearn logo">`. I applied the intent (delete the chip + its imports/hook) to the current file, not the line numbers.
2. **File changed under me.** `src/App.jsx`'s mtime moved to 9:56:17 between my first read and my first test run (293 → 294 lines, GraduationCap → icon.svg). I re-read the file and edited the live version; no content from the earlier read was used.
3. **Header layout.** The right-hand container still uses `flex items-center gap-2` and the header still uses `justify-between`, so the remaining language + theme buttons stay right-aligned. The language toggle was not in the brief's before/after diagram but exists in the current app; I left it untouched per "leave the rest of the header markup exactly as-is".
4. **Test scope.** The new `App.test.jsx` renders the whole `<App>` via `renderToStaticMarkup` under jsdom and asserts only on the extracted `<header>` block, so the still-required `100% Offline` label in `CourseHub` and other offline UI do not interfere with the assertion.
