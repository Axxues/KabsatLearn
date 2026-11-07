import { useCallback, useEffect, useState } from 'react'
import capsule101 from './data/capsules/capsule-101.json'
import capsule102 from './data/capsules/capsule-102.json'
import { getCapsule, listCapsules, seedCapsule } from './lib/capsuleStore.js'
import { importCapsuleFile, shareCapsule } from './lib/share.js'
import { useOnline } from './lib/useOnline.js'
import { I18nProvider, useI18n } from './lib/i18n.jsx'
import CourseHub from './ui/CourseHub.jsx'
import OfflineBanner from './ui/OfflineBanner.jsx'
import QuizArena from './ui/QuizArena.jsx'
import KabsatAI from './ui/KabsatAI.jsx'
import Dashboard from './ui/Dashboard.jsx'
import StoryReader from './ui/StoryReader.jsx'
import AnimatedSuccessCheck from './ui/AnimatedSuccessCheck.jsx'
import {
  BookOpen,
  Trophy,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  X,
  Languages,
} from 'lucide-react'

const CATALOG = [capsule101, capsule102].map((capsule) => ({
  id: capsule.id,
  title: capsule.title,
  subtitle: capsule.subtitle,
  cards: capsule.cards.length,
  questions: capsule.questions.length,
  kb: Math.max(1, Math.round(JSON.stringify(capsule).length / 1024)),
}))

function BottomNav({ tabs, tab, onSelect }) {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto grid max-w-[430px] grid-cols-4 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 pt-1.5 backdrop-blur-md"
      style={{ paddingBottom: 'calc(var(--sab) + 0.375rem)' }}
    >
      {tabs.map((item) => {
        const active = item.id === tab
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
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
  )
}

function MainApp() {
  const { lang, setLang, t } = useI18n()
  const online = useOnline()
  const [tab, setTab] = useState('hub')
  const [readerId, setReaderId] = useState(null)
  const [capsules, setCapsules] = useState([])
  const [downloadingId, setDownloadingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [quizRunning, setQuizRunning] = useState(false)
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

  const toggleLang = () => {
    setLang(lang === 'fil' ? 'en' : 'fil')
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

  const selectTab = (nextTab) => {
    if (nextTab !== 'quiz') setQuizRunning(false)
    setTab(nextTab)
  }

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
    if (result.method === 'share') setToast(t('shareSuccess'))
    else if (result.method === 'download') setToast(t('saveSuccess'))
    else setToast(t('shareCancel'))
  }

  const importFile = async (file) => {
    const result = await importCapsuleFile(file)
    setToast(result.ok ? t('importSuccess') : t('importRefused', { error: result.error }))
    await refresh()
  }

  if (readerId) {
    const capsule = [capsule101, capsule102].find((c) => c.id === readerId)
    return <StoryReader capsule={capsule} onExit={() => setReaderId(null)} />
  }

  const tabs = [
    {
      id: 'hub',
      label: t('coursesTab'),
      subtitle: t('coursesTabSub'),
      icon: BookOpen,
    },
    {
      id: 'quiz',
      label: t('quizTab'),
      subtitle: t('quizTabSub'),
      icon: Trophy,
    },
    {
      id: 'tutor',
      label: t('tutorTab'),
      subtitle: t('tutorTabSub'),
      icon: Sparkles,
    },
    {
      id: 'dashboard',
      label: t('dashboardTab'),
      subtitle: t('dashboardTabSub'),
      icon: BarChart3,
    },
  ]

  const navigation = <BottomNav tabs={tabs} tab={tab} onSelect={selectTab} />

  const pageShell =
    'mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200'

  if (tab === 'quiz') {
    return (
      <div
        className={pageShell}
        style={{
          paddingTop: 'var(--sat)',
          paddingBottom: quizRunning ? 'var(--sab)' : 'calc(var(--sab) + 3.75rem)',
        }}
      >
        <QuizArena
          capsule={capsule101}
          onExit={() => selectTab('hub')}
          onRunningChange={setQuizRunning}
        />
        {!quizRunning && navigation}
      </div>
    )
  }

  if (tab === 'tutor') {
    return (
      <div
        className={pageShell}
        style={{
          paddingTop: 'var(--sat)',
          paddingBottom: 'calc(var(--sab) + 3.75rem)',
        }}
      >
        <KabsatAI capsule={capsule101} onExit={() => selectTab('hub')} />
        {navigation}
      </div>
    )
  }

  return (
    <div
      className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200"
      style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      {/* Top Safe Area Shield: keeps the mobile device status bar/panel area clean when scrolling */}
      <div
        className="fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg)] pointer-events-none"
        style={{ height: 'var(--sat)' }}
        aria-hidden="true"
      />

      {/* Top Mobile App Header */}
      <header className="safe-sticky-header z-30 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <img
            src="/icon.svg"
            alt="KabsatLearn logo"
            className="size-9 rounded-xl border border-[var(--color-line)] bg-white p-1 shadow-xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                {t('appTitle')}
              </span>
              <span className="rounded-full bg-[var(--color-terracotta)]/15 px-1.5 py-0.2 text-[10px] font-bold text-[var(--color-terracotta)]">
                {t('regionTag')}
              </span>
            </div>
            <h1 className="text-base font-bold leading-tight text-[var(--color-ink)]">
              {tab === 'hub' ? t('headerCourses') : t('headerDashboard')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle: Tagalog / English */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label={`Switch language to ${lang === 'fil' ? 'English' : 'Tagalog'}`}
            className="btn-press flex h-9 items-center gap-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 text-xs font-bold text-[var(--color-accent)] hover:border-[var(--color-accent)]"
          >
            <Languages className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            <span className="font-mono tracking-tight">{lang.toUpperCase()}</span>
          </button>

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

      <OfflineBanner online={online} />

      {/* Main Content Area with Technique 05: Fast, then slow (page-enter) */}
      <main key={`${tab}-${lang}`} className="flex-1 px-4 pt-5 pb-[calc(var(--sab)+5.5rem)] page-enter">
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

        {/* Floating Toast Notification with Technique 06: Draw the win */}
        {toast && (
          <div
            role="status"
            className="animate-toast fixed bottom-20 left-1/2 z-50 flex w-[90%] max-w-[390px] items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-xl transition-all"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
                <AnimatedSuccessCheck className="size-4.5" circleColor="var(--color-accent)" tickColor="var(--color-accent)" />
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

      {navigation}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <MainApp />
    </I18nProvider>
  )
}
