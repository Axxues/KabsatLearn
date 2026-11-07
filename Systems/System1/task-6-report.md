# Task 6 report — capsules 105 and 106

Status: DONE

## What was done

- Added `capsule-105` ("Plano ng Pamilya") and `capsule-106` ("Tindahang Maayos"):
  six cards each, one red-flag drill inside 105/c5 and 106/c4, ten questions
  (4 foundational / 3 core / 3 stretch) with four options each, twelve chunks with
  4–6 lowercase keywords and card-backed `source_id`, English translations for
  every chunk.
- Registered both in `catalogue.js` with the exact `COURSE_META` lines from the
  brief and appended them to `CAPSULES`. `SEEDED_IDS` untouched.
- Confirmed `QuizArena.jsx` already had the `Heart` and `Package` imports and the
  `capsule-105` / `capsule-106` icon mappings from Task 5; no edit needed.
- Contrast fix in `CourseHub.jsx`: family `to` stop `#0d9488` → `#0f766e`,
  business `to` stop `#059669` → `#047857`, subtitle `text-white/85` → `text-white`.
  Safety and work gradients untouched.

## RED — tests written first, failing before implementation

Command: `npx vitest run` from `Systems/System1/app`

```
 FAIL  src/CourseCatalog.test.jsx > course catalogue in the app > the other catalogue courses wait under available to download
AssertionError: Plano ng Pamilya: expected 'Maaaring i-download kapag may Wi-Fi3 ...' to contain 'Plano ng Pamilya'

 FAIL  src/data/catalogue.test.js > course catalogue > lists the shipped capsules in order
AssertionError: expected [ 'capsule-101', 'capsule-102', ...(2) ] to deeply equal [ 'capsule-101', 'capsule-102', ...(4) ]

 FAIL  src/data/catalogue.test.js > course catalogue > catalog summary carries id plus category, code and tone for every course
AssertionError: expected [ { id: 'capsule-101', ...(8) }, ...(3) ] to have a length of 6 but got 4

 FAIL  src/data/catalogue.test.js > course catalogue > new capsules ship six cards, ten questions and twelve chunks
AssertionError: capsule-105: expected undefined to be truthy

 FAIL  src/data/catalogue.test.js > course catalogue > new capsules spread questions across the three bands
TypeError: Cannot read properties of undefined (reading 'questions')

 Test Files  2 failed | 20 passed (22)
      Tests  5 failed | 122 passed (127)
```

All five failures are the new expectations (missing registry entries, missing
capsules, missing available-section titles); no unrelated test failed.

## GREEN — after implementation

Command: `npx vitest run` from `Systems/System1/app`, exit code 0

```
 RUN  v5.1.0 D:/Hackathon/Systems/System1/app

 Test Files  22 passed (22)
      Tests  127 passed (127)
   Start at  12:22:45
   Duration  9.31s
```

## Lint

Command: `npx oxlint` from `Systems/System1/app`, exit code 0

```
src/lib/rag.test.js:3:39: warning eslint(no-unused-vars): Identifier 'SYSTEM_PROMPT' is imported but never used.
src/lib/i18n.jsx:367:17: warning react(only-export-components): Fast refresh only works when a file only exports components.
src/lib/capsuleStore.js:17:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/lib/capsuleStore.js:79:11: warning eslint(no-unused-vars): Variable 'hash' is declared but never used.
src/ui/CourseHub.jsx:8:3: warning eslint(no-unused-vars): Identifier 'BookOpen' is imported but never used.
src/ui/CourseHub.jsx:9:3: warning eslint(no-unused-vars): Identifier 'HelpCircle' is imported but never used.
src/ui/CourseHub.jsx:10:3: warning eslint(no-unused-vars): Identifier 'Zap' is imported but never used.
src/ui/CourseHub.jsx:11:3: warning eslint(no-unused-vars): Identifier 'Play' is imported but never used.
src/ui/Dashboard.jsx:85:5: warning react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
```

All warnings pre-date this task; none are new. The unused CourseHub imports
(`BookOpen`, `HelpCircle`, `Zap`, `Play`) were already there and were left alone
to keep the change scoped.

## Build

Command: `npx vite build` from `Systems/System1/app`, exit code 0

```
vite v8.3.6 building client environment for production...
transforming...
✓ 2102 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                            0.78 kB │ gzip:     0.41 kB
dist/assets/index-Dq2VeDsV.css            52.50 kB │ gzip:     8.99 kB
dist/assets/index-ex21K2LV.js            506.54 kB │ gzip:   152.69 kB
dist/assets/llm-CXJJZIjj.js            6,116.56 kB │ gzip: 2,190.28 kB
(!) Some chunks are larger than 500 kB after minification. (warning only)
✓ built in 1.23s
PWA v2.0.0
precache  14 entries (6534.02 KiB)
files generated
  dist/sw.js
  dist/workbox-9c191d2f.js
```

The chunk-size warning is the pre-existing web-llm bundle, not a new failure.

## Emoji check

Command (node, from `app/`):

```
node -e "...walk src, test /\p{Extended_Pictographic}/u on *.js/*.jsx..."
```

Result: `no emoji in app/src .js/.jsx`.

## Contrast ratios (white text on each gradient stop)

Relative luminance per WCAG 2.x sRGB formula; ratio = 1.05 / (L + 0.05).

| Tone | Stop | Hex | L | White-on-stop |
|---|---|---|---|---|
| family | from | `#134e4a` | 0.0608 | **9.48:1** |
| family | via | `#0f766e` | 0.1418 | **5.47:1** |
| family | to | `#0f766e` | 0.1418 | **5.47:1** |
| business | from | `#064e3b` | 0.0580 | **9.72:1** |
| business | via | `#065f46` | 0.0867 | **7.68:1** |
| business | to | `#047857` | 0.1415 | **5.48:1** |

Every stop is at least 4.5:1, so the 12px subtitle passes with `text-white` at
every point of both gradients (interpolated colours sit between these stops and
are darker than the lightest one, so their ratios are >= 5.47:1). The family
`via` and `to` stops are now the same value because the brief specified
`to: #0f766e`; the visible gradient still runs from the dark `from` stop to that
`to` stop.

## Changed files

- `app/src/data/catalogue.js` — imports, two `COURSE_META` entries, `CAPSULES` append
- `app/src/data/capsules/capsule-105.json` — new
- `app/src/data/capsules/capsule-106.json` — new
- `app/src/data/translations/en.json` — blocks `capsule-105`, `capsule-106` appended
- `app/src/ui/CourseHub.jsx` — family/business `to` stops, subtitle to `text-white`
- `app/src/data/catalogue.test.js` — six-id order, `NEW_IDS` covers 105/106, `CATALOG` length
- `app/src/CourseCatalog.test.jsx` — available titles include the two new courses; installed section asserts neither appears

No other file was edited. `QuizArena.jsx` needed no change (Heart/Package were
already imported and mapped). `SEEDED_IDS` is still `['capsule-101']`, so
capsules 105 and 106 are not seeded; the fresh-install test still passes with only
`capsule-101` in IndexedDB.

## Wording note

No brief-specified string was changed: titles, subtitles, personas, tips, drill
prompts/segments/hints, question stems, correct-answer text and chunk concepts are
verbatim. Prose not dictated by the brief (card bodies, wrong-answer options,
chunk sentences, keyword lists, English translations) was written to match the
"must teach" and "key content" columns; no medical claim beyond those facts was
added. Family-planning copy does not promise effectiveness figures, does not
describe how to perform any procedure, and routes side effects and method choice
to a midwife, doctor, or health worker, consistent with DESIGN.md's honest-limits
note that this content needs review by a licensed midwife or physician.
