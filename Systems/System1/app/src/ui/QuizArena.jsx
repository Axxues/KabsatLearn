import { useEffect, useMemo, useRef, useState } from 'react'
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
  Timer,
  Zap,
  User,
  Users,
  RotateCcw,
  Check,
  Lightbulb,
  Flame,
  X,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Lock,
} from 'lucide-react'

const LIMIT_MS = 15000
const REVEAL_MS = 1600

const COURSE_ICONS = {
  'capsule-101': ShieldCheck,
  'capsule-102': Briefcase,
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
      className={`group relative flex min-h-[105px] flex-col justify-between overflow-hidden rounded-2xl border-b-4 bg-gradient-to-br p-3.5 text-left text-white shadow-sm transition-all duration-100 ${
        tile.bgClass
      } ${
        disabled
          ? 'cursor-default'
          : 'active:translate-y-1 active:border-b-0 active:brightness-95'
      } ${
        isCorrect
          ? 'ring-4 ring-white ring-offset-2 ring-offset-[var(--color-bg)] scale-[1.02] z-10 shadow-lg'
          : ''
      } ${
        isWrong
          ? 'opacity-40 grayscale-[40%]'
          : isDimmed
            ? 'opacity-35'
            : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <span
          aria-hidden="true"
          className="flex size-7 items-center justify-center rounded-lg bg-black/25 text-base font-black shadow-inner"
        >
          {tile.shape}
        </span>
        {isCorrect && (
          <span className="flex size-6 items-center justify-center rounded-full bg-white text-[var(--color-good)] shadow-md">
            <Check className="size-4 stroke-[3]" aria-hidden="true" />
          </span>
        )}
      </div>
      <span className="mt-2 text-sm font-bold leading-snug line-clamp-3 drop-shadow-xs">
        {text}
      </span>
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
  onLockedCourse,
}) {
  const { t } = useI18n()
  const bank = capsule.questions
  const [players, setPlayers] = useState(1)
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
  const revealedFor = useRef(null)

  const current = index % players
  const state = states[current]
  const { question } = useMemo(() => nextQuestion(bank, state), [bank, state])

  const remaining = phase === 'question' ? Math.max(0, deadline - now) : 0

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    onRunningChange?.(phase === 'question' || phase === 'reveal')
  }, [phase, onRunningChange])

  useEffect(() => {
    if (phase === 'question' && remaining <= 0) {
      settle(-1)
    }
  })

  const start = (playerCount) => {
    setPlayers(playerCount)
    setStates([createState(), createState()])
    setScores([0, 0])
    setCorrectCount([0, 0])
    setIndex(0)
    setChosen(null)
    setResult(null)
    setDeadline(Date.now() + LIMIT_MS)
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
      msTotal: LIMIT_MS,
      streak: state.correctStreak,
    })

    setChosen(picked)
    setResult({ isCorrect, points, answer: question.answer })
    setLastPoints(points)
    setScores((prev) => prev.map((value, i) => (i === current ? value + points : value)))
    if (isCorrect) setCorrectCount((prev) => prev.map((v, i) => (i === current ? v + 1 : v)))

    const nextState = recordAnswer(markAnswered(state, question.id), {
      correct: isCorrect,
      ms: LIMIT_MS - msRemaining,
    })
    setStates((prev) => prev.map((value, i) => (i === current ? nextState : value)))

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

    setTimeout(() => advance(), REVEAL_MS)
  }

  function advance() {
    if (revealedFor.current !== question?.id) return
    const next = index + 1
    if (next >= bank.length) {
      setPhase('done')
      return
    }
    setIndex(next)
    setChosen(null)
    setResult(null)
    setBadge(null)
    setDeadline(Date.now() + LIMIT_MS)
    setNow(Date.now())
    setPhase('question')
    playTick()
  }

  // --- Intro View ---
  if (phase === 'intro') {
    return (
      <div className="mx-auto flex flex-1 min-h-0 max-w-[430px] flex-col justify-between bg-[var(--color-bg)] p-5 text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
        <header className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onExit}
            className="btn-press flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            <ArrowLeft className="size-4 stroke-[2.5]" aria-hidden="true" />
            {t('back')}
          </button>
        </header>

        <div className="my-auto py-6 text-center space-y-4">
          {courses.length > 0 && (
            <section className="space-y-1.5 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-muted)]">
                {t('chooseCourse')}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {courses.map((course) => {
                  const Icon = COURSE_ICONS[course.id] || ShieldCheck
                  const selected = course.id === selectedCourseId
                  return (
                    <button
                      key={course.id}
                      type="button"
                      aria-pressed={course.installed ? selected : undefined}
                      onClick={() =>
                        course.installed
                          ? onSelectCourse?.(course.id)
                          : (onLockedCourse ?? onExit)?.()
                      }
                      className={`btn-press flex flex-col items-start gap-1 rounded-xl border-2 p-2.5 text-left transition-colors ${
                        !course.installed
                          ? 'border-dashed border-[var(--color-line)] bg-[var(--color-surface-sunken)] hover:border-[var(--color-accent)]'
                          : selected
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                            : 'border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]'
                      }`}
                    >
                      <span
                        className={
                          course.installed && selected
                            ? 'text-[var(--color-accent)]'
                            : 'text-[var(--color-muted)]'
                        }
                      >
                        {course.installed ? (
                          <Icon className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                        ) : (
                          <Lock className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                        )}
                      </span>
                      <span className="text-[11px] font-bold leading-snug text-[var(--color-ink)]">
                        {course.title}
                      </span>
                      <span className="text-[10px] text-[var(--color-muted)]">
                        {course.installed
                          ? t('questionsMeta', { n: course.questions })
                          : t('quizCourseLocked')}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          <div className="mx-auto flex size-18 items-center justify-center rounded-3xl bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-terracotta)] text-white shadow-lg shadow-[var(--color-accent)]/20 animate-bounce">
            <Trophy className="size-9 stroke-[2.2]" aria-hidden="true" />
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-[var(--color-terracotta)]">
              {capsule.title}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[var(--color-ink)]">
              {t('quizTitle')}
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
              {t('quizSubtitle', { count: bank.length })}
            </p>
          </div>

          {/* Rules & Game Stats pill */}
          <div className="grid grid-cols-2 gap-2 text-left">
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--color-ink)]">
                <Timer className="size-4 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
                <span>{t('stat15s')}</span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)]">{t('stat15sSub')}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-sm text-[var(--color-ink)]">
                <TrendingUp className="size-4 text-[var(--color-good)] stroke-[2.5]" aria-hidden="true" />
                <span>{t('statAdaptive')}</span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)]">{t('statAdaptiveSub')}</p>
            </div>
          </div>
        </div>

        {/* Mode Select Buttons */}
        <div className="space-y-3 pb-4">
          <button
            type="button"
            onClick={() => start(1)}
            className="btn-press flex min-h-14 w-full items-center justify-between rounded-2xl bg-[var(--color-accent)] px-5 text-left font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
          >
            <div className="flex items-center gap-3">
              <User className="size-5 stroke-[2.5]" aria-hidden="true" />
              <div>
                <p className="text-base font-extrabold">{t('playSolo')}</p>
                <p className="text-xs font-medium text-blue-100">{t('playSoloSub')}</p>
              </div>
            </div>
            <span className="text-sm font-bold">{t('startQuizCta')}</span>
          </button>

          <button
            type="button"
            onClick={() => start(2)}
            className="btn-press flex min-h-14 w-full items-center justify-between rounded-2xl border-2 border-[var(--color-line)] bg-[var(--color-surface)] px-5 text-left font-bold text-[var(--color-ink)] shadow-sm hover:border-[var(--color-accent)]"
          >
            <div className="flex items-center gap-3">
              <Users className="size-5 text-[var(--color-accent)] stroke-[2.5]" aria-hidden="true" />
              <div>
                <p className="text-base font-extrabold">{t('playPass')}</p>
                <p className="text-xs font-medium text-[var(--color-muted)]">{t('playPassSub')}</p>
              </div>
            </div>
            <span className="text-sm font-bold text-[var(--color-accent)]">{t('startQuizCta')}</span>
          </button>
        </div>
      </div>
    )
  }

  // --- Podium / Game Over View ---
  if (phase === 'done') {
    const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
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
          {scores.map((score, i) => {
            const isTop = players === 2 && i === winner
            return (
              <li
                key={i}
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
                    #{i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-[var(--color-ink)]">
                      {players === 1 ? t('yourScore') : t('playerLabel', { n: i + 1 })}
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {t('correctTally', {
                        correct: correctCount[i],
                        total: Math.ceil(bank.length / players),
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black tabular-nums text-[var(--color-ink)]">
                    <RollingNumber value={score} />
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
            onClick={() => start(players)}
            className="btn-press flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-accent)] text-base font-bold text-[var(--color-on-accent)] shadow-md hover:bg-[var(--color-accent-strong)]"
          >
            <RotateCcw className="size-5 stroke-[2.5]" aria-hidden="true" />
            <span>{t('playAgain')}</span>
          </button>
          <button
            type="button"
            onClick={onExit}
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
          onClick={onExit}
          className="btn-press mt-4 min-h-11 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-white"
        >
          {t('backToCourses')}
        </button>
      </div>
    )
  }

  // Calculate timer percent and color
  const timerPercent = Math.max(0, (remaining / LIMIT_MS) * 100)
  const timerColor =
    timerPercent > 45
      ? 'bg-[var(--color-good)]'
      : timerPercent > 20
        ? 'bg-[var(--color-warn)]'
        : 'bg-[var(--color-danger)] animate-pulse'

  return (
    <div className="mx-auto flex flex-1 min-h-0 max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200">
      {/* Quiz HUD Header */}
      <header className="border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 pt-3.5 pb-3 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExit}
              className="btn-press flex size-8 items-center justify-center rounded-lg border border-[var(--color-line)] text-xs font-bold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              aria-label="Lumabas sa Quiz"
            >
              <X className="size-4 stroke-[2.5]" aria-hidden="true" />
            </button>
            <span className="font-bold tabular-nums text-[var(--color-ink)]">
              {t('questionProgress', { current: index + 1, total: bank.length })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--color-accent-subtle)] px-2.5 py-0.5 text-[11px] font-bold text-[var(--color-accent)]">
              {BAND_LABELS[state.band] || state.band}
            </span>
            <span className="rounded-lg bg-[var(--color-surface-sunken)] px-2 py-0.5 font-black tabular-nums text-[var(--color-ink)]">
              <RollingNumber value={scores[current]} /> {t('pts')}
            </span>
          </div>
        </div>

        {/* 15s Countdown Progress Bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]" aria-hidden="true">
          <div
            className={`h-full rounded-full transition-all duration-100 ease-linear ${timerColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {/* Multi-Player Indicator or Streak info */}
        <div className="mt-2 flex items-center justify-between text-[11px]">
          {players === 2 ? (
            <span className="inline-flex items-center gap-1 font-bold text-[var(--color-accent)]">
              <Users className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
              {t('turnIndicator', { n: current + 1 })}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[var(--color-muted)]">
              {state.correctStreak > 1 ? (
                <>
                  <Flame className="size-3.5 text-[var(--color-terracotta)] fill-[var(--color-terracotta)] animate-bounce" aria-hidden="true" />
                  <span className="font-bold text-[var(--color-terracotta)]">{t('streakIndicator', { n: state.correctStreak })}</span>
                </>
              ) : (
                t('speedPrompt')
              )}
            </span>
          )}

          {badge && (
            <span
              className="animate-bounce flex items-center gap-1 font-extrabold text-[var(--color-terracotta)]"
              role="status"
            >
              <Zap className="size-3 fill-[var(--color-terracotta)]" aria-hidden="true" />
              {badge === 'stretch' ? t('levelUp') : t('adaptiveShift')}
            </span>
          )}
        </div>
      </header>

      {/* Main Question & Kahoot Tiles Area with Technique 05: Fast, then slow */}
      <main key={question.id} className="flex flex-1 flex-col justify-between px-4 py-4 space-y-4 page-enter">
        {/* Question Prompt Card */}
        <div className="flex min-h-[90px] items-center justify-center rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-center shadow-sm">
          <h1 className="text-lg font-extrabold leading-snug text-[var(--color-ink)]">
            {question.stem}
          </h1>
        </div>

        {/* 4 Color Tiles */}
        <div className="grid flex-1 grid-cols-2 gap-2.5">
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

        {/* Reveal Feedback Banner with Technique 06: Draw the win */}
        {phase === 'reveal' && (
          <div
            className={`rounded-2xl border p-3.5 text-center shadow-md animate-pop-in ${
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
        )}
      </main>
    </div>
  )
}
