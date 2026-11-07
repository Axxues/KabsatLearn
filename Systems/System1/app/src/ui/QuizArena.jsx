import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  BAND_LABELS,
  createState,
  markAnswered,
  nextQuestion,
  recordAnswer,
  scoreAnswer as computeScore,
} from '../lib/adaptive.js'
import { playCorrect, playLevelUp, playTick, playWrong } from '../lib/audio.js'
import { queueEvent } from '../lib/telemetry.js'
import { useI18n } from '../lib/i18n.jsx'
import RollingNumber from './RollingNumber.jsx'
import AnimatedSuccessCheck from './AnimatedSuccessCheck.jsx'
import {
  ArrowLeft,
  Trophy,
  Zap,
  User,
  Users,
  RotateCcw,
  Check,
  Lightbulb,
  Flame,
  X,
  ShieldCheck,
  Briefcase,
  Smartphone,
  Wallet,
  Heart,
  Package,
  Sparkles,
  ChevronDown,
  Clock,
  AlertTriangle,
} from 'lucide-react'

const DEFAULT_LIMIT_MS = 15000
const REVEAL_MS = 1600

const COURSE_ICONS = {
  'capsule-101': ShieldCheck,
  'capsule-102': Briefcase,
  'capsule-103': Smartphone,
  'capsule-104': Wallet,
  'capsule-105': Heart,
  'capsule-106': Package,
}


const TILES = [
  {
    color: '#e11d48',
    bgClass: 'from-[#e11d48] to-[#be123c] border-[#9f1239]',
    shape: '▲',
    label: 'Triangle',
  },
  {
    color: '#2563eb',
    bgClass: 'from-[#2563eb] to-[#1d4ed8] border-[#1e40af]',
    shape: '◆',
    label: 'Diamond',
  },
  {
    color: '#d97706',
    bgClass: 'from-[#d97706] to-[#b45309] border-[#92400e]',
    shape: '●',
    label: 'Circle',
  },
  {
    color: '#16a34a',
    bgClass: 'from-[#16a34a] to-[#15803d] border-[#166534]',
    shape: '■',
    label: 'Square',
  },
]

function Tile({ tile, index, text, state, disabled, onPick }) {
  const isCorrect = state === 'correct'
  const isWrong = state === 'wrong'
  const isDimmed = state === 'dimmed'

  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      disabled={disabled}
      className={`group relative flex min-h-[58px] w-full items-center justify-between gap-3 overflow-hidden rounded-2xl border-b-[3px] bg-gradient-to-br p-3 sm:px-4 text-left text-white shadow-sm transition-all duration-150 ${
        tile.bgClass
      } ${
        disabled
          ? 'cursor-default'
          : 'hover:brightness-105 active:translate-y-[2px] active:border-b-0 active:brightness-95 cursor-pointer'
      } ${
        isCorrect
          ? 'ring-4 ring-white ring-offset-2 ring-offset-[var(--color-bg)] scale-[1.02] z-10 shadow-lg'
          : ''
      } ${
        isWrong
          ? 'opacity-40 grayscale-[40%] scale-[0.98]'
          : isDimmed
            ? 'opacity-35 grayscale-[20%] scale-[0.98]'
            : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-black/25 text-sm font-black shadow-inner ring-1 ring-white/20"
        >
          {tile.shape}
        </span>
        <span className="text-sm sm:text-base font-bold leading-snug drop-shadow-xs line-clamp-2">
          {text}
        </span>
      </div>

      <div className="shrink-0 pl-1">
        {isCorrect && (
          <span className="flex size-7 items-center justify-center rounded-full bg-white text-[var(--color-good)] shadow-md animate-pop-in">
            <Check className="size-4 stroke-[3]" aria-hidden="true" />
          </span>
        )}
        {isWrong && (
          <span className="flex size-7 items-center justify-center rounded-full bg-white/95 text-[var(--color-danger)] shadow-md animate-pop-in">
            <X className="size-4 stroke-[3]" aria-hidden="true" />
          </span>
        )}
      </div>
    </button>
  )
}

export default function QuizArena({
  capsule,
  onExit,
  onRunningChange,
  courses = [],
  selectedCourseId,
  onSelectCourse,
  _onLockedCourse,
}) {
  const { t } = useI18n()
  const bank = capsule.questions
  const [players, setPlayers] = useState(1)
  const [selectedPlayers, setSelectedPlayers] = useState(1)
  const [timePerQuestion, setTimePerQuestion] = useState(15)
  const [timeLimitMs, setTimeLimitMs] = useState(DEFAULT_LIMIT_MS)
  const [phase, setPhase] = useState('intro')
  const [index, setIndex] = useState(0)
  const [states, setStates] = useState(() => [createState(), createState()])
  const [scores, setScores] = useState([0, 0])
  const [correctCount, setCorrectCount] = useState([0, 0])
  const [chosen, setChosen] = useState(null)
  const [result, setResult] = useState(null)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [lastPoints, setLastPoints] = useState(0)
  const [badge, setBadge] = useState(null)
  const [coursePickerOpen, setCoursePickerOpen] = useState(false)
  const revealedFor = useRef(null)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!coursePickerOpen) return
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setCoursePickerOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCoursePickerOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [coursePickerOpen])

  const [activeQuestion, setActiveQuestion] = useState(null)
  const statesRef = useRef(states)
  const timerRef = useRef(null)

  useEffect(() => {
    statesRef.current = states
  }, [states])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const current = index % players
  const state = states[current] || states[0]
  // Keep the question stable during the round; activeQuestion is held through the reveal phase
  const question = activeQuestion || nextQuestion(bank, state).question

  const [confirmExitOpen, setConfirmExitOpen] = useState(false)
  const [pausedRemaining, setPausedRemaining] = useState(null)

  const remaining =
    phase === 'question'
      ? confirmExitOpen && pausedRemaining !== null
        ? pausedRemaining
        : Math.max(0, deadline - now)
      : 0

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    onRunningChange?.(phase === 'question' || phase === 'reveal')
  }, [phase, onRunningChange])

  useEffect(() => {
    if (confirmExitOpen) return
    if (phase === 'question' && remaining <= 0) {
      settle(-1)
    }
  })

  const start = (playerCount = selectedPlayers, timeSec = timePerQuestion) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const limitMs = timeSec * 1000
    setTimeLimitMs(limitMs)
    const initialStates = Array.from({ length: playerCount }, () => createState())
    setPlayers(playerCount)
    setStates(initialStates)
    statesRef.current = initialStates
    setScores(Array.from({ length: playerCount }, () => 0))
    setCorrectCount(Array.from({ length: playerCount }, () => 0))
    setIndex(0)
    setChosen(null)
    setResult(null)
    const { question: firstQ } = nextQuestion(bank, initialStates[0])
    setActiveQuestion(firstQ)
    setDeadline(Date.now() + limitMs)
    setNow(Date.now())
    setPhase('question')
    revealedFor.current = null
  }

  function settle(picked) {
    if (phase !== 'question' || !question) return
    const msRemaining = Math.max(0, deadline - Date.now())
    const isCorrect = picked === question.answer
    const points = computeScore({
      correct: isCorrect,
      msRemaining,
      msTotal: timeLimitMs,
      streak: state.correctStreak,
    })

    setChosen(picked)
    setResult({ isCorrect, points, answer: question.answer })
    setLastPoints(points)
    setScores((prev) => prev.map((value, i) => (i === current ? value + points : value)))
    if (isCorrect) setCorrectCount((prev) => prev.map((v, i) => (i === current ? v + 1 : v)))

    const nextState = recordAnswer(markAnswered(state, question.id), {
      correct: isCorrect,
      ms: timeLimitMs - msRemaining,
    })
    const updatedStates = states.map((value, i) => (i === current ? nextState : value))
    setStates(updatedStates)
    statesRef.current = updatedStates

    if (isCorrect) playCorrect()
    else playWrong()

    queueEvent({
      type: 'answer',
      competency: question.competency,
      correct: isCorrect,
      band: state.band,
      points,
    }).catch(() => {})
    if (nextState.changed) {
      setBadge(nextState.band)
      playLevelUp()
    } else {
      setBadge(null)
    }

    setPhase('reveal')
    revealedFor.current = question.id

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => advance(), REVEAL_MS)
  }

  function advance() {
    if (revealedFor.current !== (activeQuestion?.id || question?.id)) return
    revealedFor.current = null
    const next = index + 1
    if (next >= bank.length) {
      setPhase('done')
      return
    }
    const currentStates = statesRef.current || states
    const nextCurrent = next % players
    const { question: nextQ } = nextQuestion(bank, currentStates[nextCurrent])
    if (!nextQ) {
      setPhase('done')
      return
    }
    setActiveQuestion(nextQ)
    setIndex(next)
    setChosen(null)
    setResult(null)
    setBadge(null)
    setDeadline(Date.now() + timeLimitMs)
    setNow(Date.now())
    setPhase('question')
    playTick()
  }

  const handleExit = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onExit?.()
  }

  const requestExit = () => {
    const ms = Math.max(0, deadline - Date.now())
    setPausedRemaining(ms)
    setConfirmExitOpen(true)
  }

  const cancelExit = useCallback(() => {
    if (pausedRemaining !== null) {
      setDeadline(Date.now() + pausedRemaining)
      setNow(Date.now())
      setPausedRemaining(null)
    }
    setConfirmExitOpen(false)
  }, [pausedRemaining])

  const confirmExit = () => {
    setConfirmExitOpen(false)
    setPausedRemaining(null)
    handleExit()
  }

  useEffect(() => {
    if (!confirmExitOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cancelExit()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [confirmExitOpen, cancelExit])

  // --- Intro View ---
  if (phase === 'intro') {
    return (
      <div className="mx-auto flex flex-1 min-h-0 w-full max-w-[430px] flex-col justify-between bg-[var(--color-bg)] p-4 text-[var(--color-ink)] transition-colors duration-200">
        <header className="flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onExit}
            className="btn-press flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
            <span>{t('back')}</span>
          </button>

          {courses.length > 0 && (() => {
            const installedCourses = courses.filter((c) => c.installed !== false)
            const activeCourse =
              installedCourses.find((c) => c.id === selectedCourseId) ||
              installedCourses[0] ||
              courses[0]
            const ActiveIcon = (activeCourse && COURSE_ICONS[activeCourse.id]) || ShieldCheck

            return (
              <div ref={pickerRef} className="relative min-w-0 flex-1 max-w-[270px]">
                {/* Dropdown Select Trigger Button */}
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={coursePickerOpen}
                  onClick={() => setCoursePickerOpen((prev) => !prev)}
                  className={`btn-press flex h-9 w-full items-center justify-between gap-1.5 rounded-xl border bg-[var(--color-surface)] px-2.5 text-left shadow-2xs transition-all ${
                    coursePickerOpen
                      ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20'
                      : 'border-[var(--color-line)] hover:border-[var(--color-accent)]/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="sr-only">{t('chooseCourse')}:</span>
                    <div className="flex size-5.5 items-center justify-center rounded-md bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shrink-0">
                      <ActiveIcon className="size-3.5 stroke-[2.2]" aria-hidden="true" />
                    </div>
                    <span className="truncate text-xs font-bold text-[var(--color-ink)]">
                      {activeCourse?.title || t('chooseCourse')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pl-1">
                    <ChevronDown
                      className={`size-3.5 text-[var(--color-muted)] transition-transform duration-200 ${
                        coursePickerOpen ? 'rotate-180 text-[var(--color-accent)]' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                {/* Dropdown Menu Options */}
                {coursePickerOpen && (
                  <div
                    role="listbox"
                    aria-label={t('chooseCourse')}
                    className="absolute right-0 top-full mt-1.5 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-2xl ring-1 ring-black/10 space-y-1"
                  >
                    <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-muted)] border-b border-[var(--color-line)]/50 pb-1 mb-1">
                      <span className="flex items-center gap-1">
                        <Sparkles className="size-3 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                        <span>{t('chooseCourse')}</span>
                      </span>
                      <span className="rounded-full bg-[var(--color-surface-sunken)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--color-muted)] border border-[var(--color-line)]">
                        {installedCourses.length === 1
                          ? t('courseCountSingle', { n: installedCourses.length })
                          : t('courseCountPlural', { n: installedCourses.length })}
                      </span>
                    </div>

                    {installedCourses.map((course) => {
                      const Icon = COURSE_ICONS[course.id] || ShieldCheck
                      const selected = course.id === (activeCourse?.id || selectedCourseId)
                      return (
                        <button
                          key={course.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          aria-pressed={selected ? 'true' : 'false'}
                          onClick={() => {
                            setCoursePickerOpen(false)
                            onSelectCourse?.(course.id)
                          }}
                          className={`btn-press group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-all duration-150 ${
                            selected
                              ? 'bg-[var(--color-accent-subtle)]/70 text-[var(--color-ink)]'
                              : 'hover:bg-[var(--color-surface-hover)] text-[var(--color-ink)]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`flex size-7 items-center justify-center rounded-lg transition-colors shrink-0 ${
                                selected
                                  ? 'bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-xs'
                                  : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                              }`}
                            >
                              <Icon className="size-3.5 stroke-[2.2]" aria-hidden="true" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold truncate leading-tight">
                                {course.title}
                              </span>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}
        </header>

        {/* Unified Arena Lobby Card */}
        <div className="my-auto py-2">
          <div className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-md text-center">
            {/* Subtle atmospheric accent glow for dark and light modes */}
            <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 size-40 rounded-full bg-[var(--color-accent)]/10 blur-2xl" aria-hidden="true" />

            <div className="relative mx-auto mb-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] px-3 py-1 shadow-2xs">
              <Trophy className="size-3.5 text-[var(--color-accent-strong)] stroke-[2.5]" aria-hidden="true" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-strong)] truncate max-w-[220px]">
                {capsule.title}
              </span>
            </div>

            <h1 className="relative text-xl sm:text-2xl font-black tracking-tight text-[var(--color-ink)]">
              {t('quizTitle')}
            </h1>
            <p className="relative mt-1.5 text-xs text-[var(--color-muted)] leading-relaxed max-w-[300px] mx-auto">
              {t('quizSubtitle', { count: bank.length })}
            </p>
          </div>
        </div>

        {/* Customizable Game Settings Card */}
        <div className="my-auto rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-sm space-y-3.5">
          {/* Time per Question Setting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink)]">
                <Clock className="size-3.5 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                <span>{t('timePerQuestion')}</span>
              </span>
              <span className="rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 px-2 py-0.5 text-[10px] font-black text-[var(--color-accent-strong)] tabular-nums">
                {timePerQuestion}s
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[10, 15, 20, 30].map((sec) => {
                const isSelected = timePerQuestion === sec
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setTimePerQuestion(sec)}
                    aria-pressed={isSelected}
                    className={`btn-press flex h-8 items-center justify-center rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white shadow-xs ring-2 ring-[var(--color-accent)]/20'
                        : 'border border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-accent)]/40'
                    }`}
                  >
                    {sec}s
                  </button>
                )
              })}
            </div>
          </div>

          {/* Amount of Players Setting */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink)]">
                <Users className="size-3.5 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                <span>{t('playersLabel')}</span>
              </span>
              <span className="rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 px-2 py-0.5 text-[10px] font-black text-[var(--color-accent-strong)]">
                {selectedPlayers === 1 ? t('playSoloShort') : t('playerCountOption', { n: selectedPlayers })}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((count) => {
                const isSelected = selectedPlayers === count
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedPlayers(count)}
                    aria-pressed={isSelected}
                    className={`btn-press flex h-8 items-center justify-center rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? 'bg-[var(--color-accent)] text-white shadow-xs ring-2 ring-[var(--color-accent)]/20'
                        : 'border border-[var(--color-line)] bg-[var(--color-surface-sunken)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:border-[var(--color-accent)]/40'
                    }`}
                  >
                    {count === 1 ? t('soloOption') : `${count}P`}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Single Launch Action Button */}
        <div className="pb-2">
          <button
            type="button"
            onClick={() => start(selectedPlayers, timePerQuestion)}
            className="btn-press flex min-h-12 w-full items-center justify-between rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-left font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)] transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 text-white shrink-0">
                {selectedPlayers === 1 ? (
                  <User className="size-4 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <Users className="size-4 stroke-[2.5]" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold leading-tight">
                  {selectedPlayers === 1
                    ? t('playSolo')
                    : t('playPassCustom', { n: selectedPlayers })}
                </p>
                <p className="text-[11px] font-medium text-blue-100 leading-tight mt-0.5 truncate">
                  {selectedPlayers === 1 ? t('playSoloSub') : t('playPassSub')} · {timePerQuestion}s
                </p>
              </div>
            </div>
            <span className="text-xs font-bold shrink-0 pl-2">
              {t('startQuizCta')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  // --- Podium / Game Over View ---
  if (phase === 'done') {
    const maxScore = Math.max(...scores)
    const topPlayers = scores
      .map((score, i) => ({ player: i, score }))
      .filter((p) => p.score === maxScore)
    const winner = topPlayers.length === 1 ? topPlayers[0].player : null

    const rankedPlayers = scores
      .map((score, i) => ({
        index: i,
        score,
        correct: correctCount[i] || 0,
      }))
      .sort((a, b) => b.score - a.score)

    return (
      <div className="mx-auto flex flex-1 min-h-0 max-w-[430px] flex-col justify-between bg-[var(--color-bg)] p-5 text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
        <div className="pt-6 text-center space-y-2">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--color-good-subtle)] text-[var(--color-good)] shadow-inner">
            <Trophy className="size-8 stroke-[2.5]" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-ink)]">
            {players === 1
              ? t('roundCompleteSolo')
              : winner === null
                ? t('roundCompleteDraw')
                : t('roundCompleteWinner', { winner: winner + 1 })}
          </h1>
          <p className="text-xs text-[var(--color-muted)]">
            {t('roundEffort', { title: capsule.title })}
          </p>
        </div>

        <ol className="my-auto space-y-3 py-4">
          {rankedPlayers.map((entry, rank) => {
            const isTop = players > 1 && entry.score === maxScore && winner !== null
            return (
              <li
                key={entry.index}
                className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${
                  isTop
                    ? 'border-[var(--color-terracotta)] bg-[var(--color-terracotta-subtle)]/40 ring-2 ring-[var(--color-terracotta)]/30'
                    : 'border-[var(--color-line)] bg-[var(--color-surface)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-xl text-base font-black ${
                      isTop
                        ? 'bg-[var(--color-terracotta)] text-white'
                        : 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)]'
                    }`}
                  >
                    #{rank + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[var(--color-ink)]">
                      {players === 1 ? t('yourScore') : t('playerLabel', { n: entry.index + 1 })}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {t('correctTally', {
                        correct: entry.correct,
                        total: Math.ceil(bank.length / players),
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black tabular-nums text-[var(--color-ink)]">
                    <RollingNumber value={entry.score} />
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
                    {t('pointsLabel')}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        <div className="space-y-3 pb-4">
          <button
            type="button"
            onClick={() => start(players, timePerQuestion)}
            className="btn-press flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] text-base font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
          >
            <RotateCcw className="size-5 stroke-[2.5]" aria-hidden="true" />
            <span>{t('playAgain')}</span>
          </button>
          <button
            type="button"
            onClick={handleExit}
            className="btn-press flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] text-sm font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            {t('backToCourses')}
          </button>
        </div>
      </div>
    )
  }

  // --- No Question Fallback ---
  if (!question) {
    return (
      <div className="mx-auto flex flex-1 min-h-0 max-w-[430px] flex-col items-center justify-center p-6 text-center bg-[var(--color-bg)]">
        <p className="text-sm font-semibold text-[var(--color-muted)]">
          {t('noQuestions')}
        </p>
        <button
          type="button"
          onClick={handleExit}
          className="btn-press mt-4 min-h-11 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-white"
        >
          {t('backToCourses')}
        </button>
      </div>
    )
  }

  // Calculate timer percent and color
  const timerPercent = Math.max(0, (remaining / timeLimitMs) * 100)
  const timerColor =
    timerPercent > 45
      ? 'bg-[var(--color-good)]'
      : timerPercent > 20
        ? 'bg-[var(--color-warn)]'
        : 'bg-[var(--color-danger)] animate-pulse'

  return (
    <div className="mx-auto flex flex-1 min-h-0 max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
      {/* Quiz HUD Header */}
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 pt-3.5 pb-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={requestExit}
              className="btn-press flex size-8 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)] shadow-2xs active:scale-95 transition-all"
              aria-label="Lumabas sa Quiz"
            >
              <X className="size-4 stroke-[2.5]" aria-hidden="true" />
            </button>
            <span className="font-extrabold tabular-nums text-xs tracking-tight text-[var(--color-ink)]">
              {t('questionProgress', { current: index + 1, total: bank.length })}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent)]/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-accent-strong)]">
              {BAND_LABELS[state.band] || state.band}
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-[var(--color-surface-sunken)] px-2 py-0.5 font-black tabular-nums text-xs text-[var(--color-ink)] border border-[var(--color-line)]">
              <RollingNumber value={scores[current]} /> <span className="text-[10px] text-[var(--color-muted)] font-bold">{t('pts')}</span>
            </span>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-line)]/50 p-0.5" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-all duration-100 ease-linear shadow-xs ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Multi-Player Indicator or Streak info */}
        <div className="mt-2 flex items-center justify-between text-[11px] min-h-[22px]">
          {players > 1 ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-[var(--color-accent)] bg-[var(--color-accent-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-accent)]/20">
              <Users className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
              {t('turnIndicator', { n: current + 1 })}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[var(--color-muted)]">
              {state.correctStreak > 1 ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-[var(--color-terracotta-subtle)] px-2 py-0.5 border border-[var(--color-terracotta)]/25">
                  <Flame className="size-3.5 text-[var(--color-terracotta)] fill-[var(--color-terracotta)] animate-bounce" aria-hidden="true" />
                  <span className="font-extrabold text-[var(--color-terracotta)]">{t('streakIndicator', { n: state.correctStreak })}</span>
                </span>
              ) : (
                <span className="font-medium text-[var(--color-muted)]">{t('speedPrompt')}</span>
              )}
            </span>
          )}

          {badge && (
            <span
              className="animate-bounce flex items-center gap-1 font-extrabold text-[var(--color-terracotta)] bg-[var(--color-terracotta-subtle)] px-2 py-0.5 rounded-md border border-[var(--color-terracotta)]/20"
              role="status"
            >
              <Zap className="size-3 fill-[var(--color-terracotta)]" aria-hidden="true" />
              {badge === 'stretch' ? t('levelUp') : t('adaptiveShift')}
            </span>
          )}
        </div>
      </header>

      {/* Main Question & Kahoot Tiles Area with Technique 05: Fast, then slow */}
      <main key={question.id} className="flex flex-1 flex-col justify-between px-4 py-3.5 space-y-3.5 page-enter">
        {/* Question Prompt Card */}
        <div className="relative flex min-h-[100px] flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-sunken)] border border-[var(--color-line)] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-muted)]">
              <Sparkles className="size-3 text-[var(--color-accent)]" aria-hidden="true" />
              <span>{question.competency ? question.competency.replace(/-/g, ' ') : `Question ${index + 1}`}</span>
            </span>
            <span className="text-[11px] font-black tabular-nums text-[var(--color-muted)]">
              {Math.ceil(remaining / 1000)}s
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-black leading-snug tracking-tight text-[var(--color-ink)] text-center my-auto">
            {question.stem}
          </h1>
        </div>

        {/* Stacked Option Buttons */}
        <div className="flex flex-col gap-2.5 my-auto">
          {question.options.map((option, i) => {
            let tileState = 'idle'
            if (phase === 'reveal') {
              if (i === result?.answer) tileState = 'correct'
              else if (i === chosen) tileState = 'wrong'
              else tileState = 'dimmed'
            }
            return (
              <Tile
                key={option}
                tile={TILES[i]}
                index={i}
                text={option}
                state={tileState}
                disabled={phase !== 'question'}
                onPick={settle}
              />
            )
          })}
        </div>

        {/* Reveal Feedback Banner or subtle hint with no layout shift */}
        <div className="min-h-[56px] flex items-center justify-center">
          {phase === 'reveal' ? (
            <div
              className={`w-full rounded-2xl border p-3 text-center shadow-md animate-pop-in ${
                result?.isCorrect
                  ? 'border-[var(--color-good)]/30 bg-[var(--color-good-subtle)] text-[var(--color-good)]'
                  : 'border-[var(--color-warn)]/30 bg-[var(--color-warn-subtle)] text-[var(--color-warn)]'
              }`}
              role="status"
            >
              {result?.isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <AnimatedSuccessCheck className="size-5" circleColor="var(--color-good)" tickColor="var(--color-good)" />
                  <p className="text-sm font-extrabold">
                    {t('correctAnswer', { points: lastPoints })}
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className="size-4 stroke-[2.5]" aria-hidden="true" />
                  <p className="text-sm font-extrabold">
                    {t('wrongAnswer')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full text-center py-1">
              <span className="text-[11px] font-semibold text-[var(--color-muted)] tracking-wide">
                {t('speedPrompt')}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      {confirmExitOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity"
            onClick={cancelExit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-exit-quiz-title"
          >
            <div
              className="relative m-auto w-full max-w-[360px] rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-2xl transition-all animate-pop-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-[var(--color-line)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-danger-subtle)] text-[var(--color-danger)]">
                    <AlertTriangle className="size-5 stroke-[2.2]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 id="confirm-exit-quiz-title" className="text-base font-bold text-[var(--color-ink)]">
                      {t('exitQuizTitle')}
                    </h3>
                    <p className="truncate text-xs font-medium text-[var(--color-muted)]">
                      {capsule.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelExit}
                  className="btn-press flex size-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
                  aria-label={t('exitQuizCancel')}
                >
                  <X className="size-4 stroke-[2.5]" aria-hidden="true" />
                </button>
              </div>

              {/* Explanation Prompt */}
              <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted)]">
                {t('exitQuizPrompt')}
              </p>

              {/* Action Buttons: Keep Playing and Leave Quiz */}
              <div className="mt-5 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={cancelExit}
                  className="btn-press flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-2.5 text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)]"
                >
                  {t('exitQuizCancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmExit}
                  className="btn-press flex-1 rounded-xl bg-[var(--color-danger)] py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-95"
                >
                  {t('exitQuizConfirm')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
