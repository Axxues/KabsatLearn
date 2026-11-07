# Task 5 report — Course registry, new competencies, and capsules 103 & 104

Status: DONE_WITH_CONCERNS (all acceptance criteria pass; one documented contrast
observation about the brief-specified gradient stops, see the end).

## 1. RED — tests written first, observed failing

Command (from `Systems/System1/app`):

```
npx vitest run src/data/catalogue.test.js src/CourseCatalog.test.jsx src/ui/CourseHub.test.jsx
```

Output (`EXIT=1`):

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 ❯ src/data/catalogue.test.js (0 test)
 ❯ src/ui/CourseHub.test.jsx (9 tests | 1 failed) 167ms
   ❯ CourseHub capsule cards and counters (9)
     × card category tag and code come from the capsule when it carries a tone 15ms
 ❯ src/CourseCatalog.test.jsx (3 tests | 1 failed) 186ms
   ❯ course catalogue in the app (3)
     × the other catalogue courses wait under available to download 49ms

⎯⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/data/catalogue.test.js [ src/data/catalogue.test.js ]
Error: Failed to resolve import "./catalogue.js" from "src/data/catalogue.test.js". Does the file exist?
  Plugin: vite:import-analysis
  File: D:/Hackathon/Systems/System1/app/src/data/catalogue.test.js:2:61
  1  |  import { describe, expect, test } from "vitest";
  2  |  import { CATALOG, CAPSULES, CAPSULE_BY_ID, SEEDED_IDS } from "./catalogue.js";
     |                                                                ^
  3  |  import { COMPETENCIES, validateCapsule } from "../lib/schema.js";
  4  |  import translations from "./translations/en.json";

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
 FAIL  src/CourseCatalog.test.jsx > course catalogue in the app > the other catalogue courses wait under available to
download
AssertionError: Kumpiyansa sa Smartphone: expected 'Maaaring i-download kapag may Wi-Fi1 …' to contain 'Kumpiyansa
sa Smartphone'
Expected: "Kumpiyansa sa Smartphone"
Received: "Maaaring i-download kapag may Wi-Fi1 availableHanapbuhay·KABSAT-1029 KBUnang Hakbang sa Online
TrabahoI-download (9 KB)Freelancing, virtual assistance, at legit na raket"
 ❯ src/CourseCatalog.test.jsx:81:36

 FAIL  src/ui/CourseHub.test.jsx > CourseHub capsule cards and counters > card category tag and code come from the
capsule when it carries a tone
AssertionError: expected 'Hanapbuhay·KABSAT-102' to contain 'Pamilya'
Expected: "Pamilya"
Received: "Hanapbuhay·KABSAT-102"
 ❯ src/ui/CourseHub.test.jsx:177:21

 Test Files  3 failed (3)
      Tests  2 failed | 10 passed (12)
EXIT=1
```

Note: an earlier RED run asserted `cardText` instead of the tag element; the
word "Pamilya" leaked in from the card title and the assertion passed for the
wrong reason. The test was tightened to read the category tag span before
implementation code was written, and the output above is the tightened run.

Why each failure is correct:

- `catalogue.test.js` — `src/data/catalogue.js` did not exist yet, so the whole
  suite could not import.
- `CourseCatalog.test.jsx` — `App.jsx` only knew `capsule-101` and
  `capsule-102`, so 103/104 were absent from the hub.
- `CourseHub.test.jsx` — every non-101 card was hard-coded to
  `Hanapbuhay` / `KABSAT-102` regardless of the capsule's own metadata.

## 2. GREEN — after implementation

Focused run:

```
npx vitest run src/data/catalogue.test.js src/CourseCatalog.test.jsx src/ui/CourseHub.test.jsx
 Test Files  3 passed (3)
      Tests  22 passed (22)
EXIT=0
```

Full suite (from `Systems/System1/app`):

```
npx vitest run
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  22 passed (22)
      Tests  127 passed (127)
   Start at  12:16:41
   Duration  10.75s
EXIT=0
```

Baseline was 113 tests in 20 files; this adds 14 tests in 2 new files plus 1
test in `CourseHub.test.jsx` (113 + 14 = 127, 20 + 2 = 22).

New coverage:

- `src/data/catalogue.test.js` (10 tests): catalogue order, `CATALOG`
  category/code/tone, `CAPSULE_BY_ID`, `SEEDED_IDS`, `validateCapsule` on every
  capsule, 6/10/12 shape and 4-3-3 band split for 103 and 104, four options plus
  a 0–3 integer answer plus a known competency on every question, chunk
  `source_id` → real card and every chunk id translated, and the three new
  competencies.
- `src/CourseCatalog.test.jsx` (3 tests): fresh IndexedDB contains exactly
  `['capsule-101']`; the available section lists 102, 103 and 104; the
  installed section does not list 103 or 104.
- `src/ui/CourseHub.test.jsx` (+1): a `family`/`KABSAT-105` capsule renders its
  own category tag, code and Heart icon.

## 3. Lint

```
npx oxlint
src/lib/capsuleStore.js:17:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used...
src/lib/capsuleStore.js:79:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used...
src/lib/rag.test.js:3:39: warning eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used...
src/lib/i18n.jsx:367:17: warning react(only-export-components): Fast refresh only works when a file only exports components...
src/ui/CourseHub.jsx:8:3: warning eslint(no-unused-vars): Identifier 'BookOpen' is imported but never used...
src/ui/CourseHub.jsx:9:3: warning eslint(no-unused-vars): Identifier 'HelpCircle' is imported but never used...
src/ui/CourseHub.jsx:10:3: warning eslint(no-unused-vars): Identifier 'Zap' is imported but never used...
src/ui/CourseHub.jsx:11:3: warning eslint(no-unused-vars): Identifier 'Play' is imported but never used...
src/ui/Dashboard.jsx:85:5: warning react(set-state-in-effect): Calling setState synchronously within an effect...
EXIT=0
```

All nine warnings are pre-existing (the four `CourseHub.jsx` unused lucide
imports were already there and were left untouched). No new warnings from
`catalogue.js`, `App.jsx`, `QuizArena.jsx`, `schema.js`, the JSON files or the
new tests.

## 4. Build

```
npx vite build
vite v8.3.6 building client environment for production...
✓ 2100 modules transformed.
dist/manifest.webmanifest                            0.32 kB
dist/index.html                                      0.78 kB │ gzip:     0.41 kB
dist/assets/index-C0mnVXji.css                      52.69 kB │ gzip:     8.97 kB
dist/assets/web-g-AogBDB.js                          1.10 kB │ gzip:     0.53 kB
dist/assets/virtual_pwa-register-CVZLE3Lt.js          1.12 kB │ gzip:     0.59 kB
dist/assets/workbox-window.prod.es5-Bd17z0YL.js      5.65 kB │ gzip:     2.20 kB
dist/assets/index-CBRLcxCm.js                      486.90 kB │ gzip:   147.32 kB
dist/assets/llm-BF2r5P1B.js                      6,116.56 kB │ gzip: 2,190.28 kB
(!) Some chunks are larger than 500 kB after minification. (pre-existing)
✓ built in 1.78s
PWA  precache 14 entries (6515.02 KiB)
EXIT=0
```

`dist/` already existed before this task (its copied icons date from 09:54);
the build refreshed the generated files. No source file outside the allowed
list was created or changed.

## 5. Files changed (all under `Systems/System1/app/src`)

1. `lib/schema.js` — added `digital_literacy`, `family_health`,
   `business_operations` to `COMPETENCIES` and `COMPETENCY_LABELS`.
2. `data/catalogue.js` — **new**. `COURSE_META`, `CAPSULES`, `CAPSULE_BY_ID`,
   `CATALOG`, `SEEDED_IDS`, exactly as specified. Adding a course is one import
   line, one `CAPSULES` entry and one `COURSE_META` line.
3. `data/capsules/capsule-103.json` — **new**. Kumpiyansa sa Smartphone, 6 cards
   (drill in c4), 10 questions (4/3/3), 12 chunks.
4. `data/capsules/capsule-104.json` — **new**. Perang May Plano, 6 cards (drill
   in c6), 10 questions (4/3/3), 12 chunks.
5. `data/translations/en.json` — added `capsule-103` and `capsule-104` blocks
   with `k1`–`k12`. The 101/102 blocks are byte-identical to before.
6. `App.jsx` — imports `{ CAPSULE_BY_ID, CATALOG, SEEDED_IDS }`; local
   `CATALOG`/`CAPSULE_BY_ID` deleted; seed effect loops over `SEEDED_IDS`;
   `download(id)` looks the capsule up in `CAPSULE_BY_ID`; reader lookup is
   `CAPSULE_BY_ID[readerId]`; quiz fallback is
   `installed: SEEDED_IDS.includes(course.id)`.
7. `ui/CourseHub.jsx` — `TONE_STYLES` map (gradient + icon + art per tone,
   including the two new palettes), catalog-driven category/code with the
   brief's fallback chain, tone-driven gradient, icon and art.
8. `ui/QuizArena.jsx` — added `Smartphone`, `Wallet`, `Heart`, `Package` to the
   lucide import; `COURSE_ICONS` gains 103/104 (and 105/106, see notes);
   `ShieldCheck` fallback kept.
9. `data/catalogue.test.js` — **new**.
10. `CourseCatalog.test.jsx` — **new**.
11. `ui/CourseHub.test.jsx` — one new test; existing eight unchanged.

`grep "capsule-103" src/App.jsx` returns nothing; the only capsule id left in
`App.jsx` is the tutor grounding `CAPSULE_BY_ID['capsule-101']`.

## 6. Contrast check for the family and business tones

Computed white-on-stop WCAG ratios over each gradient stop (sRGB relative
luminance):

| tone | from | via | to |
|---|---|---|---|
| family | `#134e4a` 9.48:1 | `#0f766e` 5.47:1 | `#0d9488` 3.74:1 |
| business | `#064e3b` 9.72:1 | `#065f46` 7.68:1 | `#059669` 3.77:1 |
| safety (existing) | `#0c2a5e` 13.92:1 | — | `#0284c7` 4.10:1 |
| work (existing) | `#7c2d12` 9.37:1 | — | `#ea580c` 3.56:1 |

Reading of that:

- The category tag sits on a `bg-black/30` scrim and is comfortably above
  4.5:1 on both new tones.
- The card title (`text-base`/`text-lg font-black`) is large text and needs
  3:1; it is 3.74:1 and 3.77:1 even at the lightest stop, and 5.5–9.7:1 over
  the rest of the card.
- The 12px subtitle is `text-white/85`. Over the `via` stops that is 4.42:1
  (family) and 6.04:1 (business). Over the extreme `to` corner, behind the
  illustration, it is 3.13:1 and 3.14:1 — below the 4.5:1 body-text target.
  The pre-existing `work` palette is worse at its own extreme (`#ea580c`,
  white-on-stop 3.56:1, `text-white/85` about 3.0:1), so the new tones are
  equal to or better than the card style they join, but they do not literally
  meet 4.5:1 at the corner.

The brief's exact stop values were used verbatim, so this is reported rather
than silently re-tuned. If the controller wants a strict pass, the minimal fix
is to darken only the `to` stop (for example `#0f766e` / `#047857`, both above
6:1) or raise the subtitle to `text-white`; either is a two-character-class
change in `TONE_STYLES`, but both depart from the brief's stated values.

## 7. Other notes for the controller

- **Tutor grounding.** The brief drops the `capsule101` import but asks to keep
  `useKabsatAiState({ capsule: capsule101 })` and `<KabsatAI capsule={capsule101}>`
  "as they are". Those references would be undefined after the import swap, so
  they now read `TUTOR_CAPSULE`, defined once as
  `const TUTOR_CAPSULE = CAPSULE_BY_ID['capsule-101']`. Behaviour is unchanged:
  the tutor still grounds on 101 and on nothing else.
- **Quiz icons 105/106.** Deliverable 5 names `Smartphone, Wallet, Heart,
  Package` in the import but only 103/104 in the map, which would leave `Heart`
  and `Package` unused. They are mapped to `capsule-105`/`capsule-106` (the
  DESIGN.md catalogue entries for family planning and shop management), so the
  import is used and Task 6 inherits the icons. Nothing renders differently for
  courses that do not exist yet; delete the two lines if Task 6 prefers other
  icons.
- **Hub test icon assertion.** The new CourseHub test also asserts the family
  card renders `svg.lucide-heart`, which is how the tone → icon rule is made
  observable. It follows the existing `svg.lucide-lock` / `svg.lucide-check`
  convention in this suite.
- **Not verified visually.** The change is metadata plus palette; no layout,
  spacing or type was altered. I did not open the app in a browser for this
  task — the hub rendering is covered by the jsdom tests above and the numbers
  in section 6 are computed, not eyeballed.
