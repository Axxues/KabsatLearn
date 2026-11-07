# Task 1 — Remove the "Offline" chip from the app header

## Goal

In the KabsatLearn header, delete the blue `⚡ OFFLINE` pill that sits between the
title block and the theme-toggle button. The user is looking at the hub screen
header:

```
[cap icon] KABSATLEARN  [La Union]        [⚡ OFFLINE] [sun button]
           Mga Kurso
```

After this task the header must be:

```
[cap icon] KABSATLEARN  [La Union]                     [sun button]
           Mga Kurso
```

Scope is the header chip only. Do **not** touch any other offline UI:

- `src/ui/KabsatAI.jsx` line ~156 (`Offline · Grounded sa Aralin`) stays.
- `src/ui/QuizArena.jsx` line ~232 (`Offline Quiz`) stays.
- `src/ui/Dashboard.jsx` offline telemetry section stays.
- `src/ui/CourseHub.jsx` line ~75 (`100% Offline`) stays.
- `src/lib/useOnline.js`, `src/lib/online.js` and their tests stay — the hook is
  still valid library code even if the header no longer uses it.

## Exact changes

1. `app/src/App.jsx`
   - Remove `<OfflineBanner online={online} />` from the header's right-hand
     `<div className="flex items-center gap-2">` (around line 174).
   - Remove the now-unused `import OfflineBanner from './ui/OfflineBanner.jsx'`
     (line 8).
   - Remove the now-unused `const online = useOnline()` (line 62) and the
     `import { useOnline } from './lib/useOnline.js'` (line 6) **only if**
     `online` / `useOnline` is not referenced anywhere else in `App.jsx`.
     Verify with a search before deleting.
2. Delete `app/src/ui/OfflineBanner.jsx`. Nothing else imports it (verified by
   grep). No test file targets it.

Leave the theme-toggle button and the rest of the header markup exactly as-is.
Do not reflow, restyle, or reword anything else.

## Acceptance criteria

- `grep -r "OfflineBanner" app/src` returns nothing.
- `grep -n "online" app/src/App.jsx` returns no matches.
- `app/src/ui/OfflineBanner.jsx` no longer exists.
- Header still renders the cap icon, "KabsatLearn", the "La Union" badge, the
  page title and the theme toggle, laid out with the toggle right-aligned.
- `npx vitest run` from `app/` — all 55 tests pass (exit code 0, `OK` line;
  unittest/vitest summary on stderr is fine).
- `npx oxlint` from `app/` reports no new warnings/errors (no unused-import
  errors).
- `npx vite build` succeeds.

## Report

Write your full report to `Systems/System1/task-1-report.md` (paths, the exact
edits, and the quoted output of the three commands). Reply with a short status:
DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
