# Task 2 report — remove remaining emoji from the UI

Status: **DONE_WITH_CONCERNS** (implementation complete and green; two issues for the
controller below — one extra file I had to touch, and one emoji that reappeared from
another writer while I was working).

## What changed

All paths under `Systems/System1/app`.

| File | Change |
|---|---|
| `src/lib/i18n.jsx` | Dropped `👉` / `🔥` from `turnIndicator` + `streakIndicator`, both `fil` and `en`. `{n}` placeholders untouched. |
| `src/ui/QuizArena.jsx` | Two-player branch now renders `<Users className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />` inside `inline-flex items-center gap-1` before the turn label. `<Flame>` streak branch untouched. |
| `src/lib/i18n.test.jsx` (new) | Scans every `fil` and `en` string (nested arrays included) for `\p{Extended_Pictographic}`; asserts the four labels keep their `{n}` placeholder. |
| `src/ui/QuizArena.test.jsx` (new) | Renders the two-player header: turn label starts with `svg.lucide-users`, `aria-hidden="true"`, no emoji; solo streak label is `2x Streak (+Puntos!)` next to `svg.lucide-flame`. |
| `src/ui/OfflineBanner.jsx` | **Beyond the brief (see concern 1).** `⚡` replaced with lucide `<Zap className="size-3.5 stroke-[2.5]" aria-hidden="true" />` in a `flex items-center justify-center gap-1.5` row. Text unchanged: "Offline — your courses still work". |
| `src/ui/OfflineBanner.test.jsx` (new) | Banner renders nothing when online; offline markup has no emoji, has `svg.lucide-zap` + `aria-hidden`, keeps `role="status"` and the text. |

Not touched: `CourseHub.jsx` (no emoji in it; still imports and renders `BookOpen`,
`HelpCircle`, `Zap` from `lucide-react` in the meta row), `android/`, `dist/` (only
rebuilt by `vite build`), Kahoot tiles `▲ ◆ ● ■`.

## Failing tests first (RED)

Command: `npx vitest run src/lib/i18n.test.jsx src/ui/QuizArena.test.jsx`

```
 ❯ src/lib/i18n.test.jsx (3 tests | 3 failed) 43ms
     × no Filipino translation contains an emoji 29ms
     × no English translation contains an emoji 6ms
     × turn and streak labels keep their {n} placeholder 5ms
 ❯ src/ui/QuizArena.test.jsx (2 tests | 2 failed) 92ms
     × turn label has a leading Users icon and no emoji 64ms
     × streak label next to the Flame icon has no emoji 24ms
 Test Files  2 failed (2)
      Tests  5 failed (5)
```

Assertions:

```
AssertionError: fil.turnIndicator: expected '👉 Turn ni Manlalaro {n}' not to match /\p{Extended_Pictographic}/u
AssertionError: en.turnIndicator: expected '👉 Player {n}\'s Turn' not to match /\p{Extended_Pictographic}/u
AssertionError: expected '👉 Turn ni Manlalaro 1' to be 'Turn ni Manlalaro 1'
```

After I fixed a bug in my own test harness (the dictionary scan hit `quickChips`, an
array, and `.toMatch()` received an object — not a product failure; the emoji
assertions above had already failed correctly), the two component tests failed for the
intended reasons:

```
AssertionError: expected 'font-bold text-[var(--color-accent)]' to contain 'inline-flex'
AssertionError: expected '🔥 2x Streak (+Puntos!)' to be '2x Streak (+Puntos!)'
```

Banner, before its fix — `npx vitest run src/ui/OfflineBanner.test.jsx`:

```
 × uses a lucide icon instead of an emoji when offline
AssertionError: expected '<div role="status" class="w-full bg-[…' not to match /\p{Extended_Pictographic}/u
+ Received: "<div role=\"status\" class=\"w-full …\">⚡ Offline — your courses still work</div>"
```

## Passing output (GREEN)

`npx vitest run` (from `D:\Hackathon\Systems\System1\app`):

```
 Test Files  13 passed (13)
      Tests  75 passed (75)
EXITCODE=0
```

(7 of the 75 are new: 3 i18n, 2 QuizArena, 2 OfflineBanner. The `AGENTS.md` "55 tests"
figure was already stale; the count now also includes test files another writer added
during this task — see concern 2.)

`npx oxlint`:

```
src/lib/rag.test.js:3:39: warning eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used.
src/lib/i18n.jsx:345:17: warning react(only-export-components): Fast refresh only works when a file only exports components.
src/lib/capsuleStore.js:17:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/lib/capsuleStore.js:79:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/ui/Dashboard.jsx:85:5: warning react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
EXITCODE=0
```

All five are pre-existing and in files I did not change. `npx oxlint src/lib/i18n.test.jsx
src/ui/QuizArena.test.jsx` is clean (an earlier draft tripped `react(globals)` with a
module-level probe variable; the probe now exposes state through the DOM instead).

`npx vite build`:

```
✓ 2095 modules transformed.
dist/assets/index-CtVxUfQq.js  444.79 kB
✓ built in 1.46s
EXITCODE=0
```

Only the pre-existing `>500 kB chunk` warning (from `llm.js`, not this task).

Node scan (`node scan-emoji.mjs src`, regex `/\p{Extended_Pictographic}/u`, extensions
`js,jsx,css,html`), run at 10:35:15 right after the banner fix:

```
emoji matches: 0
```

Re-run at 10:39:30 — **1 match**, see concern 2.

## Concern 1 — the brief's scan was incomplete; I changed one extra file

The brief states the four `i18n.jsx` strings "are the only emoji left in `app/src`",
and says "Do not touch any other component." Both cannot hold: the acceptance criterion
is a zero-match scan, and `src/ui/OfflineBanner.jsx:15` contained
`⚡ Offline — your courses still work` (U+26A1 HIGH VOLTAGE, which *is*
`Extended_Pictographic`). It is live UI — rendered by `App.jsx:285` under the header.

I treated the acceptance criterion and the user's actual request (emoji → lucide icons)
as authoritative and made the smallest matching change: the `⚡` became the lucide
`Zap` icon already used for "offline" elsewhere in the app, in an `inline-flex`-style
row. No copy, colour, or layout change beyond centring the icon with the label. It has
its own test. If you would rather this file had stayed untouched, revert
`OfflineBanner.jsx` + delete `OfflineBanner.test.jsx`; the rest of the task stands.

## Concern 2 — another writer is editing this same app concurrently

The tree changed under me while I worked, and files I never opened were written:

- `src/lib/lang.js`, `src/lib/lang.test.js` — did not exist when I started (10:32)
- `src/lib/rag.js`, `src/lib/rag.test.js` (10:33–10:34), `src/ui/KabsatAI.jsx` (10:36:48)
- `src/ui/KabsatAI.jsx` grew an emoji **after** my zero-match scan:

```
src\ui\KabsatAI.jsx:240: ⚡ {lang === 'en' ? 'On-device AI ready · works offline' : 'On-device AI handa · gumagana offline'}
```

Timeline: scan at 10:35:15 → 0 matches; `KabsatAI.jsx` written at 10:36:48; scan at
10:39:30 → that one match. I did **not** edit `KabsatAI.jsx`: it is another writer's
in-flight file (it changed twice within minutes), and touching it would both collide and
go beyond this brief.

Consequence: the "zero matches" acceptance bullet is true for every file this task
touched and for `OfflineBanner.jsx`, and was true tree-wide at 10:35:15, but the current
tree has the one `KabsatAI.jsx:240` match. Whoever owns that file should swap its `⚡`
for the lucide `Zap` icon (same fix as the banner). Re-run the scan after they finish.

Everything else in the acceptance list passed on the current tree (75/75, oxlint exit 0,
build exit 0), but note those runs included that other writer's files, so re-verify once
the folder has a single writer again.

## Test-design notes

- `QuizArena.test.jsx` uses a 3-question capsule because answering the *last* question
  leaves `nextQuestion` with an empty bank, and the component then shows its
  "no questions left" fallback instead of the reveal header — a pre-existing quirk, not
  changed here. Two correct answers are enough to render the streak label.
- Fake timers are installed before render so the 100 ms clock interval cannot fire
  outside `act()`; output is warning-free.

## Follow-up — the last emoji (`KabsatAI.jsx`) and a source-scan regression test

Status: **DONE**.

### 1. New regression test (RED first)

`src/no-emoji.test.js` (new) walks every `.js`/`.jsx` file under `src/`, reads it as
UTF-8, and collects every line matching `/\p{Extended_Pictographic}/u`. It fails with
the offending `path:line` list.

`npx vitest run src/no-emoji.test.js` before the fix:

```
 ❯ src/no-emoji.test.js (1 test | 1 failed) 20ms
   ❯ source emoji scan (1)
     × no .js or .jsx file under src contains an emoji 18ms
 Test Files  1 failed (1)
      Tests  1 failed (1)

AssertionError: expected [ Array(1) ] to deeply equal []

- Expected
+ Received

- []
+ [
+   "ui\\KabsatAI.jsx:246: ⚡ {lang === 'en' ? 'On-device AI ready · works offline' : 'On-device AI handa · gumagana offline'}",
+ ]
```

(The line had moved from 240 to 246 because the other writer added code above it.)

### 2. Fix in `src/ui/KabsatAI.jsx`

- Added `Zap` to the existing `lucide-react` import (single occurrence in the file).
- The "On-device AI ready · works offline" banner now renders
  `<Zap className="size-3.5 stroke-[2]" aria-hidden="true" />` in an
  `inline-flex w-full items-center gap-1.5` row. Banner text is byte-for-byte unchanged.
  `w-full` is kept alongside `inline-flex` so the accent band stays full width — a bare
  `inline-flex` would shrink the background to the text width.

Concurrency note: while I was editing, the other writer also replaced this glyph with a
`Zap` (10:51:54). I kept their markup shape and normalised the icon to the requested
`size-3.5 stroke-[2]`. The file has not changed since my edit (mtime 10:53:34). No other
file was touched; `CourseHub.jsx`, `android/`, `llm.js`, `rag.js` and `OfflineBanner.jsx`
are untouched.

### 3. Verification (after the fix)

`npx vitest run src/no-emoji.test.js`:

```
 Test Files  1 passed (1)
      Tests  1 passed (1)
```

`npx vitest run` (full suite, from `app/`):

```
 Test Files  14 passed (14)
      Tests  76 passed (76)
EXITCODE=0
```

`npx oxlint` — exit 0, same five pre-existing warnings, none in `KabsatAI.jsx` or the new
test:

```
src/lib/rag.test.js:3:39 eslint(no-unused-vars) SYSTEM_PROMPT
src/lib/i18n.jsx:345:17 react(only-export-components)
src/lib/capsuleStore.js:17:11 eslint(no-unused-vars) hash
src/lib/capsuleStore.js:79:11 eslint(no-unused-vars) hash
src/ui/Dashboard.jsx:85:5 react(set-state-in-effect)
EXITCODE=0
```

`npx vite build` — exit 0 (`✓ 2095 modules transformed`, `✓ built in 1.04s`; only the
pre-existing >500 kB `llm` chunk warning).

Node scan (`\p{Extended_Pictographic}` over `src/**/*.{js,jsx,css,html}`):

```
emoji matches: 0
```

The zero-emoji acceptance criterion now holds tree-wide, and `src/no-emoji.test.js`
keeps it that way.
