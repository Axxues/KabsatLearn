# Task 7 report — Review follow-ups for the six-course catalogue

Status: **DONE**

All work is inside `Systems/System1`. Brief followed exactly; no refactors, no
new dependencies, no subagents, no git commands.

## Deliverables

### 1. Family gradient depth — `app/src/ui/CourseHub.jsx`

`family` is now:

```
bg-gradient-to-br from-[#134e4a] via-[#115e59] to-[#0f766e]
```

Three distinct stops. `safety`, `work`, and `business` are unchanged.

**White (#ffffff) on each stop — WCAG 2.1 relative luminance, computed with
`sRGB → linear → 0.2126R + 0.7152G + 0.0722B` and `(1.05) / (L + 0.05)`:**

| Stop | White-on-stop contrast |
|---|---|
| `#134e4a` | 9.48:1 |
| `#115e59` (new via) | **7.58:1** |
| `#0f766e` | 5.47:1 |

The required stop `#115e59` is **7.58:1**, above the 4.5:1 floor; all three stops
clear it.

### 2. Seed guard — `app/src/App.jsx`

Loop body is exactly the briefed form:

```js
for (const id of SEEDED_IDS) {
  const capsule = CAPSULE_BY_ID[id]
  if (!capsule) continue
  if (!(await getCapsule(id))) {
    await seedCapsule(capsule)
  }
}
```

### 3. Stronger catalogue guards — `app/src/data/catalogue.test.js`

Added two tests (the file now imports `BANDS` from `../lib/schema.js`):

1. `every seeded id exists in the capsule index` — iterates `SEEDED_IDS` and
   asserts `CAPSULE_BY_ID[id]` is truthy.
2. `new capsule chunks use known bands and four to six lowercase keywords` —
   loops `NEW_IDS` only (101/102 keyword lists exceed six) and asserts, per
   chunk: `difficulty` is in `BANDS`; `keywords.length` is 4–6; every keyword is
   a string and equals its own lowercase form.

### 4. Capsule 106 question precision — `app/src/data/capsules/capsule-106.json`

`q2` option index 1 changed from `"Item, bilang, presyo, at petsa"` to the exact
briefed string:

```
"Item, unit cost, presyo, stock in at out, balanse, at expiry"
```

`answer` is still `1`; four options remain; distractors untouched.

### 5. Documentation — `DESIGN.md`

- Features (v1) item 6: `mastery radar across four pillars` → `mastery bars
  across seven competencies` (paragraph rewrapped to the file's 80-column style;
  no words changed).
- Honest limits: added the Kabsat AI grounding limit verbatim from the brief.
  No other limit added or removed.

## RED output

The shipped catalogue data already satisfies the new guards, so a plain first run
is green. To prove each guard can fail (and that it fails for the intended
reason, not a typo), I ran the new tests against a deliberately broken copy of
`capsule-106.json` / `catalogue.js`, then restored the originals byte-for-byte
(`capsule-106.json` diff-verified, `catalogue.js` SHA-256
`4317B98B…C3917` re-verified after restore).

**RED A — unknown difficulty (chunk k2 set to `expert`):**

```
 ❯ src/data/catalogue.test.js (12 tests | 1 failed)
 FAIL  src/data/catalogue.test.js > course catalogue > new capsule chunks use known bands and four to six lowercase keywords
AssertionError: capsule-106 k2 difficulty: expected [ 'foundational', 'core', 'stretch' ] to include 'expert'

 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
```

**RED B — keyword count (k2 given 3 keywords):**

```
AssertionError: capsule-106 k2 keyword count: expected 3 to be greater than or equal to 4

 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
```

**RED C — keyword case (k2 given `"Stock Card"`):**

```
AssertionError: capsule-106 k2 keyword must be lowercase: expected 'Stock Card' to be 'stock card' // Object.is equality
Expected: "stock card"
Received: "Stock Card"

 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
```

**RED D — seeded id typo (`SEEDED_IDS` given `capsule-999`):**

```
 FAIL  src/data/catalogue.test.js > course catalogue > only capsule 101 is seeded
 FAIL  src/data/catalogue.test.js > course catalogue > every seeded id exists in the capsule index
AssertionError: capsule-999: expected undefined to be truthy
- Expected:
true
+ Received:
undefined
 ❯ src/data/catalogue.test.js:48:37

 Test Files  1 failed (1)
      Tests  2 failed | 10 passed (12)
```

(`only capsule 101 is seeded` also failed because the mutation changed
`SEEDED_IDS`; that is expected and it passes again on the real data.)

## GREEN output

After restoring the data and applying only the briefed changes:

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  22 passed (22)
      Tests  132 passed (132)
   Duration  10.33s
VITEST_EXIT=0
```

`app/src/data/catalogue.test.js` alone: 12 passed (12).

## Verification commands and results

All run from `D:\Hackathon\Systems\System1\app`.

| Command | Result |
|---|---|
| `npx vitest run` | exit 0 — 22 files, 132 tests passed |
| `npx oxlint` | exit 0 — only pre-existing warnings in untouched files (`capsuleStore.js`, `Dashboard.jsx`, `i18n.jsx`, `QuizArena.jsx`, `rag.test.js`); no warning in any changed file |
| `npx vite build` | exit 0 — `✓ built in 1.03s`, PWA precache 14 entries |

## Changed files

- `app/src/ui/CourseHub.jsx` — family gradient via stop
- `app/src/App.jsx` — seed loop skips a missing capsule
- `app/src/data/catalogue.test.js` — two new guard tests, `BANDS` import
- `app/src/data/capsules/capsule-106.json` — q2 correct option text
- `DESIGN.md` — dashboard wording + new honest limit
- `task-7-report.md` — this report

Nothing else in the repository was modified. `app/src/data/catalogue.js` was
touched only as a temporary mutation fixture for RED D and restored; its SHA-256
matches the pre-mutation hash. `app/dist/` is regenerated by the required
`npx vite build` check.

## Notes for the controller

1. **One observed flaky full-suite run.** At 12:36 a `npx vitest run` produced 14
   failures across `App.test.jsx`, `kabsat-ai-background.test.jsx`,
   `QuizCoursePicker.test.jsx` (7) and `QuizArena.test.jsx` (5). These are the
   fake-timer/timing-heavy files, none touched by this task. Each affected file
   passes in isolation (`QuizCoursePicker.test.jsx`: 7/7), and two further
   consecutive full runs passed 132/132. It has not reproduced since; the
   failures appear load-related, not caused by this change. All 14 names are
   listed in the run above for the record.
2. **The brief's crash mechanism does not reproduce in this codebase.** The brief
   says `seedCapsule(undefined)` would "throw during hashing". In the current
   `lib/capsuleStore.js`, `seedCapsule` calls `installCapsule`, which validates
   first and returns `{ ok: false, error: 'schema' }` — it does not throw. I
   confirmed this empirically: with the guard removed and `capsule-999` seeded,
   the hub still left its loading state, so no existing test distinguishes the
   guarded from the unguarded loop. The guard is applied exactly as briefed and
   is harmless, and the new "every seeded id exists" test prevents the class of
   typo at test time.
3. `#115e59` is measured at 7.58:1 for white; the shipped card body text is
   white on this gradient, so it clears 4.5:1 at every stop.
