# KabsatLearn Implementation Plan

> **For agentic workers:** execute task by task. Checkpoints are marked. Steps use `- [ ]`.

**Goal:** An offline-first Android app where an out-of-school youth can take a micro-course, play an adaptive quiz, ask a grounded question, and sync progress later.

**Architecture:** Vite + React + Tailwind build, wrapped by Capacitor into an Android APK. Assets are bundled, so the service worker is an optimisation rather than a requirement; IndexedDB stores capsules, progress, and telemetry. A BM25 retriever over capsule chunks feeds two generators: a deterministic offline composer and an optional online LLM. Peer transfer of capsules is OS-mediated, with a timeboxed WebRTC stretch goal.

**Tech Stack:** Vite, React, Tailwind, Dexie (IndexedDB), Web Crypto, Web Audio, SpeechSynthesis.

**Spec:** `Systems/System1/DESIGN.md`

## Global Constraints

- 3 members. Feature freeze 14:30. Rehearsal 15:30. Submit 16:30.
- Exactly 2 capsules. 10 questions per capsule across 3 bands. 12 chunks each.
- Deliverable is a **debug APK**, installed and tested on two physical Android
  phones by 16:30. Not a hosted PWA.
- No real personal data. Learner IDs are pseudonymous (`K-####`), never names.
- Human approval before any remediation is recorded.
- Must run in airplane mode after first load.
- No hosted PWA, no accounts, no login.
- TTS uses Filipino. Ilocano is on-screen text only.
- STT is online-only. Do not claim otherwise.
- Offline answers are retrieved and composed, never generated.
- Voice input is out of scope; quick-prompt chips replace it.
- SHA-256 integrity check on every imported capsule.

## Review Focus

The failures most likely to bite a user, each pinned to a task below:

1. **Airplane mode after first load** — app must still navigate and play. (Task 1)
2. **Altered or truncated capsule file** — must be refused with a message, not crash. (Task 3)
3. **Empty difficulty band** — quiz must fall back, never return a null question. (Task 5)
4. **Query with no match above threshold** — tutor must refuse and suggest a capsule. (Task 6)
5. **Flush with an empty queue** — must be a no-op, not a hang. (Task 7)

## Progress

Last updated 09:10, about 40 minutes into the build.

| Task | Status | Commit | Time |
|---|---|---|---|
| 1 Shell, offline cache, banner | done | `fa8f322` | 08:47 |
| 2 Capsule schema and content | done | `fe9450f` | 08:53 |
| 3 Store, import, SHA-256 | done | `fd1612d` | 08:58 |
| 4 Hub, reader, TTS, drill | done | `f34bf1e` | 09:00 |
| 5 Adaptive Kahoot arena | done | `42fefdf` | 09:01 |
| 6 RAG tutor | done | `f0e09f0` | 09:02 |
| 7 Telemetry, dashboard, approval | done | `4e8dae1` | 09:03 |
| 8 Kabsat Pass | done | `ad9d4b0` | 09:03 |
| 9 WebRTC transfer | **deferred** | — | — |
| 10 APK, install test, pitch | **in progress** | `5b9db0f` | 09:09 |

- APK built: `app/android/app/build/outputs/apk/debug/app-debug.apk`, 4,269,752 bytes (4.07 MB).
- Tests: 54 passing via `npx vitest run`.
- Blocked: `adb devices` is empty, so the on-device install and the airplane-mode test cannot run yet.

---

### Task 1: Shell, offline cache, and offline banner

**Files:**
- Create: `app/` (Vite scaffold), `app/src/App.jsx`, `app/src/ui/OfflineBanner.jsx`, `app/vite.config.js`, `app/public/manifest.webmanifest`
- Test: manual acceptance, plus `app/src/lib/online.test.js`

**Interfaces:**
- Produces: `<App/>` with four routes (`hub`, `reader`, `quiz`, `tutor`, `dashboard`); `useOnline(): boolean`.

- [ ] `git init` in the project root with a `.gitignore` for `node_modules`, `dist`, `__pycache__`. Commit every task; the reviewer needs diffs.
- [ ] Scaffold Vite + React + Tailwind inside `app/`. Install dependencies before the event.
- [ ] Add `vite-plugin-pwa` with `registerType: 'autoUpdate'` and precache of the app shell.
- [ ] Write `useOnline()` — subscribes to `online`/`offline` events, returns a boolean.
- [ ] Test: with the hook mocked offline, the banner renders. Run `npx vitest run src/lib/online.test.js`. Expect PASS.
- [ ] Verify by hand: `npm run build`, `npm run preview`, load once, then DevTools → Network → Offline, reload. App must render and navigate.
- [ ] Commit.

### Task 2: Capsule schema and content

**Files:**
- Create: `app/src/data/capsules/capsule-101.json`, `capsule-102.json`, `app/src/data/synonyms.json`, `app/src/lib/schema.js`

**Interfaces:**
- Produces: capsule shape `{id, version, title, persona, competency, cards[], questions[], chunks[], shared_by, hash}`; `validateCapsule(obj): {ok, errors[]}`.

- [ ] Define the schema in `schema.js`: required keys, version `1`, question `{id, band: 'foundational'|'core'|'stretch', stem, options[4], answer, competency}`.
- [ ] Author capsule 101 (Ligtas Digital Wallet): 6 cards, 10 questions, 12 RAG chunks.
- [ ] Author capsule 102 (Unang Hakbang sa Online Trabaho): same counts.
- [ ] Test `validateCapsule` rejects a missing key and accepts both real capsules. Run vitest. Expect PASS.
- [ ] Commit.

### Task 3: Capsule store, import, and integrity

**Files:**
- Create: `app/src/lib/capsuleStore.js`, `app/src/ui/ImportCapsule.jsx`
- Test: `app/src/lib/capsuleStore.test.js`

**Interfaces:**
- Produces: `installCapsule(file): Promise<{ok, id, error?}>`, `listCapsules()`, `getCapsule(id)`. Uses Dexie table `capsules`.

- [ ] Test: a valid capsule installs and appears in `listCapsules()`.
- [ ] Test: a capsule whose `hash` does not match its content returns `{ok:false, error:'integrity'}` and is not stored.
- [ ] Implement `installCapsule` — read file, canonicalise JSON, SHA-256 via Web Crypto, compare, then `put`.
- [ ] Run vitest. Expect both PASS.
- [ ] Commit.

### Task 4: Course Hub and Story Reader

**Files:**
- Create: `app/src/ui/CourseHub.jsx`, `app/src/ui/StoryReader.jsx`, `app/src/lib/tts.js`

**Interfaces:**
- Consumes: `listCapsules`, `getCapsule`, `installCapsule`.
- Produces: `<CourseHub/>` with "Download (simulated)" and "Pass to a Kabsat"; `<StoryReader/>` with next/prev, "Pakinggan", and one red-flag drill.

- [ ] Build the hub: installed capsules, one downloadable (102) with a 2-second simulated progress bar.
- [ ] Build the reader: 6 swipeable cards, progress dots, language toggle (Taglish / Ilocano examples).
- [ ] Implement `speak(text)` using `speechSynthesis` with `lang: 'fil-PH'`, and a visible failure state if no voice is installed.
- [ ] Card 3 drill: tapping the suspicious element advances; tapping elsewhere shows a hint.
- [ ] Verify by hand in airplane mode: open 101, read all cards, complete the drill, hear TTS or see the fallback message.
- [ ] Commit.

### Task 5: Adaptive Quiz Arena

**Files:**
- Create: `app/src/ui/QuizArena.jsx`, `app/src/lib/adaptive.js`, `app/src/lib/audio.js`
- Test: `app/src/lib/adaptive.test.js`

**Interfaces:**
- Produces: `nextQuestion(bank, state): {question, band, changed}`; state `{answeredIds[], band, streakCorrect, streakWrong, lastMs}`.

- [ ] Test: two consecutive wrong answers move the band down and set `changed: true`.
- [ ] Test: two correct answers under 6000 ms move the band up.
- [ ] Test: when the target band is empty, `nextQuestion` returns an unanswered question from another band, never `null` while any question remains.
- [ ] Implement `adaptive.js` to those tests. Run vitest. Expect PASS.
- [ ] Build the arena UI: four colour tiles, 15-second bar, combo multiplier, difficulty-change badge.
- [ ] Implement `audio.js` with `AudioContext` oscillators for correct/wrong/level-up. No audio files.
- [ ] Add remediation card on a downshift, with a "Pakinggan" readout.
- [ ] Add pass-and-play: two learners, five questions each, alternating.
- [ ] Verify by hand: play a full round; force a wrong answer twice to see the remediation card.
- [ ] Commit.

### Task 6: RAG tutor

**Files:**
- Create: `app/src/lib/bm25.js`, `app/src/lib/rag.js`, `app/src/ui/KabsatAI.jsx`
- Test: `app/src/lib/bm25.test.js`, `app/src/lib/rag.test.js`

**Interfaces:**
- Produces: `buildIndex(chunks)`, `retrieve(index, query, k=3)`, `answerOffline(query, capsule, profile): {reply, source, confidence}`, `answerOnline(query, chunks, apiUrl?)`.

- [ ] Test `retrieve`: "OTP" ranks the OTP chunk first for a query about a one-time PIN.
- [ ] Test `answerOffline`: a covered question returns a reply citing `source`, confidence ≥ 65.
- [ ] Test `answerOffline`: an uncovered question returns `source: null` and a refusal that names a capsule to download.
- [ ] Implement `bm25.js` (k1=1.5, b=0.75) and synonym expansion from `synonyms.json`.
- [ ] Implement `answerOffline` as a grounded template over the top chunk. No generation.
- [ ] Implement `answerOnline` as a fetch to a configurable endpoint with the DESIGN.md system prompt and the top-3 chunks as CONTEXT; cache the result in Dexie keyed by normalised query.
- [ ] Build the tutor UI: text input, four quick-prompt chips, source line, "Pakinggan" button.
- [ ] Verify by hand in airplane mode: ask a covered question, then an uncovered one.
- [ ] Commit.

### Task 7: LGU dashboard, telemetry queue, approval gate

**Files:**
- Create: `app/src/ui/Dashboard.jsx`, `app/src/lib/telemetry.js`, `app/src/lib/mastery.js`
- Test: `app/src/lib/telemetry.test.js`

**Interfaces:**
- Produces: `queueEvent(event)`, `queueSize()`, `flush(): Promise<{sent, failed}>`, `getMastery(learnerId)`, `approveRemediation(learnerId, competency)`.

- [ ] Test: flushing an empty queue returns `{sent:0, failed:0}` and does not throw.
- [ ] Test: three queued events flush to a mocked endpoint and the queue empties.
- [ ] Implement the queue in Dexie table `telemetry`, pseudonymous IDs only.
- [ ] Build the dashboard: mastery radar across four pillars, weak-concept list, queue counter, "Simulate barangay Wi-Fi" button.
- [ ] Add the approval gate: remediation is listed as *proposed* until the facilitator taps Approve, then it is recorded as approved.
- [ ] Verify by hand: play a quiz, return to the dashboard, see the counter rise, flush, see it clear.
- [ ] Commit.

### Task 8: Kabsat Pass

**Files:**
- Create: `app/src/lib/share.js`, `app/src/ui/ShareCapsule.jsx`
- Modify: `app/public/manifest.webmanifest` (add `file_handlers` for `.kabsat`)

**Interfaces:**
- Produces: `shareCapsule(id)` using `navigator.canShare({files})`; `installFromFile(file)` delegating to `installCapsule`.

- [ ] Implement `shareCapsule`: build a `File` named `<id>.kabsat`, call `navigator.share`, fall back to `download`.
- [ ] Add "Pass to a Kabsat" to each capsule card.
- [ ] Register `file_handlers` and consume `launchQueue` to import `.kabsat` files on Android.
- [ ] Verify by hand: export 101, re-import it, confirm it opens and the course unlocks.
- [ ] Verify by hand: edit one byte of the exported file, re-import, confirm the integrity refusal.
- [ ] Commit.

### Task 9 (STRETCH, timeboxed 13:00–14:30): WebRTC transfer

**Files:**
- Create: `app/src/lib/p2p.js`, `app/src/ui/Transfer.jsx`

**Interfaces:**
- Produces: `createOffer(): Promise<string>`, `acceptOffer(sdp): Promise<string>`, `acceptAnswer(sdp): Promise<void>`, `onCapsule(cb)`.

- [ ] Implement a `RTCDataChannel` with `iceServers: []` and `RTCIceCandidate` gathered to completion.
- [ ] Encode the offer and answer as QR codes; scan with `BarcodeDetector` where available.
- [ ] Chunk the capsule over the data channel with a byte counter and a checksum.
- [ ] Verify on two physical phones on one hotspot.
- [ ] **If it is not working by 14:30, stop and delete this task's UI entry point.** Import remains the demo.

### Task 10: APK build, install test, pitch assets

**Files:**
- Create: `app/capacitor.config.json`, `app/android/` (generated), `pitch/deck.md`, `pitch/qa.md`, `pitch/prompts.md`

**Interfaces:**
- Consumes: the built `dist/` from every earlier task.

- [x] `npm install @capacitor/core @capacitor/cli @capacitor/android`
- [x] `npx cap init KabsatLearn com.kabsatlearn.app --web-dir=dist`
- [x] `npm run build && npx cap add android && npx cap sync android`
- [x] `cd android && ./gradlew assembleDebug` (Windows: `gradlew.bat assembleDebug`)
- [ ] Copy the APK to `pitch/kabsatlearn-debug.apk`; record its exact size in bytes.
- [ ] Install on two physical Android phones: `adb install -r <apk>`.
- [ ] Verify on device in airplane mode: open a capsule, finish a quiz, ask Kabsat
      a covered question, see the refusal on an uncovered one.
- [ ] `pitch/prompts.md` must contain the system prompt, the four tool descriptions,
      and three sample conversations. This is a competition requirement.
- [ ] Rehearse the 7-minute pitch: capsule → story → quiz downshift → tutor → pass → dashboard flush.
- [ ] Record a backup screen capture of the full demo.
- [ ] Submit by 16:30.

## Checkpoints

| Time | Original gate | Actual |
|---|---|---|
| 10:30 | Tasks 1–3 green | **done 08:58** |
| 12:30 | Tasks 4–5 green | **done 09:01** |
| 14:30 | Tasks 6–7 green, feature freeze | **done 09:03** |
| 15:30 | APK, prompts doc, rehearsal | APK built 09:05; prompts and rehearsal pending |
| 16:30 | Submitted | — |

### Remaining work, highest risk first

1. **Install the APK on a real Android phone** and run the airplane-mode check.
   Nothing on this machine can substitute for it — `adb devices` is empty.
2. **`pitch/prompts.md`** — system prompt, four tool descriptions, three sample
   conversations. This is a scoring requirement, not a nicety.
3. **`@capacitor/share`** for Kabsat Pass inside the WebView, replacing
   `navigator.share`, which is unreliable there.
4. **Rehearse and record** a backup screen capture of the full demo.
5. **Task 9 (WebRTC)** only if 1–4 are finished. Otherwise stay with import.

Keep the rest of the day for rehearsal and Q&A prep. The build is no longer the
critical path; verifying it on a phone is.

If a checkpoint slips 45 minutes, cut the lowest-value item still open and note it in the pitch as a deliberate scope decision.
