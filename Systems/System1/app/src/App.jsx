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
import {
  BookOpen,
  Trophy,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  CheckCircle2,
  X,
  GraduationCap,
} from 'lucide-react'

const TABS = [
  {
    id: 'hub',
    label: 'Aralin',
    subtitle: 'Mga kurso sa telepono',
    icon: BookOpen,
  },
  {
    id: 'quiz',
    label: 'Quiz',
    subtitle: 'Paligsahan ng galing',
    icon: Trophy,
  },
  {
    id: 'tutor',
    label: 'Kabsat AI',
    subtitle: 'Grounded na gabay',
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    label: 'LGU Hub',
    subtitle: 'Ulat sa San Fernando',
    icon: BarChart3,
  },
]

const CATALOG = [capsule101, capsule102].map((capsule) => ({
  id: capsule.id,
  title: capsule.title,
  subtitle: capsule.subtitle,
  cards: capsule.cards.length,
  questions: capsule.questions.length,
  kb: Math.max(1, Math.round(JSON.stringify(capsule).length / 1024)),
}))

export default function App() {
  const online = useOnline()
  const [tab, setTab] = useState('hub')
  const [readerId, setReaderId] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kabsat_theme')
      if (stored) return stored
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('kabsat_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

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
    if (result.method === 'share') setToast('Naibahagi ang aralin via Nearby/Share.')
    else if (result.method === 'download') setToast('Na-save bilang .kabsat file.')
    else setToast('Nakansela ang pagbahagi.')
  }

  const importFile = async (file) => {
    const result = await importCapsuleFile(file)
    setToast(result.ok ? 'Tagumpay: Naidagdag ang aralin sa iyong telepono!' : `Hindi tinanggap: ${result.error}.`)
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
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Top Mobile App Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-accent-strong)] text-[var(--color-on-accent)] shadow-sm">
            <GraduationCap className="size-5 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                KabsatLearn
              </span>
              <span className="rounded-full bg-[var(--color-terracotta)]/15 px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-terracotta)]">
                La Union
              </span>
            </div>
            <h1 className="text-base font-bold leading-tight text-[var(--color-ink)]">
              {tab === 'hub' ? 'Mga Kurso' : 'City Insights'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OfflineBanner online={online} />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="btn-press flex size-9 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            {theme === 'light' ? (
              <Moon className="size-4.5 stroke-[2]" aria-hidden="true" />
            ) : (
              <Sun className="size-4.5 text-[var(--color-warn)] stroke-[2]" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-5">
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
        {tab === 'dashboard' && <Dashboard />}

        {/* Floating Toast Notification */}
        {toast && (
          <div
            role="status"
            className="animate-toast fixed bottom-20 left-1/2 z-50 flex w-[90%] max-w-[390px] items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-xl transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                <CheckCircle2 className="size-4 stroke-[2.5]" aria-hidden="true" />
              </span>
              <p className="truncate text-xs font-semibold text-[var(--color-ink)]">{toast}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="btn-press flex size-6 items-center justify-center rounded-lg text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <X className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav
        aria-label="Main Navigation"
        className="sticky bottom-0 z-30 grid grid-cols-4 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 py-1.5 backdrop-blur-md"
      >
        {TABS.map((item) => {
          const active = item.id === tab
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? 'page' : undefined}
              onClick={() => setTab(item.id)}
              className={`btn-press flex flex-col items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div
                className={`flex size-8 items-center justify-center rounded-xl transition-all duration-150 ${
                  active
                    ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shadow-xs scale-105'
                    : 'text-[var(--color-muted)]'
                }`}
              >
                <Icon className="size-4.5 stroke-[2]" aria-hidden="true" />
              </div>
              <span className={`text-[11px] leading-tight ${active ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
