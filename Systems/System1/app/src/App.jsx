import { useState } from 'react'
import OfflineBanner from './ui/OfflineBanner.jsx'

const TABS = [
  { id: 'hub', label: 'Courses' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'tutor', label: 'Kabsat' },
  { id: 'dashboard', label: 'LGU' },
]

const SCREENS = {
  hub: {
    title: 'Your courses',
    body: 'Course capsules you have on this phone. Nothing here needs the internet.',
  },
  quiz: {
    title: 'Quiz arena',
    body: 'Answer quickly, move up a level. Miss twice and Kabsat slows down for you.',
  },
  tutor: {
    title: 'Ask Kabsat',
    body: 'Answers come from the courses you downloaded. If it is not covered, Kabsat says so.',
  },
  dashboard: {
    title: 'City insights',
    body: 'Skill gaps by barangay, and progress waiting to sync when a connection returns.',
  },
}

export default function App() {
  const [tab, setTab] = useState('hub')
  const screen = SCREENS[tab]

  return (
    <div className="mx-auto flex min-h-dvh max-w-[420px] flex-col bg-[var(--color-bg)]">
      <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.08em] text-[var(--color-accent)] uppercase">
            KabsatLearn
          </p>
          <h1 className="text-xl font-bold">{screen.title}</h1>
        </div>
        <OfflineBanner />
      </header>

      <main className="flex-1 px-4 py-6">
        <p className="max-w-[38ch] text-[15px] leading-relaxed text-[var(--color-muted)]">
          {screen.body}
        </p>
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
