# KabsatLearn

Offline-first, gamified micro-learning for out-of-school youth in San Fernando,
La Union. PWA, no install, works with no internet.

## Intent

A learner with one shared entry-level Android phone and no data can still take a
short course, play an adaptive quiz, and ask a question — then have their
progress reach the City Education Office the next time a barangay has Wi-Fi.

## Why

Standard learning apps assume continuous data, a capable device, and English
literacy. In upland and coastal barangays all three fail at once — and they fail
hardest exactly when school is suspended. The City already has a digital spine
(C3, eBPLS, TOM); the gap is the last mile, not another dashboard.

## Primary persona

An out-of-school youth, 17, in a coastal barangay. Attends ALS sessions twice a
week. Shares one PHP 3,000 Android phone with three siblings. No data at home.
Reads Tagalog comfortably, English with effort, Ilocano at home.

Secondary reach: senior citizens for the anti-scam capsule. Tertiary user: the
City Education / ALS coordinator, who needs to know which competency to reteach.

## Goals

- Learn with zero connectivity after first load.
- Adapt question difficulty to the individual learner in real time.
- Answer learner questions offline, grounded in downloaded course content, with
  a visible source and an honest refusal when out of scope.
- Surface competency gaps to a facilitator, and require a human to approve any
  follow-up before it is recorded.
- Queue learner telemetry offline and flush it on reconnection.
- Pass a downloaded capsule to another device with no internet at all.

## Non-goals

- Native Android app or APK. The PWA is the deliverable; an APK is a stretch.
- Accounts, login, or real authentication.
- Ilocano text-to-speech. Android ships Filipino, not Ilocano.
- On-device neural embeddings or a local generative LLM.
- Real LGU system integration. The dashboard is a local prototype.
- More than two capsules.
- A custom Bluetooth stack, Web Bluetooth GATT transfer, or Wi-Fi Direct.
  Browsers cannot advertise as a Bluetooth peripheral, so browser-to-browser
  file transfer over Bluetooth is not possible.

## Anti-goals

- Anything that only works with internet.
- Claiming a "tool-using AI agent" without a prompt, tool list, and sample
  conversations to show the judges.
- A demo that depends on venue Wi-Fi.
- Real citizen data of any kind.

## Constraints

- 3 members plus a coach. 8 hours, 08:30–16:30.
- Vite + React + Tailwind, dependencies installed before the event.
- Data Privacy Act: synthetic learners only, pseudonymous IDs, no names in
  telemetry.
- Human approval before any follow-up is recorded or sent.
- Every AI tool disclosed in the pitch deck.

## Architecture

```
UI: React + Tailwind
  Course Hub · Story Reader · Quiz Arena · Kabsat AI · LGU Dashboard
Offline: Service Worker (app shell) + IndexedDB (capsules, XP, telemetry queue)
Intelligence:
  Retriever  — BM25 + synonym expansion over capsule chunks
  Generator  — offline grounded composer | online LLM over the same chunks
  Adaptive   — per-learner mastery estimate driving question difficulty
Telemetry  — <1 KB JSON logs, queue, flush on simulated reconnect
Transport  — Web Share API, file import, SHA-256 integrity check
             (WebRTC over a hotspot is a timeboxed stretch goal)
```

### Offline capsule sharing (Kabsat Pass)

A capsule is one JSON file of about 80 KB. Sharing is store-and-forward, with no
server and no protocol of our own:

- **Send.** `navigator.share({ files: [capsuleFile] })` opens the OS share sheet.
  Android and iOS route it to Bluetooth, Nearby Share, AirDrop, or a saved file.
- **Fallback.** Download the `.kabsat` file. Any transfer method works, including
  a USB cable or a memory card.
- **Receive.** The learner picks the `.kabsat` file. The app verifies SHA-256,
  checks the schema version, then offers "Add to my courses".
- **Provenance.** Each capsule carries `shared_by` and `share_count`, so the
  dashboard can show how content spread without a network.

The app owns the capsule format, the integrity check, and the import. The OS owns
the transport. Say that plainly if a judge asks whether this is peer-to-peer.

### Single RAG pipeline

One retriever, two generators. The retriever never changes; only the generator
depends on connectivity.

**Corpus (build time).** Each capsule's content is split into ~120-word chunks
with metadata `{capsule, concept, competency, difficulty, source_id}`. The
capsule ships its chunks, a BM25 index, and a Taglish/Ilocano/English synonym
map. Budget: ~5 KB of index per capsule.

**Retrieve (runtime, both modes).** Normalise the query, expand synonyms, score
with BM25, take the top 3. Deterministic, under 10 ms, no model weights.

**Generate offline.** Use the top chunk's answer, wrap it in a grounded template
with the learner's name and weakest competency, and cite `source_id`. If the top
score is below threshold, refuse honestly and suggest a relevant capsule. Never
invent content.

**Generate online.** Send the same top-3 chunks to an LLM with the system prompt
below, then cache the answer in IndexedDB keyed by the normalised query, so the
next identical question is answerable offline.

**Why not embeddings.** Embedding a query requires a model on the device (~23 MB
quantized plus a WASM runtime). That breaks the size and RAM budget. BM25 is the
retrieval method that survives the target hardware. Say so plainly if asked.

### Online agent (disclosable)

System prompt: *"You are Kabsat, a tutor for out-of-school youth in San
Fernando, La Union. Answer only from CONTEXT. If CONTEXT does not contain the
answer, say you do not know and name a capsule to download. Reply in simple
Taglish, at most 60 words. Never give medical, legal, or financial advice beyond
the CONTEXT."*

Tools: `retrieve_chunks(query)`, `get_mastery(learner_id)`,
`draft_remediation(competency)`, `queue_telemetry(record)`.

The agent recommends. The facilitator approves remediation before it is saved.

## Features (v1)

1. **App shell** — offline banner, install prompt, four-tab navigation.
2. **Course Hub** — Capsule 101 pre-installed; Capsule 102 downloadable;
   simulated 2-second download with progress.
3. **Story Reader** — 5–7 swipeable cards, "Pakinggan" TTS readout, one
   "tap the red flag" drill, Taglish/Ilocano context toggle.
4. **Quiz Arena** — four answer tiles, countdown, combo multiplier, adaptive
   difficulty, remediation card on struggle, pass-and-play for two learners on
   one phone.
5. **Kabsat AI** — text input plus quick-prompt chips; RAG answer with source
   citation; TTS readout; offline refusal path.
6. **LGU Dashboard** — mastery radar across four pillars, weak-concept list,
   sync queue, simulated reconnection flush, barangay heatmap, facilitator
   approval gate.
7. **Kabsat Pass** — send a capsule through the OS share sheet, import a
   `.kabsat` file, verify its hash, and unlock the course offline. Shows who
   shared it and how many hops it has travelled.

## Adaptive rule

Track per-learner consecutive results and response time. Two consecutive misses
downgrade one band and show the remediation card. Two correct answers in under
6 s upgrade one band. Otherwise hold. Bands: foundational, core, stretch.

Distinct from personalization: this is difficulty banding. Say that, rather than
overclaiming.

## Acceptance criteria

- [ ] After first load, the app opens and completes a quiz with the device in
      airplane mode.
- [ ] Both capsules persist across a reload (IndexedDB).
- [ ] Two consecutive misses produce an easy question and a remediation card.
- [ ] Two correct answers under 6 s produce a harder question.
- [ ] Ten scripted questions return a grounded answer with a source citation.
- [ ] An out-of-scope question returns an honest refusal, not an invented answer.
- [ ] The sync queue counts logs and flushes on simulated reconnect, and the
      dashboard updates.
- [ ] The facilitator approves the follow-up list before it is recorded.
- [ ] Telemetry contains pseudonymous IDs only.
- [ ] A capsule shared through the OS share sheet imports on a second device and
      unlocks its course and quiz offline.
- [ ] A capsule whose contents were altered fails the hash check and is refused.
- [ ] The pitch deck contains the system prompt, the tool list, and three sample
      conversations.

## Honest limits

- Banding is a heuristic, not a validated mastery model.
- The item bank is small and synthetic.
- Ilocano copy needs a native-speaker check.
- Offline answers are retrieved and composed, not generated.
- Voice input is out of scope for v1; quick-prompt chips replace it. Only voice
  output works offline.
- Capsule transfer is OS-mediated. The app does not implement Bluetooth itself,
  and the demo phones may need to be paired beforehand.

## Open questions

- Does the City Education Office want barangay-level or learner-level rollups?
- Is there an existing ALS competency list we should tag against?
