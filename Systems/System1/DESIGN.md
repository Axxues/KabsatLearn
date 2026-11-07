# KabsatLearn

Offline-first, gamified micro-learning for out-of-school youth in San Fernando,
La Union. Ships as an Android app that works with no internet.

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
- Answer social questions directly, generate content answers on the device, and
  fall back to the written lesson text whenever generation is unavailable or
  fails the language check.
- Surface competency gaps to a facilitator, and require a human to approve any
  follow-up before it is recorded.
- Queue learner telemetry offline and flush it on reconnection.
- Pass a downloaded capsule to another device with no internet at all.

## Non-goals

- A Kotlin/Compose native rewrite. The app is a React build wrapped by
  Capacitor into an Android app. That is a deliberate 8-hour trade, and the pitch
  says so plainly.
- Accounts, login, or real authentication.
- Ilocano text-to-speech. Android ships Filipino, not Ilocano.
- On-device neural embeddings. Retrieval stays lexical (BM25); the only model on
  the device is the small generative LLM described below.
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
  Persona    — predefined answers for social questions (sino ka, hello, thanks)
  Retriever  — BM25 + synonym expansion over capsule chunks
  Generator  — on-device Qwen2.5-0.5B via WebLLM/WebGPU
               | extractive fallback | optional online LLM over the same chunks
  Language   — answers mirror the question: Tagalog or English
  Adaptive   — per-learner mastery estimate driving question difficulty
Telemetry  — <1 KB JSON logs, queue, flush on simulated reconnect
Transport  — Web Share API, file import, SHA-256 integrity check
             (WebRTC over a hotspot is a timeboxed stretch goal)
Packaging  — Capacitor wraps dist/ into an APK; assets are bundled, so the
             service worker is an optimisation rather than a requirement.
             The model runs as a lazy 6 MB chunk, so app startup never parses it.
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

### Answer pipeline

Every question goes through the same stages. Only the generator varies.

**0. Persona — the only predefined answers.** Social questions ("sino ka?",
"who are you?", "kumusta", "salamat", capability, creator, language, offline)
are answered from a small bilingual intent table before retrieval runs. Matching
is whole-word, because substring matching made "hi" fire inside "hinihingi" and
"philippines" and turned real questions into greetings.

**1. Retrieve.** Normalise, expand synonyms, score with BM25 over capsule chunks,
take the top one or two. Deterministic, no model weights.

**2. Generate.**
- *On-device (default).* Qwen2.5-0.5B-Instruct q4f16 through WebLLM on WebGPU,
  grounded on the retrieved chunk, 50 tokens maximum, temperature 0.2.
- *Extractive fallback.* The corpus text wrapped with its source citation, used
  when the model is not downloaded, fails, or fails the language guard.

**3. Language guard.** The answer must be in the language of the question. A
mismatch discards the generation and keeps the corpus answer. This exists because
the 0.5B model sometimes answers a Tagalog question in Spanish.

**Language mirroring.** English questions are answered from an English
translation layer (`data/translations/en.json`) so generation is composition, not
translation. Tagalog questions use the Tagalog corpus. Detection treats Taglish
as Tagalog, since mixing English nouns into Tagalog is normal.

**Online (optional).** The same chunks can go to a remote LLM; the response is
cached for later offline reuse.

**Why not embeddings.** Embedding a query needs a separate model on the device.
BM25 is the retriever that survives the target hardware. Say so plainly if asked.

### Measured on device

TECNO LJ6 · MediaTek mt6789 (Helio G99) · Mali-G57 · Android 16 · 8 GB RAM ·
WebView 157 with WebGPU.

| Metric | Measured |
|---|---|
| Model | Qwen2.5-0.5B-Instruct q4f16, ~400 MB |
| First download | ~90 s over Wi-Fi, then cached |
| Cache survives restart | yes |
| Generation speed | ~2.6 tokens/second |
| Time to first tokens (warm) | ~34 s |
| Full generated answer | ~70–100 s |
| Extractive fallback | instant |
| APK | ~6.8 MB |

These numbers are the honest limit of a 0.5B model in a WebView. State them in
the pitch rather than claiming a fast assistant.

### Online agent (disclosable)

System prompt (as implemented): *"You are Kabsat, an offline tutor for
out-of-school youth in San Fernando, La Union. Answer ONLY from CONTEXT. If
CONTEXT lacks the answer, say you do not know. Reply in simple Taglish or
English, at most 45 words. Keep key terms exactly as written."*

Tools: `retrieve_chunks(query)`, `get_mastery(learner_id)`,
`draft_remediation(competency)`, `queue_telemetry(record)`.

The agent recommends. The facilitator approves remediation before it is saved.

## Features (v1)

1. **App shell** — offline banner, install prompt, four-tab navigation.
2. **Course Hub** — Capsule 101 pre-installed; Capsule 102 downloadable;
   simulated 2-second download with progress.
3. **Story Reader** — 5–7 swipeable cards, "Pakinggan" TTS readout, one
   "tap the red flag" drill, Filipino/English interface toggle.
4. **Quiz Arena** — four answer tiles, countdown, combo multiplier, adaptive
   difficulty, remediation card on struggle, pass-and-play for two learners on
   one phone.
5. **Kabsat AI** — text input plus quick-prompt chips; predefined persona
   answers; content answers generated on-device over retrieved chunks, with an
   extractive fallback; source citation; TTS readout; answers mirror the
   question's language.
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
- [ ] A personal question ("sino ka?", "who are you?") answers immediately, in
      the question's language, without an out-of-scope warning.
- [ ] A content question is answered by the on-device model with no network, and
      cites the retrieved source.
- [ ] A generated answer that drifts out of the question's language is discarded
      and replaced by the corpus answer.
- [ ] English questions get English answers; Tagalog questions get Tagalog.
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
- Content answers are generated by a 0.5B model: about 2.6 tokens/second, 70–100
  seconds for a full answer, and the output is noticeably weaker than the
  human-written corpus text.
- Tagalog generation is unreliable. The language guard usually discards it and
  returns the corpus answer instead, so Tagalog answers are effectively retrieved.
- The model is a one-time ~400 MB download. Without it the tutor still works, as
  retrieval with an extractive answer.
- Voice input is out of scope for v1; quick-prompt chips replace it. Only voice
  output works offline.
- Capsule transfer is OS-mediated. The app does not implement Bluetooth itself,
  and the demo phones may need to be paired beforehand.
- The APK is a Capacitor WebView build, about 6.8 MB, not Kotlin-native. Say that
  plainly rather than claiming a 3 MB native footprint.

## Open questions

- Does the City Education Office want barangay-level or learner-level rollups?
- Is there an existing ALS competency list we should tag against?
