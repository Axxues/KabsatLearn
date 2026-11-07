# Task 6 — Capsules 105 & 106: family planning and inventory management

## Background

Task 5 created the course registry and shipped capsules 103 (digital literacy)
and 104 (financial planning). This task adds the last two courses the user
asked for: family planning and inventory management. Both must appear under
"Available to download" and must not be seeded.

Read `Systems/System1/DESIGN.md` sections "Course catalog (v1)" and "Honest
limits" first. The family-planning capsule is health-adjacent; accuracy matters
more than tone.

**Load skills before starting:** `test-driven-development`, and
`frontend-design` because you will touch `CourseHub.jsx` metadata handling.

## Current state after Task 5

- `app/src/data/catalogue.js` exports `COURSE_META`, `CAPSULES`,
  `CAPSULE_BY_ID`, `CATALOG`, and `SEEDED_IDS = ['capsule-101']`.
- `app/src/lib/schema.js` already includes `digital_literacy`, `family_health`,
  and `business_operations`.
- `app/src/ui/CourseHub.jsx` already supports the `family` and `business`
  tones and reads `category`, `code`, and `tone` from the catalog entry.
- `app/src/ui/QuizArena.jsx` maps 101–104 to icons.
- `app/src/data/translations/en.json` has blocks for 101–104.

If any of that is not true, stop and reply `NEEDS_CONTEXT` with what you found.

## Deliverable 1 — Registry entries

Edit `app/src/data/catalogue.js`:

1. Import `capsule105` and `capsule106` from their JSON files.
2. Add to `COURSE_META`:
   ```js
   'capsule-105': { category: 'Pamilya', code: 'KABSAT-105', tone: 'family' },
   'capsule-106': { category: 'Negosyo', code: 'KABSAT-106', tone: 'business' },
   ```
3. Append both to `CAPSULES`.

Do not change `SEEDED_IDS`.

## Deliverable 2 — Quiz icons

Task 5 already mapped `capsule-105` to `Heart` and `capsule-106` to `Package`
in `app/src/ui/QuizArena.jsx`. Open the file and confirm both lines exist. Add
the `lucide-react` imports only if they are missing. Do not remove them.

## Deliverable 2b — Contrast fix for the new tones

Task 5 reported that the family and business gradients fall below 4.5:1 for the
12px subtitle at their lightest `to` stop. Fix it in
`app/src/ui/CourseHub.jsx`:

1. Change the family `to` stop from `#0d9488` to `#0f766e`.
2. Change the business `to` stop from `#059669` to `#047857`.
3. Change the subtitle from `text-white/85` to `text-white`.

Do not change the safety or work gradients. Recompute and record the
white-on-stop ratio for both new tones in the report; each must be at least
4.5:1 at every stop.

## Deliverable 3 — Capsule 105: family planning

Create `app/src/data/capsules/capsule-105.json`. Tagalog body, no emoji,
non-judgmental, medically accurate.

- `id`: `"capsule-105"`
- `version`: `1`
- `title`: `"Plano ng Pamilya"`
- `subtitle`: `"Family planning, birth spacing, at malusog na desisyon"`
- `persona`: `"magulang at mag-asawang pumipili ng paraan ng family planning"`
- `competency`: `["family_health"]`
- `shared_by`: `"K-0001"`, `share_count`: `0`

### Cards (6)

| id | Title | Must teach | Tip |
|---|---|---|---|
| c1 | Ano ang family planning? | Deciding whether, when, and how many children; includes health, fertility awareness, and contraception; a couple's decision with health-worker guidance | "Hindi ito tungkol sa pagpigil lang; tungkol ito sa planong kaya ng pamilya." |
| c2 | Birth spacing | At least two years between births gives the mother time to recover and lowers risk; ask a midwife or doctor for personal advice | "Tanungin ang midwife o doktor kung ano ang ligtas para sa inyo." |
| c3 | Mga paraan | Natural (calendar, LAM, BBT), barrier (condom), hormonal (pills, injectable, implant), long-acting (IUD), permanent (BTL, vasectomy); effectiveness varies; choose with a health worker | "Walang isang paraan na tama sa lahat." |
| c4 | Condom lang ang proteksyon sa STI | Hormonal methods, IUD, BTL, and vasectomy do not protect against HIV or other STIs; condoms do | "Para sa STI, kailangan ng condom, hindi lang pills." |
| c5 | Saan makakakuha | Barangay health center, RHU, and public hospitals; RA 10354 guarantees access to family planning information and services; usually free or low cost; ask about side effects and follow-up | "Libre o mura ang serbisyo sa health center. Magtanong nang tapat." |
| c6 | Pag-uusap sa pamilya | Both partners decide, without pressure; consent matters; health workers keep consultations confidential; ask questions until the choice is clear | "Ang desisyon ay dapat boluntaryo at walang pilitan." |

### Drill (inside c5)

- `prompt`: `"I-tap ang lahat ng maling paniniwala."`
- `segments`:
  - `{ "text": "Nakakabaog ang pills.", "flag": true }`
  - `{ "text": "May butas ang condom kaya hindi safe.", "flag": true }`
  - `{ "text": "Desisyon ito ng mag-asawa.", "flag": false }`
  - `{ "text": "Pinabababa ng vasectomy ang libido.", "flag": true }`
  - `{ "text": "Kumonsulta sa health worker.", "flag": false }`
- `hint`: `"Tatlo ang maling paniniwala. Hindi permanente ang pagkabaog mula sa pills; epektibo ang condom kapag tama ang gamit; at hindi binababa ng vasectomy ang libido."`

### Questions (10)

Exactly 4 options each. `answer` is the 0-based index; the correct answer may
sit at any index as long as `answer` matches.

| id | band | competency | stem | correct answer |
|---|---|---|---|---|
| q1 | foundational | family_health | Ano ang family planning? | Pagpapasya kung ilan at kailan ang anak, kasama ang kalusugan |
| q2 | foundational | family_health | Bakit mahalaga ang birth spacing? | Para makapag-recover ang katawan ng ina |
| q3 | foundational | family_health | Saan makakakuha ng family planning service? | Sa barangay health center o RHU |
| q4 | foundational | family_health | Alin ang nagpoprotekta sa STI? | Condom |
| q5 | core | family_health | Ano ang kailangan para mabisang LAM? | Exclusive breastfeeding, walang regla, at wala pang 6 na buwan |
| q6 | core | family_health | Ano ang tama tungkol sa vasectomy? | Permanenteng paraan para sa lalaki at hindi nakakaapekto sa libido |
| q7 | core | family_health | Sino ang dapat kasama sa desisyon? | Mag-asawa, nang may respeto at walang pilitan |
| q8 | stretch | family_health | May nagsabing nakakabaog ang pills. Totoo ba? | Hindi; karaniwang bumabalik ang fertility kapag tumigil, kaya konsultahin ang health worker |
| q9 | stretch | family_health | May side effect ka sa napiling paraan. Ano ang tamang gawin? | Bumalik sa health worker; huwag itigil nang basta at huwag mag-self-medicate |
| q10 | stretch | family_health | Alin ang permanenteng paraan? | BTL at vasectomy |

### Chunks (12)

Each `source_id` must match a card id. `keywords` are 4–6 lowercase terms.

| id | concept | card | Key content |
|---|---|---|---|
| k1 | What family planning is | c1 | Deciding whether, when, and how many children, including health and fertility awareness. |
| k2 | Why it matters | c1 | Planning helps parents care for children and reduces unplanned pregnancies. |
| k3 | Birth spacing | c2 | At least two years between births helps the mother recover; ask a health worker. |
| k4 | Natural methods | c3 | Calendar, LAM, and BBT need correct use and partner cooperation; LAM has strict conditions. |
| k5 | LAM conditions | c3 | LAM works only with exclusive breastfeeding, no period, and a baby under six months. |
| k6 | Condoms and STIs | c4 | Condoms are the method that also protects against HIV and other STIs. |
| k7 | Hormonal methods | c3 | Pills, injectables, and implants are effective when used correctly; side effects vary. |
| k8 | Long-acting and permanent | c3 | IUDs last for years; BTL and vasectomy are permanent. |
| k9 | Where to get services | c5 | Barangay health centers, RHUs, and public hospitals provide information and services. |
| k10 | RA 10354 | c5 | The Responsible Parenthood and Reproductive Health Act guarantees access to family planning information and services. |
| k11 | Myths | c5 | Pills do not cause permanent infertility, condoms are effective with correct use, and vasectomy does not lower libido. |
| k12 | Consent and follow-up | c6 | Decisions are voluntary, both partners are respected, and side effects are reported to a health worker. |

## Deliverable 4 — Capsule 106: inventory management

Create `app/src/data/capsules/capsule-106.json`.

- `id`: `"capsule-106"`
- `version`: `1`
- `title`: `"Tindahang Maayos"`
- `subtitle`: `"Inventory, tubo, at stock na hindi nauubos o nabubulok"`
- `persona`: `"may-ari ng sari-sari store at maliit na negosyo"`
- `competency`: `["business_operations", "financial_literacy"]`
- `shared_by`: `"K-0001"`, `share_count`: `0`

### Cards (6)

| id | Title | Must teach | Tip |
|---|---|---|---|
| c1 | Bakit mahalaga ang inventory? | Know what is in stock, what sells, and what is missing; prevents empty shelves, spoilage, and lost sales | "Ang hindi mo binibilang ay hindi mo kontrolado." |
| c2 | Stock card | Record item, unit cost, selling price, stock in, stock out, balance, and expiry; use a notebook or offline spreadsheet | "Isang linya bawat galaw ng stock." |
| c3 | Reorder point | Average daily sales times lead time, plus safety stock; example 10 sold per day times 3 days plus 10 safety = 40 | "Mag-order bago maubos, hindi pagkatapos." |
| c4 | FIFO at expiry | First in, first out; put older stock in front; check dates weekly and pull out expired items | "Ang lumang stock ang nasa harap, hindi sa likod." |
| c5 | Kita at puhunan | Keep store cash separate from household cash; gross profit is sales minus cost of goods; record owner's draw | "Ang pera ng tindahan ay hindi pera ng bahay." |
| c6 | Slow-moving at overstock | Review 30-day sales, bundle or discount slow items, and order based on sales and supplier terms | "Bawal ma-in love sa stock na hindi bumibili." |

### Drill (inside c4)

- `prompt`: `"I-tap ang lahat ng dapat i-record bilang bawas o problema."`
- `segments`:
  - `{ "text": "5 kilo ng bigas na bagong dating", "flag": false }`
  - `{ "text": "3 basag na softdrinks", "flag": true }`
  - `{ "text": "2 sabon na nawawala", "flag": true }`
  - `{ "text": "1 bagong delivery", "flag": false }`
  - `{ "text": "6 na itlog na basag", "flag": true }`
- `hint`: `"Tatlo: basag na softdrinks, nawawalang sabon, at basag na itlog. Dapat itala agad ang bawas."`

### Questions (10)

| id | band | competency | stem | correct answer |
|---|---|---|---|---|
| q1 | foundational | business_operations | Ano ang inventory? | Listahan ng stock, bilang, at halaga |
| q2 | foundational | business_operations | Ano ang isusulat sa stock card? | Item, bilang, presyo, at petsa |
| q3 | foundational | financial_literacy | Bakit ihiwalay ang pera ng tindahan? | Para malaman ang tunay na kita at hindi magastos ang puhunan |
| q4 | foundational | business_operations | Ano ang FIFO? | Unahin ang naunang dumating na stock |
| q5 | core | business_operations | Paano makalkula ang reorder point? | Average daily sales times lead time plus safety stock |
| q6 | core | financial_literacy | Ano ang gross profit? | Benta minus gastos sa produkto |
| q7 | core | business_operations | May 3 basag na softdrinks sa delivery. Ano ang gawin? | I-record agad bilang shrinkage at i-report sa supplier |
| q8 | stretch | business_operations | Mabagal bumili ang isang item. Ano ang gawin? | I-bundle o i-discount at bawasan ang susunod na order |
| q9 | stretch | financial_literacy | Bakit delikado ang sobrang stock ng mabilis masira? | Nauubos ang pera sa stock at nalulugi sa expiry |
| q10 | stretch | business_operations | Ano ang tamang gawin bago mag-order ng marami? | Tingnan ang 30-day sales at supplier terms |

### Chunks (12)

| id | concept | card | Key content |
|---|---|---|---|
| k1 | What inventory is | c1 | A record of stock, quantity, and value; it shows what sells and what is missing. |
| k2 | Stock card fields | c2 | Item, unit cost, selling price, stock in, stock out, balance, and expiry. |
| k3 | Daily recording | c2 | Record every stock movement the same day, even small withdrawals. |
| k4 | Reorder point | c3 | Average daily sales times lead time plus safety stock. |
| k5 | Safety stock | c3 | Extra stock covers delivery delays and sudden demand. |
| k6 | FIFO and expiry | c4 | Sell older stock first, check dates weekly, and remove expired items. |
| k7 | Shrinkage | c4 | Breakage, spoilage, and missing items are losses and must be recorded. |
| k8 | Gross profit | c5 | Sales minus the cost of the goods sold. |
| k9 | Separate cash | c5 | Keep store cash apart from household cash and record owner's withdrawals. |
| k10 | Slow-moving stock | c6 | Bundle, discount, or stop reordering items that do not sell. |
| k11 | Suppliers and lead time | c6 | Know delivery days, minimum orders, and credit terms before ordering. |
| k12 | 30-day review | c6 | Review a month of sales to decide what to reorder and what to drop. |

## Deliverable 5 — English translations

Edit `app/src/data/translations/en.json`. Add blocks for `capsule-105` and
`capsule-106` with keys `k1`–`k12`, faithful plain-English renderings. Do not
change existing blocks.

## Deliverable 6 — Tests

Write or extend these first and record the failing output.

### `app/src/data/catalogue.test.js`

The Task 5 test should already iterate `CAPSULES`. Extend it so that:

1. The id list is exactly
   `['capsule-101', 'capsule-102', 'capsule-103', 'capsule-104', 'capsule-105', 'capsule-106']`.
2. The structure and translation checks cover 105 and 106 as well as 103/104.
3. All six capsules pass `validateCapsule`.
4. `CATALOG` has six entries and each has `category`, `code`, and `tone`.

### `app/src/CourseCatalog.test.jsx`

Extend the available-section assertion to include `Plano ng Pamilya` and
`Tindahang Maayos`. Keep asserting that a fresh database contains only
`capsule-101`, and that neither 105 nor 106 appears in the installed section.

## Acceptance criteria

- [ ] `npx vitest run` from `app/` exits 0 with all tests passing.
- [ ] `npx oxlint` from `app/` exits 0.
- [ ] `npx vite build` from `app/` exits 0.
- [ ] No `.js` or `.jsx` file under `app/src` contains an emoji.
- [ ] Only the following are created or changed:
      `app/src/data/catalogue.js`, `app/src/ui/QuizArena.jsx`,
      `app/src/ui/CourseHub.jsx`,
      `app/src/data/capsules/capsule-105.json`,
      `app/src/data/capsules/capsule-106.json`,
      `app/src/data/translations/en.json`,
      `app/src/data/catalogue.test.js`, `app/src/CourseCatalog.test.jsx`.
- [ ] Capsules 105 and 106 are NOT seeded.
- [ ] Family-planning claims match the card/chunk facts above. Do not add
      medical claims beyond them.

## Report

Write the full report to `Systems/System1/task-6-report.md` with RED output,
GREEN output, lint/build output, changed files, and any wording you changed
from this brief and why.

Reply with a short status: `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or
`BLOCKED`.
