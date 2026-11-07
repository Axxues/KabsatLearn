import { useCallback, useEffect, useRef, useState } from 'react'
import { CAPSULE_BY_ID, CATALOG, SEEDED_IDS } from './data/catalogue.js'
import { getCapsule, listCapsules, seedCapsule } from './lib/capsuleStore.js'
import { importCapsuleFile, shareCapsule, downloadCapsule } from './lib/share.js'
import { useOnline } from './lib/useOnline.js'
import { I18nProvider, useI18n } from './lib/i18n.jsx'
import { useKabsatAiState } from './lib/useKabsatAiState.js'
import { archiveCourse, getArchivedCourseIds, unarchiveCourse } from './lib/archiveStore.js'
import CourseHub from './ui/CourseHub.jsx'
import OfflineBanner from './ui/OfflineBanner.jsx'
import QuizArena from './ui/QuizArena.jsx'
import KabsatAI from './ui/KabsatAI.jsx'
import Dashboard from './ui/Dashboard.jsx'
import StoryReader from './ui/StoryReader.jsx'
import AnimatedSuccessCheck from './ui/AnimatedSuccessCheck.jsx'
import Profile from './ui/Profile.jsx'
import ArchivePage from './ui/ArchivePage.jsx'
import { emptyProfile, loadProfile } from './lib/profile.js'
import {
  BookOpen,
  Trophy,
  Sparkles,
  BarChart3,
  Sun,
  Moon,
  X,
  Languages,
  UserRound,
  Archive,
} from 'lucide-react'

const TUTOR_CAPSULE = CAPSULE_BY_ID['capsule-101']

function BottomNav({ tabs, tab, onSelect, aiProcessing }) {
  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto grid max-w-[430px] grid-cols-4 border-t border-[var(--color-line)] bg-[var(--color-surface)]/95 pt-1.5 backdrop-blur-md"
      style={{ paddingBottom: 'calc(var(--sab) + 0.375rem)' }}
    >
      {tabs.map((item) => {
        const active = item.id === tab
        const Icon = item.icon
        const isTutorProcessing = item.id === 'tutor' && aiProcessing
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onSelect(item.id)}
            className={`btn-press flex flex-col items-center justify-center gap-1 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'text-[var(--color-accent)]'
                : isTutorProcessing
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
            }`}
          >
            <div
              className={`flex size-8 items-center justify-center rounded-xl transition-all duration-150 ${
                active
                  ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] shadow-xs scale-105'
                  : isTutorProcessing
                    ? 'bg-[var(--color-accent-subtle)]/60 text-[var(--color-accent)] shadow-xs'
                    : 'text-[var(--color-muted)]'
              }`}
            >
              <Icon
                className={`size-4.5 stroke-[2] ${
                  isTutorProcessing ? 'animate-spin origin-center text-[var(--color-accent)]' : ''
                }`}
                aria-hidden="true"
              />
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
  const [profile, setProfile] = useState(null)
  const [showProfile, setShowProfile] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [readerReturnTo, setReaderReturnTo] = useState(null)
  const [archivedIds, setArchivedIds] = useState(getArchivedCourseIds)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadProfile().then((stored) => {
      if (!cancelled) setProfile(stored)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!profileMenuOpen) return
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setProfileMenuOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileMenuOpen])

  const [tab, setTab] = useState('hub')
  const [readerId, setReaderId] = useState(null)
  const [capsules, setCapsules] = useState([])
  const kabsatAi = useKabsatAiState({
    capsule: TUTOR_CAPSULE,
    installedCapsules: capsules.filter((c) => c.installed),
    t,
    lang,
  })
  const [downloadingId, setDownloadingId] = useState(null)
  const [toast, setToast] = useState(null)
  const [isToastExiting, setIsToastExiting] = useState(false)
  const [quizRunning, setQuizRunning] = useState(false)
  const [quizCourseId, setQuizCourseId] = useState(() =>
    typeof window === 'undefined' ? null : localStorage.getItem('kabsat_quiz_course')
  )
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
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#18191a' : '#1e40af')
    }
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
      for (const id of SEEDED_IDS) {
        const capsule = CAPSULE_BY_ID[id]
        if (!capsule) continue
        if (!(await getCapsule(id))) {
          await seedCapsule(capsule)
        }
      }
      if (!cancelled) await refresh()
    })()
    return () => {
      cancelled = true
    }
  }, [refresh])

  const dismissToast = useCallback(() => {
    setIsToastExiting(true)
    const exitDelay = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test' ? 120 : 250
    setTimeout(() => {
      setToast(null)
      setIsToastExiting(false)
    }, exitDelay)
  }, [])

  const triggerToast = useCallback((msg) => {
    setIsToastExiting(false)
    setToast(msg)
  }, [])

  useEffect(() => {
    if (toast && !isToastExiting) {
      const timer = setTimeout(() => dismissToast(), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast, isToastExiting, dismissToast])

  const selectTab = (nextTab) => {
    if (nextTab !== 'quiz') setQuizRunning(false)
    setTab(nextTab)
  }

  const download = async (id) => {
    const capsule = CAPSULE_BY_ID[id]
    if (!capsule) return
    setDownloadingId(id)
    await new Promise((resolve) => setTimeout(resolve, 1800))
    await seedCapsule(capsule)
    const nextArchived = unarchiveCourse(id)
    setArchivedIds(nextArchived)
    await refresh()
    setDownloadingId(null)
  }

  const openReader = (id, returnTo = null) => {
    setReaderReturnTo(returnTo)
    setReaderId(id)
  }

  const share = async (id, mode = 'download') => {
    try {
      if (mode === 'download') {
        const result = await downloadCapsule(id)
        if (result.ok) triggerToast(t('saveSuccess'))
        return result
      }
      const result = await shareCapsule(id)
      if (result.method === 'share') triggerToast(t('shareSuccess'))
      else if (result.method === 'download') triggerToast(t('saveSuccess'))
      else triggerToast(t('shareCancel'))
      return result
    } catch {
      triggerToast(t('shareError'))
    }
  }

  const importFile = async (file) => {
    const result = await importCapsuleFile(file)
    const courseId = result.id || result.capsule?.id
    if (result.ok && courseId) {
      const nextArchived = unarchiveCourse(courseId)
      setArchivedIds(nextArchived)
    }
    triggerToast(result.ok ? t('importSuccess') : t('importRefused', { error: result.error }))
    await refresh()
  }

  const handleArchive = (capsule) => {
    const next = archiveCourse(capsule.id)
    setArchivedIds(next)
    triggerToast(t('toastArchived'))
  }

  const handleUnarchive = (id) => {
    const next = unarchiveCourse(id)
    setArchivedIds(next)
    triggerToast(t('toastUnarchived'))
  }

  if (showProfile) {
    return (
      <Profile
        profile={profile ?? emptyProfile()}
        onSaved={(saved) => {
          setProfile(saved)
          if (saved.language) setLang(saved.language === 'tl' ? 'fil' : 'en')
        }}
        onClose={() => setShowProfile(false)}
      />
    )
  }

  if (showArchive) {
    const archivedCapsules = capsules.filter((c) => c.installed && archivedIds.includes(c.id))
    return (
      <ArchivePage
        archivedCourses={archivedCapsules}
        onClose={() => setShowArchive(false)}
        onOpenCourse={(c) => {
          setShowArchive(false)
          openReader(c.id, 'archive')
        }}
        onUnarchive={handleUnarchive}
      />
    )
  }

  if (readerId) {
    const capsule = CAPSULE_BY_ID[readerId]
    return (
      <StoryReader
        capsule={capsule}
        onExit={() => {
          setReaderId(null)
          if (readerReturnTo === 'archive') {
            setShowArchive(true)
            setReaderReturnTo(null)
          }
        }}
      />
    )
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

  const navigation = (
    <BottomNav
      tabs={tabs}
      tab={tab}
      onSelect={selectTab}
      aiProcessing={kabsatAi.isProcessing}
    />
  )

  const activeCapsules = capsules.filter((c) => !archivedIds.includes(c.id))

  const quizCourses = (
    activeCapsules.length > 0
      ? activeCapsules
      : CATALOG.filter((c) => !archivedIds.includes(c.id)).map((course) => ({
          ...course,
          installed: SEEDED_IDS.includes(course.id),
        }))
  )
    .filter((course) => course.installed)
    .map((course) => ({
      id: course.id,
      title: course.title,
      questions: course.questions,
      installed: course.installed,
      capsule: CAPSULE_BY_ID[course.id],
    }))

  const activeQuizCourse =
    quizCourses.find((course) => course.id === quizCourseId && course.installed) ||
    quizCourses.find((course) => course.installed) ||
    quizCourses[0] ||
    null

  const selectQuizCourse = (id) => {
    const course = quizCourses.find((candidate) => candidate.id === id && candidate.installed)
    if (!course) return
    setQuizCourseId(id)
    localStorage.setItem('kabsat_quiz_course', id)
  }

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
          key={activeQuizCourse?.id || 'empty-quiz'}
          capsule={activeQuizCourse?.capsule || null}
          courses={quizCourses}
          selectedCourseId={activeQuizCourse?.id || null}
          onSelectCourse={selectQuizCourse}
          onLockedCourse={() => selectTab('hub')}
          onExit={() => selectTab('hub')}
          onOpenArchive={() => setShowArchive(true)}
          onRunningChange={setQuizRunning}
        />
        {!quizRunning && navigation}
      </div>
    )
  }

  if (tab === 'tutor') {
    return (
      <div
        className="mx-auto flex h-dvh max-w-[430px] flex-col bg-[var(--color-bg)] text-[var(--color-ink)] shadow-2xl transition-colors duration-200 overflow-hidden"
        style={{
          paddingTop: 'var(--sat)',
          paddingBottom: 'calc(var(--sab) + 4rem)',
        }}
      >
        <KabsatAI capsule={TUTOR_CAPSULE} onExit={() => selectTab('hub')} {...kabsatAi} />
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
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
              {t('appTitle')}
            </p>
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

          {/* Profile & Archive Menu dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              aria-label="Profile"
              className="btn-press flex size-9 items-center justify-center rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              <UserRound className="size-4.5 stroke-[2]" aria-hidden="true" />
            </button>

            {profileMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] py-1.5 shadow-xl backdrop-blur-md z-50 animate-fade-in"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    setShowProfile(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <UserRound className="size-4 stroke-[2]" aria-hidden="true" />
                  <span>{t('profileMenu') || 'Profile'}</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false)
                    setShowArchive(true)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)] transition-colors"
                >
                  <Archive className="size-4 stroke-[2]" aria-hidden="true" />
                  <span>{t('archiveMenu') || 'Archive'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <OfflineBanner online={online} />

      {/* Main Content Area with Technique 05: Fast, then slow (page-enter) */}
      <main key={`${tab}-${lang}`} className="flex-1 px-4 pt-5 pb-[calc(var(--sab)+5.5rem)] page-enter">
        {tab === 'hub' && (
          <CourseHub
            capsules={activeCapsules}
            onOpen={openReader}
            onDownload={download}
            onShare={share}
            onArchive={handleArchive}
            onImport={importFile}
            downloadingId={downloadingId}
          />
        )}
        {tab === 'dashboard' && <Dashboard capsules={capsules} />}
      </main>

      {/* Floating Top Popup Notification with In and Out Animations */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`${
            isToastExiting ? 'animate-toast-down-out' : 'animate-toast-down'
          } fixed left-1/2 z-50 flex w-[90%] max-w-[390px] items-center justify-between gap-3 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)]/95 p-3.5 shadow-2xl backdrop-blur-md transition-all`}
          style={{ top: 'calc(var(--sat) + 1rem)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <AnimatedSuccessCheck className="size-4.5" circleColor="var(--color-accent)" tickColor="var(--color-accent)" />
            </span>
            <p className="truncate text-xs font-semibold text-[var(--color-ink)]">{toast}</p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="btn-press flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-surface-sunken)] hover:text-[var(--color-ink)]"
            aria-label="Close notification"
          >
            <X className="size-4 stroke-[2.5]" aria-hidden="true" />
          </button>
        </div>
      )}

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
