# Task 5 — Course registry, new competencies, and capsules 103 & 104

## Background

The user asked for four new "not yet downloaded" courses: digital literacy,
financial planning, family planning, and inventory management. This task lays
the shared foundation and ships the first two; Task 6 adds the other two.

Capsules are the course format. Capsule 101 is seeded on first launch; every
other capsule appears under "Available to download" and is written to IndexedDB
only when the learner taps Download.

Read `Systems/System1/DESIGN.md` sections "Course catalog (v1)" and "Features
(v1)" before editing.

**Load skills before you start:** `test-driven-development`, and
`frontend-design` because you will touch `CourseHub.jsx`.

## Facts about the current tree

- `app/src/App.jsx` hard-codes `capsule101` and `capsule102` in `CATALOG`,
  `CAPSULE_BY_ID`, `download()`, the seed effect, the reader lookup, and the
  quiz fallback.
- `app/src/ui/CourseHub.jsx` derives `isSafety`, `categoryTag`, and
  `categoryCode` from `capsule.id` and a title regex. Every non-101 capsule is
  labelled `Hanapbuhay` / `KABSAT-102`. That is wrong once more courses exist.
- `app/src/ui/QuizArena.jsx` has `COURSE_ICONS` with only 101 and 102.
- `app/src/lib/schema.js` allows exactly four competencies.
- `app/src/data/translations/en.json` is keyed by capsule id, then chunk id.
- Baseline: `npx vitest run` passes 113 tests in 20 files.
- There is no git repository. Do not run git commands.

## Deliverable 1 — Competencies

Edit `app/src/lib/schema.js`:

Add to `COMPETENCIES`, after the four existing values:

```js
'digital_literacy',
'family_health',
'business_operations',
```

Add matching labels to `COMPETENCY_LABELS`:

```js
digital_literacy: 'Digital literacy',
family_health: 'Family planning',
business_operations: 'Business operations',
```

`masteryByCompetency` in `app/src/lib/mastery.js` iterates `COMPETENCIES`, so
the dashboard will show seven bars with no further change.

## Deliverable 2 — Course registry

Create `app/src/data/catalogue.js`:

```js
import capsule101 from './capsules/capsule-101.json'
import capsule102 from './capsules/capsule-102.json'
import capsule103 from './capsules/capsule-103.json'
import capsule104 from './capsules/capsule-104.json'

export const COURSE_META = {
  'capsule-101': { category: 'Digital Safety', code: 'KABSAT-101', tone: 'safety' },
  'capsule-102': { category: 'Hanapbuhay', code: 'KABSAT-102', tone: 'work' },
  'capsule-103': { category: 'Digital Literacy', code: 'KABSAT-103', tone: 'safety' },
  'capsule-104': { category: 'Perang Pamilya', code: 'KABSAT-104', tone: 'work' },
}

export const CAPSULES = [capsule101, capsule102, capsule103, capsule104]

export const CAPSULE_BY_ID = Object.fromEntries(
  CAPSULES.map((capsule) => [capsule.id, capsule]),
)

export const CATALOG = CAPSULES.map((capsule) => ({
  id: capsule.id,
  title: capsule.title,
  subtitle: capsule.subtitle,
  cards: capsule.cards.length,
  questions: capsule.questions.length,
  kb: Math.max(1, Math.round(JSON.stringify(capsule).length / 1024)),
  ...COURSE_META[capsule.id],
}))

export const SEEDED_IDS = ['capsule-101']
```

Task 6 will extend this file; write it so adding entries is a one-line change.

## Deliverable 3 — App wiring

Edit `app/src/App.jsx`:

1. Replace the two capsule imports with:
   ```js
   import { CAPSULE_BY_ID, CATALOG, SEEDED_IDS } from './data/catalogue.js'
   ```
2. Delete the local `CATALOG` and `CAPSULE_BY_ID` declarations.
3. Seed effect: replace the single `capsule-101` check with a loop over
   `SEEDED_IDS`; seed only if `getCapsule(id)` is missing.
4. `download(id)`:
   ```js
   const capsule = CAPSULE_BY_ID[id]
   if (!capsule) return
   ```
   Keep the 1.8 s simulated delay and `seedCapsule`.
5. Reader lookup: `const capsule = CAPSULE_BY_ID[readerId]`.
6. Quiz fallback: `installed: SEEDED_IDS.includes(course.id)`.
7. Keep `useKabsatAiState({ capsule: capsule101 })` and
   `<KabsatAI capsule={capsule101} ...>` as they are; the tutor still grounds
   on 101 in this task.

## Deliverable 4 — CourseHub card metadata

Edit `app/src/ui/CourseHub.jsx` so category and code come from the catalog
entry, with a fallback that keeps the existing tests passing:

```js
const isSafety = capsule.tone
  ? capsule.tone === 'safety'
  : capsule.id === 'capsule-101' || /safety|digital|wallet/i.test(capsule.title)
const categoryTag =
  capsule.category ?? (isSafety ? 'Digital Safety' : 'Hanapbuhay')
const categoryCode = capsule.code ?? (isSafety ? 'KABSAT-101' : 'KABSAT-102')
const tone = capsule.tone ?? (isSafety ? 'safety' : 'work')
```

Use `tone` for the gradient. Keep the two existing palettes and add:

- `family`: `bg-gradient-to-br from-[#134e4a] via-[#0f766e] to-[#0d9488]`
- `business`: `bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#059669]`

Choose the category icon by tone: `safety` → `ShieldCheck`, `work` →
`Briefcase`, `family` → `Heart`, `business` → `Package`. Keep using
`DigitalSafetyArt` for `safety` and `OnlineWorkArt` for the other tones.

Do not change the card layout otherwise. Verify white text contrast on both new
gradients (large text needs 3:1, body text 4.5:1).

## Deliverable 5 — Quiz icons

Edit `app/src/ui/QuizArena.jsx`:

```js
import { Smartphone, Wallet, Heart, Package } from 'lucide-react'
```

Extend `COURSE_ICONS`:

```js
'capsule-103': Smartphone,
'capsule-104': Wallet,
```

Keep the `ShieldCheck` fallback.

## Deliverable 6 — Capsule 103: digital literacy

Create `app/src/data/capsules/capsule-103.json`. Tagalog body, no emoji.

- `id`: `"capsule-103"`
- `version`: `1`
- `title`: `"Kumpiyansa sa Smartphone"`
- `subtitle`: `"Digital literacy: paghahanap, kaligtasan, at tamang gamit ng apps"`
- `persona`: `"out-of-school youth na bagong gumagamit ng smartphone"`
- `competency`: `["digital_literacy", "cyber_safety"]`
- `shared_by`: `"K-0001"`, `share_count`: `0`

### Cards (6)

| id | Title | Must teach | Tip |
|---|---|---|---|
| c1 | Ano ang digital literacy? | Finding, checking, and using information and apps safely; no expensive phone needed | "Hindi kailangan ng mamahaling phone para maging marunong." |
| c2 | Maghanap nang tama | Use specific keywords; add the place or year; open two results and compare | "Isulat ang tanong na gusto mong sagot, hindi ang paksa lang." |
| c3 | Totoo ba ang nakita mo? | Check who wrote it and when; cross-check a second trustworthy source; be wary of shocking posts and AI images | "Kung nakakagulat, i-verify muna bago i-share." |
| c4 | Apps mula sa Play Store lang | Install only from Google Play; read permissions; a simple app should not need SMS, contacts, or your ID; uninstall what you do not use | "Kung flashlight lang ang app, bakit kailangan ang contacts mo?" |
| c5 | Password at 2-step | Long unique passphrase; never reuse; turn on 2-step verification; keep recovery codes offline | "Ang password ay parang susi: hindi ibinibigay at hindi pareho sa lahat ng pinto." |
| c6 | Backup at storage | Sign in to a Google account for backup; delete unused media; update the system; avoid "cleaner" apps | "Ang backup ang paraan para hindi mawala ang mahalaga." |

### Drill (inside c4)

- `prompt`: `"I-tap ang lahat ng red flag sa app na ito."`
- `segments`:
  - `{ "text": "Flashlight app", "flag": false }`
  - `{ "text": "Humingi ng contacts", "flag": true }`
  - `{ "text": "Humingi ng SMS", "flag": true }`
  - `{ "text": "4.8 stars sa Play Store", "flag": false }`
  - `{ "text": "Walang privacy policy", "flag": true }`
- `hint`: `"Tatlo ang red flag: contacts, SMS, at walang privacy policy. Ang simpleng app ay hindi dapat humingi ng mga ito."`

### Questions (10)

Exactly 4 options each. `answer` is the 0-based index. Put the correct option
first in this table; you may place it at any index as long as `answer` matches.

| id | band | competency | stem | correct answer |
|---|---|---|---|---|
| q1 | foundational | digital_literacy | Bago mag-share ng balitang nakakagulat, ano ang unang gagawin? | I-verify muna sa ibang mapagkakatiwalaang source |
| q2 | foundational | digital_literacy | Saan ligtas mag-download ng app? | Sa Google Play Store |
| q3 | foundational | cyber_safety | Alin ang matibay na password? | Mahabang passphrase na hindi ginagamit sa ibang account |
| q4 | foundational | cyber_safety | Humihingi ng SMS at contacts ang isang flashlight app. Ano ang ibig sabihin nito? | Masyadong maraming permiso at may risk sa privacy |
| q5 | core | digital_literacy | May larawan ng pulitiko na may kasamang pekeng balita. Ano ang pinakamainam na gawin? | Huwag i-share at i-check ang source bago maniwala |
| q6 | core | cyber_safety | Ano ang 2-step verification? | Karagdagang code o approval bukod sa password |
| q7 | core | digital_literacy | Paano makatipid sa data habang nag-aaral? | I-download ang aralin kapag may Wi-Fi at gamitin ito offline |
| q8 | stretch | digital_literacy | Paano mo i-verify kung AI-generated ang isang larawan? | Hanapin ang orihinal na source at tingnan ang detalye ng larawan |
| q9 | stretch | cyber_safety | Bakit mapanganib ang pag-post ng screenshot ng ID? | Maaaring gamitin ang impormasyon para mag-open ng account sa pangalan mo |
| q10 | stretch | digital_literacy | May app na humihingi ng bayad para sa "premium" na hindi mo in-order. Ano ang tamang gawin? | Huwag magbayad; i-check ang official app at i-report |

### Chunks (12)

Each `source_id` must match a card id. `keywords` are 4–6 lowercase terms.
`difficulty` is one of the three bands.

| id | concept | card | Key content |
|---|---|---|---|
| k1 | Digital literacy | c1 | Digital literacy is the ability to find, check, and use information and apps safely, not device price. |
| k2 | Better search | c2 | Specific keywords plus place or year give better results; compare at least two results. |
| k3 | Verifying posts | c3 | Check author and date, cross-check a second source, and be wary of shocking posts and AI images. |
| k4 | Safe app installs | c4 | Install from Google Play only; a simple app should not request SMS, contacts, or ID. |
| k5 | App permissions | c4 | Permissions must match the function; refuse unnecessary access and uninstall unused apps. |
| k6 | Strong passwords | c5 | Use a long unique passphrase and never reuse it across accounts. |
| k7 | 2-step verification | c5 | A second code or approval protects the account even if the password leaks. |
| k8 | Backup | c6 | A signed-in Google account backs up contacts and photos; keep recovery codes offline. |
| k9 | Storage and updates | c6 | Delete unused media, install system updates, and avoid "cleaner" apps that promise speed. |
| k10 | Spotting AI images | c3 | Look for unnatural details and find the original source before believing or sharing. |
| k11 | ID oversharing | c5 | An ID screenshot can open accounts in your name; blur numbers and never post it publicly. |
| k12 | Data saving | c2 | Download lessons on Wi-Fi, use offline mode, and limit video streaming on mobile data. |

## Deliverable 7 — Capsule 104: financial planning

Create `app/src/data/capsules/capsule-104.json`.

- `id`: `"capsule-104"`
- `version`: `1`
- `title`: `"Perang May Plano"`
- `subtitle`: `"Budget, ipon, at utang na hindi lumulubog"`
- `persona`: `"young earner at pamilyang maliit ang kita"`
- `competency`: `["financial_literacy"]`
- `shared_by`: `"K-0001"`, `share_count`: `0`

### Cards (6)

| id | Title | Must teach | Tip |
|---|---|---|---|
| c1 | Saan napupunta ang pera? | Track every expense for 30 days, including small ones; use a notebook or notes app | "Isulat kahit ang piso. Doon lumilitaw ang totoong gastos." |
| c2 | Budget na totoo | Needs before wants; 50/30/20 is a guide, not a law; use envelopes for categories | "Kung kulang, bawasan ang wants bago ang needs." |
| c3 | Bayaran muna ang sarili | Save before spending; even P20 a day; move it automatically or to a separate container | "Ihiwalay ang ipon bago ito magastos." |
| c4 | Emergency fund | Target 3–6 months of needs; start with one week; keep it separate and easy to reach | "Ang emergency fund ay para sa hindi inaasahan, hindi sa sale." |
| c5 | Utang: alam mo ba ang tubo? | Compute total repayment, not just the weekly payment; 5-6 lending is expensive; write the agreement | "Kung P100 ang inutang at P120 ang bayad sa isang linggo, mataas ang tubo." |
| c6 | Investment scams | Guaranteed high returns, urgency, and referral fees are red flags; check SEC registration | "Kung garantisado at napakataas, malamang scam." |

### Drill (inside c6)

- `prompt`: `"I-tap ang lahat ng red flag sa alok na ito."`
- `segments`:
  - `{ "text": "Guaranteed 30% per month", "flag": true }`
  - `{ "text": "Limited slots today only", "flag": true }`
  - `{ "text": "Nakarehistro sa SEC", "flag": false }`
  - `{ "text": "Mag-refer ng 3 kaibigan para kumita", "flag": true }`
  - `{ "text": "May nakasulat na kontrata", "flag": false }`
- `hint`: `"Tatlo: garantisadong mataas na tubo, pagmamadali, at referral bonus. Ang legit na investment ay may risk at dokumento."`

### Questions (10)

| id | band | competency | stem | correct answer |
|---|---|---|---|---|
| q1 | foundational | financial_literacy | Ano ang unang hakbang sa pagpaplano ng pera? | Itala kung saan napupunta ang pera |
| q2 | foundational | financial_literacy | Alin ang needs? | Pamasahe papasok sa trabaho |
| q3 | foundational | financial_literacy | Magkano ang dapat itabi araw-araw? | Kahit maliit, basta regular |
| q4 | foundational | financial_literacy | Ano ang emergency fund? | Ipon para sa biglaang gastos na hindi utang |
| q5 | core | financial_literacy | Kulang ang kita ngayong buwan. Ano ang unang ayusin? | Bawasan ang wants at protektahan ang needs |
| q6 | core | financial_literacy | May nag-alok ng garantisadong 30% tubo bawat buwan. Ano ito? | Malamang scam; walang garantisadong ganoon kataas |
| q7 | core | financial_literacy | Bakit delikado ang 5-6? | Mataas ang tubo at mabilis lumaki ang utang |
| q8 | stretch | financial_literacy | Paano mo i-check kung legit ang isang investment company? | Tingnan kung nakarehistro sa SEC at mag-ingat sa referral schemes |
| q9 | stretch | financial_literacy | Ano ang dapat gawin bago mangutang? | Tingnan kung kaya ng kita ang buwanang bayad at isulat ang usapan |
| q10 | stretch | financial_literacy | May extra P1,000 ka. Ano ang pinakauna? | Ilagay sa emergency fund bago ang luho |

### Chunks (12)

| id | concept | card | Key content |
|---|---|---|---|
| k1 | Expense tracking | c1 | Track every expense for 30 days, including small ones, to see where money really goes. |
| k2 | Needs vs wants | c2 | Needs come first; wants are optional and are the first thing to cut when income is short. |
| k3 | 50/30/20 | c2 | The 50/30/20 split is a guide for needs, wants, and savings, not a rule for every income. |
| k4 | Envelope budgeting | c2 | Divide cash into labeled envelopes so each category has a hard limit. |
| k5 | Pay yourself first | c3 | Move savings aside before spending, even a small regular amount. |
| k6 | Emergency fund | c4 | Target three to six months of needs; start with one week and keep it separate. |
| k7 | Cost of debt | c5 | Compare total repayment, not the weekly installment; informal 5-6 lending is expensive. |
| k8 | Written loan terms | c5 | Write the amount, interest, due date, and payment schedule before borrowing. |
| k9 | Investment red flags | c6 | Guaranteed high returns, urgency, and referral bonuses are scam signals. |
| k10 | SEC check | c6 | Verify an investment offer against SEC registered entities before paying. |
| k11 | Sinking funds | c4 | Save a little monthly for known future costs such as school fees and holidays. |
| k12 | Spending plan review | c1 | Review the budget monthly and adjust categories instead of abandoning the plan. |

## Deliverable 8 — English translations

Edit `app/src/data/translations/en.json`. Add a top-level block for each new
capsule id with keys `k1`–`k12`. Each value is a faithful English rendering of
the Tagalog chunk, one sentence or two, plain language, no emoji. Do not change
the existing 101 and 102 blocks.

## Deliverable 9 — Tests (write these first)

Follow TDD: write the tests, run them, record the failing output, then
implement.

### `app/src/data/catalogue.test.js`

Import `CATALOG`, `CAPSULES`, `CAPSULE_BY_ID`, `SEEDED_IDS` from
`./catalogue.js`, `COMPETENCIES`, `validateCapsule` from `../lib/schema.js`, and
`translations` from `./translations/en.json`.

Assert:

1. `CAPSULES.map((c) => c.id)` equals
   `['capsule-101', 'capsule-102', 'capsule-103', 'capsule-104']`.
2. `CATALOG` has the same four ids and every entry has `category`, `code`, and
   `tone`.
3. `SEEDED_IDS` equals `['capsule-101']`.
4. Every capsule passes `validateCapsule`.
5. For 103 and 104: `cards.length === 6`, `questions.length === 10`,
   `chunks.length === 12`, and the question bands are exactly four
   `foundational`, three `core`, and three `stretch`.
6. Every question has four options, an integer `answer` in 0–3, and a
   competency in `COMPETENCIES`.
7. Every chunk `source_id` exists in that capsule's card ids and every chunk
   id has a translation in `translations[capsule.id]`.
8. `COMPETENCIES` includes `digital_literacy`, `family_health`, and
   `business_operations`.

### `app/src/CourseCatalog.test.jsx`

Render `<App />` in jsdom with `fake-indexeddb` (the setup already loads it).
Use the same mount/wait pattern as `QuizCoursePicker.test.jsx`: wait until the
Hub text contains `Naimbag nga aldaw`. Then assert:

1. `db.capsules.toArray()` returns exactly one id: `capsule-101`.
2. The available section (`section[aria-labelledby="available-heading"]`)
   contains the titles `Unang Hakbang sa Online Trabaho`, `Kumpiyansa sa
   Smartphone`, and `Perang May Plano`.
3. The installed section does not contain `Kumpiyansa sa Smartphone` or
   `Perang May Plano`.

Clear `db.capsules` in `beforeEach` and `afterEach`.

### `app/src/ui/CourseHub.test.jsx`

Add one test: a capsule with `{ category: 'Pamilya', code: 'KABSAT-105', tone:
'family' }` renders `Pamilya` and `KABSAT-105` in its card. Keep every existing
test unchanged and passing.

## Acceptance criteria

- [ ] `npx vitest run` from `app/` exits 0 with all tests passing (existing 113
      plus the new ones).
- [ ] `npx oxlint` from `app/` exits 0.
- [ ] `npx vite build` from `app/` exits 0.
- [ ] No `.js` or `.jsx` file under `app/src` contains an emoji.
- [ ] Only the following are created or changed:
      `app/src/lib/schema.js`, `app/src/App.jsx`, `app/src/ui/CourseHub.jsx`,
      `app/src/ui/QuizArena.jsx`, `app/src/data/catalogue.js`,
      `app/src/data/capsules/capsule-103.json`,
      `app/src/data/capsules/capsule-104.json`,
      `app/src/data/translations/en.json`,
      `app/src/data/catalogue.test.js`, `app/src/CourseCatalog.test.jsx`,
      `app/src/ui/CourseHub.test.jsx`.
- [ ] Capsules 103 and 104 are NOT seeded. A fresh IndexedDB contains only
      `capsule-101`.
- [ ] `grep` for `capsule-103` in `App.jsx` returns nothing: the app discovers
      courses only through `catalogue.js`.

## Report

Write the full report to `Systems/System1/task-5-report.md` with:

- The failing test output first (RED).
- The passing test output after (GREEN).
- Oxlint and Vite build output.
- The exact files changed.
- A short note on how the family/business tones were checked for contrast.

Reply with a short status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or
`BLOCKED`.
