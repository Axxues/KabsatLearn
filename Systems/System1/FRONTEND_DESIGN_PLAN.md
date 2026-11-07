# KabsatLearn Frontend Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the visual and interaction design of all views in KabsatLearn (Course Hub, Story Reader, Quiz Arena, Kabsat AI Chat, LGU Dashboard, and Global Shell) with an authentic Ilokano coastal palette, dark/light mode support, responsive typography, and 60fps CSS hardware-accelerated tactile micro-interactions tailored for low-cost Android phones.

**Architecture:** Tailwind CSS 4 theme variables with CSS custom property tokens for instant light/dark mode switching without JS layout thrashing. Hardware-accelerated CSS transforms (`translate3d`, `scale`) for active button press states and fluid progress bars. Pure SVG icons replacing text glyphs in navigation and controls. Zero new runtime dependencies.

**Tech Stack:** React 19, Tailwind CSS 4, Lucide/Heroicon-styled inline SVG icons, Web Audio API, Web Speech API.

**Spec:** `Systems/System1/DESIGN.md`

## Global Constraints

- Must run smoothly at 60fps on low-end PHP 3,000 Android devices with entry-level GPUs.
- All 55 existing tests in `Systems/System1/app` must remain 100% passing at every step.
- Preserve all offline functionality: zero external font/CDN calls, zero online image assets.
- Support both Light Mode and Dark Mode with seamless manual toggle and persistent state.
- WCAG AA contrast ratio compliance on all text and interactive elements in both themes.
- Touch target sizes minimum 44px (min-h-11) for all interactive buttons and inputs.
- All modifications strictly contained within `Systems/System1/`.

## Review Focus

1. **Dark/Light Mode legibility:** High contrast ratio for text and borders in both themes, no invisible text or borders against background.
2. **Low-end device performance:** No heavy keyframe loops or layout thrashing; transitions use only `opacity`, `transform`, and CSS variable color shifts.
3. **Touch ergonomics on small screens:** Minimum 44px touch targets with active feedback so learners on cracked or unresponsive screens know touches registered.
4. **Offline indicator visibility:** The offline badge and connectivity banner must be unmistakably clear without alarming the user.
5. **Contract preservation:** All existing props, state handlers, audio triggers, and telemetry queues in UI components must continue functioning without regression.

---

### Task 1: Design Tokens, Theme Architecture, and Dark Mode Support

**Files:**
- Modify: `Systems/System1/app/src/index.css`
- Modify: `Systems/System1/app/src/App.jsx`
- Modify: `Systems/System1/app/src/ui/OfflineBanner.jsx`

**Deliverable:**
Complete color token system for light and dark modes with Ilokano coastal theme (deep indigo, sea slate, warm terracotta, emerald, amber, coral). Global CSS tactile utilities (`.btn-press`, `.card-interactive`, `.badge`). Theme toggle in header persisted to `localStorage`.

- [ ] Define light and dark mode CSS variable tokens in `index.css`:
  - Light mode: `--color-bg: #f8fafc`, `--color-surface: #ffffff`, `--color-surface-hover: #f1f5f9`, `--color-ink: #0f172a`, `--color-muted: #64748b`, `--color-line: #e2e8f0`, `--color-accent: #1e40af`, `--color-accent-hover: #1d4ed8`, `--color-accent-subtle: #dbeafe`, `--color-terracotta: #c2410c`, `--color-good: #15803d`, `--color-warn: #b45309`, `--color-danger: #b91c1c`.
  - Dark mode (`[data-theme="dark"]`): `--color-bg: #0b1120`, `--color-surface: #1e293b`, `--color-surface-hover: #334155`, `--color-ink: #f8fafc`, `--color-muted: #94a3b8`, `--color-line: #334155`, `--color-accent: #3b82f6`, `--color-accent-hover: #60a5fa`, `--color-accent-subtle: #1e3a8a`, `--color-terracotta: #f97316`, `--color-good: #22c55e`, `--color-warn: #f59e0b`, `--color-danger: #ef4444`.
- [ ] Add hardware-accelerated tactile CSS classes (`.tap-highlight-none`, `.btn-press`, `.card-lift`, `.badge-pill`, smooth progress bars) with `@media (prefers-reduced-motion: reduce)` safety.
- [ ] Update `App.jsx` with theme state (`light` / `dark`), persistent `localStorage` check, and theme toggle button in the header.
- [ ] Redesign header with KabsatLearn emblem/badge, active view label, modern offline pill in `OfflineBanner.jsx` with online/offline pulse dot, and theme toggle.
- [ ] Redesign bottom navigation bar with crisp SVG icons (Course Book, Quiz Trophy, Chat Sparkle, Dashboard Chart), active indicator pill with accent glow, and tactile press animation.
- [ ] Run vitest suite from `Systems/System1/app` to confirm 55/55 pass.

---

### Task 2: Redesign Course Hub View

**Files:**
- Modify: `Systems/System1/app/src/ui/CourseHub.jsx`

**Deliverable:**
Warm and welcoming course hub with learning greeting, learner stats summary, streamlined import drop-card, and rich capsule cards with progress badges, download simulation bars, and tactile "Open" and "Pass" actions.

- [ ] Add learner greeting header with motivational subtext ("Aralin sa sariling wika, kahit walang internet").
- [ ] Redesign "Import .kabsat" action as a dashed interactive file card with upload icon, clear helper note ("I-pasa mula sa kaklase via Bluetooth o Nearby Share"), and active drag/hover styling.
- [ ] Redesign `CapsuleCard` with:
  - Clean card elevation with subtle border and rounded-2xl geometry.
  - Status pill: "Handa na" (Ready) in emerald badge with checkmark or file size pill in coastal blue.
  - Informative meta chips with SVG icons for cards count and quiz question count.
  - Action buttons: prominent primary "Simulan ang Aralin" (Open Course) button with `.btn-press`, and secondary "Ipasa (Share)" button with share SVG icon.
  - Smooth download simulation progress indicator with animated striped bar and percentage when downloading.
- [ ] Test in light and dark mode for contrast and touch ergonomics.
- [ ] Run vitest suite to ensure all tests pass.

---

### Task 3: Redesign Story Reader & Red-Flag Drill

**Files:**
- Modify: `Systems/System1/app/src/ui/StoryReader.jsx`

**Deliverable:**
Distraction-free, high-comfort mobile reading experience with segmented progress header, clear audio readout control, typographic hierarchy, and an interactive red-flag security drill with vivid tactile tap feedback.

- [ ] Redesign reader header: back button with arrow icon, course title, and step counter badge (`2 / 6`).
- [ ] Add segmented pill progress bar at top that fills smoothly per card.
- [ ] Redesign story card:
  - Clean typography with responsive headline, line-height 1.6, and high-contrast readable body text.
  - Prominent "Pakinggan ang Aralin" (Listen) button with speaker SVG icon and active sound-wave animation cue.
- [ ] Redesign Red-Flag Drill (`Drill`):
  - Warning/Challenge shield banner ("Suriin ang Mensahe").
  - Clear instructions with highlighted drill prompt.
  - Interactive text segments: tactile chip buttons that toggle on tap with immediate emerald/amber feedback for found flags.
  - Counter badge: "Nahanap: X / Y" with motivational hint.
  - "Magpatuloy" (Continue) primary button that activates smoothly when all flags are discovered.
- [ ] Redesign bottom navigation controls (Previous / Next card buttons with touch-friendly 48px height).
- [ ] Run vitest suite to ensure 55/55 pass.

---

### Task 4: Redesign Adaptive Quiz Arena

**Files:**
- Modify: `Systems/System1/app/src/ui/QuizArena.jsx`

**Deliverable:**
Exciting, high-contrast mobile quiz arena with mode selector (Solo vs Pass & Play), live combo/streak HUD, difficulty band badge, 15-second visual countdown bar, punchy Kahoot-style answer tiles with tactile press depth, clear remediation popups, and celebration results screen.

- [ ] Redesign Quiz Intro screen:
  - Mode selection cards: 1-Player Solo Practice vs 2-Player Pass & Play with icons and descriptions.
  - High-energy "Simulan ang Quiz" CTA button.
- [ ] Redesign In-Game HUD:
  - Header with Exit button, Player turn indicator ("Player 1" vs "Player 2"), and current score badge.
  - Dynamic streak multiplier counter with flame icon (`🔥 2x Streak`).
  - Adaptive difficulty band indicator pill (`Foundational`, `Core`, `Stretch`) with subtle color shifts.
  - 15-second countdown progress bar with smooth transition that shifts from emerald -> amber -> coral as time expires.
- [ ] Redesign Question & Answer Tiles:
  - Card with question prompt in clear bold text.
  - 4 Kahoot-style color tiles (Red Triangle, Blue Diamond, Yellow Circle, Green Square) upgraded with rich gradients, SVG geometric shapes, tactile 3D-depth active press, and high-contrast white typography.
  - Reveal state with vivid correct/wrong ring highlights and animated feedback.
- [ ] Redesign Remediation Card on downshift:
  - Clear supportive coaching banner explaining the mistake with "Pakinggan" audio readout.
- [ ] Redesign Results / Victory Screen:
  - Medal/Trophy graphic, final score tally, accuracy stat, streak record, and "Maglaro Muli" (Play Again) action.
- [ ] Run vitest suite to ensure 55/55 pass.

---

### Task 5: Redesign Kabsat AI Chat & LGU Dashboard Views

**Files:**
- Modify: `Systems/System1/app/src/ui/KabsatAI.jsx`
- Modify: `Systems/System1/app/src/ui/Dashboard.jsx`

**Deliverable:**
Polished, modern offline conversational interface for Kabsat AI with source verification pills and quick-prompt chips; authoritative yet accessible civic dashboard with competency mastery charts, telemetry queue monitor, and human-in-the-loop remediation approvals.

- [ ] Redesign `KabsatAI`:
  - Header with Kabsat avatar, offline badge ("Offline · Grounded sa Aralin"), and back button.
  - Chat feed with modern message bubbles: user bubbles in accent blue, Kabsat bubbles in crisp surface card with avatar.
  - Grounded source citation box inside assistant replies with document icon, confidence score bar, and verification checkmark.
  - Refusal state with friendly alert icon and capsule suggestion.
  - Audio playback button ("Pakinggan") on bot messages.
  - Horizontal scrolling prompt chips for quick tapping with tactile border styling.
  - Modern bottom chat input box with send button icon and smooth focus rings.
- [ ] Redesign `Dashboard`:
  - Executive header with City of San Fernando badge and sync status.
  - Metric summary cards (Learners, Average Mastery, Pending Sync).
  - Competency Mastery bars with percentage indicators, color-coded status pills (Matatag >70%, Katamtaman 50-70%, Nangangailangan <50%).
  - Barangay overview table/cards with clean tabular alignment.
  - Offline Sync Queue card with queue size counter and "Simulate barangay Wi-Fi" action button with loading spinner state.
  - Proposed Remediation list with facilitator "Aprubahan" (Approve) button that gives immediate confirmation feedback.
- [ ] Run vitest suite to ensure 55/55 pass.

---

### Task 6: End-to-End Visual Verification, Build Verification, and Final Smoke Test

**Files:**
- Verify: Full test suite (`npx vitest run`)
- Verify: Production Vite build (`npm run build`)
- Verify: Visual inspection of all 5 tabs and light/dark modes

**Deliverable:**
Zero regressions across all existing functionality, pristine build output, and verified high-contrast responsive UI across both themes.

- [ ] Run `npm run build` from `Systems/System1/app` to verify no bundle or CSS compilation errors.
- [ ] Run `npx vitest run` from `Systems/System1/app` to confirm 55/55 tests pass.
- [ ] Verify light mode and dark mode across all 5 views.
- [ ] Verify keyboard focus indicators and reduced-motion media query compliance.
