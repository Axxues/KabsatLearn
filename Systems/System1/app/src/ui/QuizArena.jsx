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

const LIMIT_MS = 15000
const REVEAL_MS = 1600

const TILES = [
  { color: '#e21b3c', shape: '▲', label: 'Triangle' },
  { color: '#1368ce', shape: '◆', label: 'Diamond' },
  { color: '#d89e00', shape: '●', label: 'Circle' },
  { color: '#26890c', shape: '■', label: 'Square' },
]

function Tile({ tile, index, text, state, disabled, onPick }) {
  const dimmed = state === 'idle' || state === 'dimmed'
  return (
    <button
      type="button"
      onClick={() => onPick(index)}
      disabled={disabled}
      className={`flex min-h-[96px] items-center gap-3 rounded-xl p-3 text-left text-white transition-transform ${
        dimmed ? 'opacity-100' : ''
      } ${state === 'correct' ? 'ring-4 ring-white' : ''} ${
        state === 'wrong' ? 'opacity-40' : ''
      } ${disabled ? '' : 'active:scale-[0.98]'}`}
      style={{ backgroundColor: tile.color }}
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        {tile.shape}
      </span>
      <span className="text-sm font-semibold leading-snug">{text}</span>
    </button>
  )
}

export default function QuizArena({ capsule, onExit }) {
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

  if (phase === 'intro') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--color-bg)] px-6 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
            {capsule.title}
          </p>
          <h1 className="mt-2 text-[32px] font-bold leading-tight">Quiz Arena</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {bank.length} questions. Sagot nang mabilis para mas mataas ang puntos.
          </p>
        </div>
        <div className="w-full max-w-[320px] space-y-3">
          <button
            type="button"
            onClick={() => start(1)}
            className="min-h-14 w-full rounded-xl bg-[var(--color-accent)] text-base font-bold text-[var(--color-on-accent)]"
          >
            Play solo
          </button>
          <button
            type="button"
            onClick={() => start(2)}
            className="min-h-14 w-full rounded-xl border-2 border-[var(--color-accent)] text-base font-bold text-[var(--color-accent)]"
          >
            Pass and play (2 players)
          </button>
          <button type="button" onClick={onExit} className="min-h-11 w-full text-sm text-[var(--color-muted)]">
            Back to courses
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const winner = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return (
      <div className="flex min-h-dvh flex-col bg-[var(--color-bg)] px-6 py-10">
        <h1 className="text-center text-[32px] font-bold">Podium</h1>
        <p className="mt-1 text-center text-sm text-[var(--color-muted)]">
          {players === 1 ? 'Round complete' : winner === null ? 'Draw!' : `Player ${winner + 1} wins`}
        </p>

        <ol className="mt-8 space-y-3">
          {scores.map((score, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[var(--color-accent)]/10 text-sm font-bold text-[var(--color-accent)]">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">Player {i + 1}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {correctCount[i]} / {Math.ceil(bank.length / players)} correct
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold tabular-nums">{score}</p>
            </li>
          ))}
        </ol>

        <div className="mt-auto space-y-3 pt-8">
          <button
            type="button"
            onClick={() => start(players)}
            className="min-h-14 w-full rounded-xl bg-[var(--color-accent)] text-base font-bold text-[var(--color-on-accent)]"
          >
            Play again
          </button>
          <button type="button" onClick={onExit} className="min-h-11 w-full text-sm text-[var(--color-muted)]">
            Back to courses
          </button>
        </div>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="p-6">
        <p className="text-sm text-[var(--color-muted)]">No questions left in this course.</p>
        <button type="button" onClick={onExit} className="mt-4 min-h-11 text-sm font-medium text-[var(--color-accent)]">
          Back to courses
        </button>
      </div>
    )
  }

  const timerPercent = Math.max(0, (remaining / LIMIT_MS) * 100)

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-bg)]">
      <header className="px-4 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {index + 1} / {bank.length}
          </span>
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2 py-1 text-xs font-semibold text-[var(--color-accent)]">
            {BAND_LABELS[state.band]}
          </span>
          <span className="tabular-nums font-semibold">{scores[current]}</span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-line)]" aria-hidden="true">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-[width] duration-100 ease-linear"
            style={{ width: `${timerPercent}%` }}
          />
        </div>

        {players === 2 && phase !== 'done' && (
          <p className="mt-2 text-center text-xs font-semibold text-[var(--color-accent)]">
            Player {current + 1}&rsquo;s turn
          </p>
        )}

        {badge && (
          <p className="mt-2 text-center text-sm font-bold text-[var(--color-accent)]" role="status">
            ⚡ {badge === 'stretch' ? 'HARD MODE' : badge === 'core' ? 'CORE' : 'FOUNDATION'}
          </p>
        )}
      </header>

      <main className="flex flex-1 flex-col px-4 py-4">
        <h1 className="text-center text-[22px] font-bold leading-snug">{question.stem}</h1>

        <div className="mt-4 grid flex-1 grid-cols-2 gap-2">
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

        {phase === 'reveal' && (
          <div className="mt-3 rounded-xl bg-[var(--color-surface)] p-3 text-center" role="status">
            {result?.isCorrect ? (
              <p className="text-sm font-bold text-[var(--color-good)]">
                Tama! +{lastPoints} points
              </p>
            ) : (
              <p className="text-sm font-bold text-[var(--color-warn)]">
                Mali. Ang tamang sagot ay ang naka-highlight.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
