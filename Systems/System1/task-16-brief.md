# Task 16 — Instant Predefined Answers in Kabsat AI for Exact Lesson Matches

## Background

The user requested:
> "I want to implement a new feature in the kabsat AI page. If the message of the user matches the lessons on the course exactly, it should answer almost instantaneously, like predefined. This should still be possible even with new pages"

And agreed to the clarified specification:
1. **Match Target**: Exact match against lesson card titles (e.g. `"Ang OTP ay susi ng bahay mo"`) or quiz question stems (e.g. `"Bago magbayad gamit ang QR, ano ang dapat tingnan?"`), normalized for case, whitespace, and punctuation (e.g. trailing `?`, `.`, `!`).
2. **Instant Predefined Response**:
   - For a lesson card match: returns the lesson card's full body and practical tip (`${card.body}\n\n${lang === 'en' ? 'Tip' : 'Payo'}: ${card.tip}`) with a verified source citation referencing the capsule and card title, confidence 100%, and `kind: 'predefined'`.
   - For a question stem match: returns the correct option and hint (`${lang === 'en' ? 'Correct answer:' : 'Tamang sagot:'} "${question.options[question.answer]}". ${question.hint}`) with a source citation referencing the question stem, confidence 100%, and `kind: 'predefined'`.
3. **Execution Speed**: Responds almost instantaneously (bypasses heavy on-device LLM initialization and artificial delays).
4. **Scope & Future-Proofing**: Searches across all installed courses and any newly imported/added capsules stored on device (via `capsuleStore.js` / `listCapsules()`), ensuring newly added courses and lessons work automatically. Non-matching queries fall back seamlessly to standard RAG / LLM handling.

---

## Required Changes

### 1. `Systems/System1/app/src/lib/rag.js`
- Export `normalizeForMatch(str)`:
  - Trims, converts to lowercase, strips trailing/leading punctuation (`/[?!.,;:—–\-'"“”‘’()]+/g`), and collapses whitespace.
- Export `matchPredefinedLesson(query, capsuleOrCapsules, language = 'tl')`:
  - Accepts a capsule object or an array of capsule objects.
  - Checks every card in `capsule.cards`:
    - If `normalizeForMatch(card.title) === normalizeForMatch(query)`:
      - Returns:
        ```javascript
        {
          reply: `${card.body}${card.tip ? `\n\n${language === 'en' ? 'Tip' : 'Payo'}: ${card.tip}` : ''}`,
          source: {
            concept: card.title,
            capsuleId: capsule.id,
            capsuleTitle: capsule.title,
            cardId: card.id,
          },
          confidence: 100,
          matches: [],
          lang: language,
          kind: 'predefined',
        }
        ```
  - Checks every question in `capsule.questions`:
    - If `normalizeForMatch(question.stem) === normalizeForMatch(query)`:
      - Returns:
        ```javascript
        {
          reply: `${language === 'en' ? 'Correct answer:' : 'Tamang sagot:'} "${question.options?.[question.answer] ?? ''}".${question.hint ? ` ${question.hint}` : ''}`,
          source: {
            concept: question.stem,
            capsuleId: capsule.id,
            capsuleTitle: capsule.title,
            questionId: question.id,
          },
          confidence: 100,
          matches: [],
          lang: language,
          kind: 'predefined',
        }
        ```
  - If no match found across candidates, returns `null`.
- In `answerOffline(query, capsule, { name = '', threshold = THRESHOLD, installedCapsules = [] } = {})`:
  - First calls `matchPredefinedLesson(query, installedCapsules.length > 0 ? installedCapsules : capsule, asked)`.
  - If match returned, returns it immediately.
  - Then proceeds to persona check and BM25 retrieval as before.

### 2. `Systems/System1/app/src/lib/useKabsatAiState.js`
- Accept `installedCapsules = []` in `useKabsatAiState({ capsule, installedCapsules = [], t, lang })`.
- In `ask(question, { delay = 1000 } = {})`:
  - When matching predefined lesson:
    - Determine candidate capsules: `installedCapsules.length > 0 ? installedCapsules : await listCapsules().catch(() => [capsule])`.
    - Check `matchPredefinedLesson(text, candidates, lang)`.
    - If predefined match exists:
      - Add user message.
      - Immediately add assistant message with:
        `{ role: 'assistant', text: matched.reply, source: matched.source, confidence: 100, kind: 'predefined', answered: true, thinking: false }`
      - Set `isProcessing(false)`.
      - Return immediately without waiting for `waitDelay(delay)` or loading LLM engine.

### 3. `Systems/System1/app/src/App.jsx`
- Pass `installedCapsules: capsules.filter((c) => c.installed)` into `useKabsatAiState`.

### 4. Tests
- In `Systems/System1/app/src/lib/rag.test.js`:
  - Test `normalizeForMatch` handles casing, spacing, and punctuation.
  - Test `matchPredefinedLesson` returns instant lesson card match with body and tip.
  - Test `matchPredefinedLesson` returns instant quiz question match with correct answer.
  - Test `answerOffline` returns predefined result when query matches card title.
- In `Systems/System1/app/src/ui/KabsatAI.test.jsx`:
  - Test that asking a question matching a lesson card title immediately renders the predefined lesson answer with source citation and without thinking delay.

---

## TDD Order

1. Add tests in `app/src/lib/rag.test.js` and `app/src/ui/KabsatAI.test.jsx` for lesson matching and instant answering.
2. Run `npx vitest run src/lib/rag.test.js` to observe failure (RED).
3. Implement changes in `rag.js`, `useKabsatAiState.js`, and `App.jsx`.
4. Run `npx vitest run src/lib/rag.test.js src/ui/KabsatAI.test.jsx` and observe pass (GREEN).
5. Run full test suite: `npx vitest run`.
6. Run `npx oxlint`.
7. Run `npx vite build`.

---

## Acceptance Criteria

- Querying an exact card title (e.g. "Ang OTP ay susi ng bahay mo" or "ang otp ay susi ng bahay mo?") returns the predefined lesson body + tip immediately with 100% match source citation badge.
- Querying an exact question stem returns the correct answer and hint immediately with 100% match source citation badge.
- Predefined answers do not trigger WebLLM loading or artificial delay.
- Installed capsules and newly imported capsules are dynamically searched.
- Standard queries continue to use semantic RAG / LLM without regression.
- All tests pass (`npx vitest run`).
- Oxlint reports 0 errors.
- Vite build succeeds with exit code 0.

---

## Report

Write full report to `Systems/System1/task-16-report.md` including:
- RED test failure output
- GREEN test success output
- Oxlint and Vite build output
- Changed files summary
- Short status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED.
