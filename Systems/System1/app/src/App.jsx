import { useCallback, useEffect, useState } from 'react'
import capsule101 from './data/capsules/capsule-101.json'
import capsule102 from './data/capsules/capsule-102.json'
import { getCapsule, listCapsules, seedCapsule } from './lib/capsuleStore.js'
import { importCapsuleFile, shareCapsule } from './lib/share.js'
import { useOnline } from './lib/useOnline.js'
import CourseHub from './ui/CourseHub.jsx'
import OfflineBanner from './ui/OfflineBanner.jsx'
import QuizArena from './ui/QuizArena.jsx'
import KabsatAI from './ui/KabsatAI.jsx'
import Dashboard from './ui/Dashboard.jsx'
import StoryReader from './ui/StoryReader.jsx'

const TABS = [
  { id: 'hub', label: 'Courses' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'tutor', label: 'Kabsat' },
  { id: 'dashboard', label: 'LGU' },
]

const CATALOG = [capsule101, capsule102].map((capsule) => ({
  id: capsule.id,
  title: capsule.title,
  subtitle: capsule.subtitle,
  cards: capsule.cards.length,
  questions: capsule.questions.length,
  kb: Math.max(1, Math.round(JSON.stringify(capsule).length / 1024)),
}))

const EMPTY = {
  hub: 'Course capsules you have on this phone. Nothing here needs the internet.',
  quiz: 'Answer fast, climb the bands. Miss twice and Kabsat slows down for you.',
  tutor: 'Answers come from your downloaded courses. Out of scope, Kabsat says so.',
  dashboard: 'Skill gaps by barangay, and progress waiting to sync.',
}

export default function App() {
  const online = useOnline()
  const [tab, setTab] = useState('hub')
  const [readerId, setReaderId] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)
  const [toast, setToast] = useState(null)

  const refresh = useCallback(async () => {
    const installed = await listCapsules()
    const installedIds = new Set(installed.map((c) => c.id))
    setCapsules(CATALOG.map((c) => ({ ...c, installed: installedIds.has(c.id) })))
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!(await getCapsule('capsule-101'))) {
        await seedCapsule(capsule101)
      }
      if (!cancelled) await refresh()
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const download = async (id) => {
    const capsule = id === 'capsule-102' ? capsule102 : null
    if (!capsule) return
    setDownloadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1800))
    await seedCapsule(capsule)
    await refresh()
    setDownloadingId(null)
  }

  const openReader = (id) => setReaderId(id)

  const share = async (id) => {
    const result = await shareCapsule(id)
    if (result.method === 'share') setToast('Capsule shared.')
    else if (result.method === 'download') setToast('Saved as a .kabsat file.')
    else setToast('Share cancelled.')
  }

  const importFile = async (file) => {
    const result = await importCapsuleFile(file)
    setToast(result.ok ? 'Capsule added.' : `Import refused: ${result.error}.`)
    await refresh()
  }

  if (readerId) {
    const capsule = [capsule101, capsule102].find((c) => c.id === readerId)
    return <StoryReader capsule={capsule} onExit={() => setReaderId(null)} />
  }

  if (tab === 'quiz') {
    return <QuizArena capsule={capsule101} onExit={() => setTab('hub')} />
  }

  if (tab === 'tutor') {
    return <KabsatAI capsule={capsule101} onExit={() => setTab('hub')} />
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-accent)] uppercase">
            KabsatLearn
          </p>
          <h1 className="text-xl font-bold">
            {tab === 'hub' ? 'Your courses' : tab === 'quiz' ? 'Quiz arena' : tab === 'tutor' ? 'Ask Kabsat' : 'City insights'}
          </h1>
        </div>
        <OfflineBanner online={online} />
      </header>

      <main className="flex-1 px-4 py-6">
        {tab === 'hub' && (
          <CourseHub
            capsules={capsules}
            onOpen={openReader}
            onDownload={download}
            onShare={share}
            onImport={importFile}
            downloadingId={downloadingId}
          />
        )}
        {toast && (
          <p role="status" className="mt-4 rounded-xl bg-[var(--color-surface)] p-3 text-sm">
            {toast}
          </p>
        )}
        {tab === 'dashboard' && <Dashboard />}
      </main>

      <nav
        aria-label="Main"
        className="sticky bottom-0 grid grid-cols-4 border-t border-[var(--color-line)] bg-[var(--color-surface)]"
      >
        {TABS.map((item) => {
          const active = item.id === tab
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => setTab(item.id)}
              className={`min-h-14 border-t-2 px-2 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
