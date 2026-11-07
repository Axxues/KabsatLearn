import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import CourseHub from './CourseHub.jsx'

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

const oneInstalledOneAvailable = [
  {
    id: 'capsule-101',
    title: 'Digital Safety',
    subtitle: 'Ligtas sa online scams',
    installed: true,
    kb: 42,
    cards: 5,
    questions: 6,
  },
  {
    id: 'capsule-201',
    title: 'Hanapbuhay Skills',
    subtitle: 'Gabay sa paghahanapbuhay',
    installed: false,
    kb: 128,
    cards: 8,
    questions: 10,
  },
]

const twoInstalledOneAvailable = [
  {
    id: 'capsule-101',
    title: 'Digital Safety',
    subtitle: 'Ligtas sa online scams',
    installed: true,
    kb: 42,
    cards: 5,
    questions: 6,
  },
  {
    id: 'capsule-102',
    title: 'Online Banking',
    subtitle: 'Ligtas na transaksyon',
    installed: true,
    kb: 64,
    cards: 4,
    questions: 5,
  },
  {
    id: 'capsule-201',
    title: 'Hanapbuhay Skills',
    subtitle: 'Gabay sa paghahanapbuhay',
    installed: false,
    kb: 128,
    cards: 8,
    questions: 10,
  },
]

describe('CourseHub capsule cards and counters', () => {
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

  async function renderComponent(capsules, lang = 'fil') {
    localStorage.setItem('kabsat_lang', lang)
    await act(async () => {
      root.render(
        <I18nProvider>
          <CourseHub
            capsules={capsules}
            onOpen={() => {}}
            onDownload={() => {}}
            onShare={() => {}}
            onImport={() => {}}
          />
        </I18nProvider>
      )
    })
  }

  test('installed card does NOT render "Ready", "Handa", or Check icon', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const installedCard = installedSection.querySelector('li')

    expect(installedCard.textContent).not.toContain('Ready')
    expect(installedCard.textContent).not.toContain('Handa')
    expect(installedCard.querySelector('svg.lucide-check')).toBeNull()
  })

  test('available card renders its KB size', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const availableSection = container.querySelector('section[aria-labelledby="available-heading"]')
    const availableCard = availableSection.querySelector('li')

    expect(availableCard.textContent).toContain('128 KB')
  })

  test('installed counter displays "1 course" in English when 1 capsule is installed', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const counterBadge = installedSection.querySelector('#installed-heading + span')

    expect(counterBadge.textContent.trim()).toBe('1 course')
  })

  test('installed counter displays "2 courses" in English when 2 capsules are installed', async () => {
    await renderComponent(twoInstalledOneAvailable, 'en')

    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const counterBadge = installedSection.querySelector('#installed-heading + span')

    expect(counterBadge.textContent.trim()).toBe('2 courses')
  })

  test('installed counter displays "1 kurso" in Filipino when 1 capsule is installed', async () => {
    await renderComponent(oneInstalledOneAvailable, 'fil')

    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const counterBadge = installedSection.querySelector('#installed-heading + span')

    expect(counterBadge.textContent.trim()).toBe('1 kurso')
  })

  test('installed counter displays "2 mga kurso" in Filipino when 2 capsules are installed', async () => {
    await renderComponent(twoInstalledOneAvailable, 'fil')

    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const counterBadge = installedSection.querySelector('#installed-heading + span')

    expect(counterBadge.textContent.trim()).toBe('2 mga kurso')
  })
})
