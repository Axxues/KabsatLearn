import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import ArchivePage from './ArchivePage.jsx'

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

const dummyCourses = [
  {
    id: 'capsule-101',
    title: 'Digital Safety',
    subtitle: 'Anti-scam at OTP safety',
    competency: 'CYBER_SAFETY',
    tone: 'safety',
    category: 'Digital Safety',
    code: 'KABSAT-101',
    kb: 42,
    cards: 5,
    questions: 6,
  },
]

describe('ArchivePage', () => {
  let container
  let root

  beforeEach(() => {
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  async function renderComponent(courses, handlers = {}, lang = 'en') {
    localStorage.setItem('kabsat_lang', lang)
    await act(async () => {
      root.render(
        <I18nProvider key={lang} initialLang={lang}>
          <ArchivePage
            archivedCourses={courses}
            onClose={handlers.onClose ?? vi.fn()}
            onOpenCourse={handlers.onOpenCourse ?? vi.fn()}
            onUnarchive={handlers.onUnarchive ?? vi.fn()}
          />
        </I18nProvider>
      )
    })
  }

  it('renders header with back button and count', async () => {
    await renderComponent(dummyCourses, {}, 'en')
    const heading = container.querySelector('h1')
    expect(heading.textContent).toContain('Archived Courses')
    expect(container.textContent).toContain('1 course')

    await renderComponent(dummyCourses, {}, 'fil')
    expect(container.querySelector('h1').textContent).toContain('Naka-archive')
    expect(container.textContent).toContain('1 kurso')
  })

  it('renders empty state when no courses are archived', async () => {
    await renderComponent([], {}, 'en')
    expect(container.textContent).toContain('No archived courses')
    expect(container.textContent).toContain('Courses you archive from the Courses Hub will appear here')

    await renderComponent([], {}, 'fil')
    expect(container.textContent).toContain('Walang naka-archive na kurso')
  })

  it('calls onUnarchive when Unarchive button is clicked', async () => {
    const onUnarchive = vi.fn()
    await renderComponent(dummyCourses, { onUnarchive }, 'en')

    const unarchiveBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Unarchive')
    )
    expect(unarchiveBtn).toBeTruthy()
    await act(async () => {
      unarchiveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onUnarchive).toHaveBeenCalledWith('capsule-101')
  })

  it('calls onOpenCourse when card body is clicked', async () => {
    const onOpenCourse = vi.fn()
    await renderComponent(dummyCourses, { onOpenCourse }, 'en')

    const card = container.querySelector('li')
    expect(card).toBeTruthy()
    await act(async () => {
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onOpenCourse).toHaveBeenCalledWith(dummyCourses[0])
  })

  it('calls onClose when back button is clicked', async () => {
    const onClose = vi.fn()
    await renderComponent(dummyCourses, { onClose }, 'en')

    const backBtn = container.querySelector('header button')
    expect(backBtn).toBeTruthy()
    await act(async () => {
      backBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(onClose).toHaveBeenCalled()
  })
})
