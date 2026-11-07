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
        <I18nProvider key={lang} initialLang={lang}>
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

  async function expandAvailable() {
    const section = container.querySelector('section[aria-labelledby="available-heading"]')
    const toggle = section.querySelector('h2 button')
    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    return section
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

    const availableSection = await expandAvailable()
    const availableCard = availableSection.querySelector('li')

    expect(availableCard.textContent).toContain('128 KB')
  })

  test('available section is collapsed by default with accordion closed', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const section = container.querySelector('section[aria-labelledby="available-heading"]')
    const toggle = section.querySelector('h2 button')
    const list = section.querySelector('#available-course-list')
    const accordion = section.querySelector('.accordion-grid')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(list.hidden).toBe(true)
    expect(accordion.className).not.toContain('is-expanded')
    expect(toggle.textContent).toContain('Available to download when online')
    expect(toggle.textContent).toContain('1 available')
  })

  test('available section expands and collapses on header click with accordion animation classes', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const section = container.querySelector('section[aria-labelledby="available-heading"]')
    const toggle = section.querySelector('h2 button')
    const list = section.querySelector('#available-course-list')
    const accordion = section.querySelector('.accordion-grid')

    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(list.hidden).toBe(false)
    expect(accordion.className).toContain('is-expanded')

    await act(async () => {
      toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(list.hidden).toBe(true)
    expect(accordion.className).not.toContain('is-expanded')
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

  test('card category tag and code come from the capsule when it carries a tone', async () => {
    await renderComponent(
      [
        {
          id: 'capsule-105',
          title: 'Plano ng Pamilya',
          subtitle: 'Pamilya at kalusugan',
          installed: false,
          kb: 64,
          cards: 6,
          questions: 10,
          category: 'Pamilya',
          code: 'KABSAT-105',
          tone: 'family',
        },
      ],
      'en'
    )

    const availableSection = await expandAvailable()
    const card = availableSection.querySelector('li')
    const tag = card.querySelector('span')
    const tagText = tag.textContent.replace(/\s+/g, ' ').trim()

    expect(tagText).toContain('Pamilya')
    expect(tagText).toContain('KABSAT-105')
    expect(card.querySelector('svg.lucide-heart')).not.toBeNull()
  })

  test('greeting card does not render small subtitle text below the welcome title in English', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    expect(container.textContent).toContain('Welcome, Kabsat!')
    expect(container.textContent).not.toContain('Micro-learning crafted for you')
  })

  test('greeting card does not render small subtitle text below the welcome title in Filipino', async () => {
    await renderComponent(oneInstalledOneAvailable, 'fil')

    expect(container.textContent).toContain('Naimbag nga aldaw, Kabsat!')
    expect(container.textContent).not.toContain('Maikling aralin na angkop para sa iyo')
  })

  test('download button uses high-contrast text and does not use variable ink color on white background', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')

    const availableSection = await expandAvailable()
    const downloadButton = availableSection.querySelector('li button')

    expect(downloadButton).not.toBeNull()
    expect(downloadButton.className).toContain('text-slate-900')
    expect(downloadButton.className).not.toContain('text-[var(--color-ink)]')
  })

  test('clicking an available course card opens download confirmation modal, cancel dismisses it', async () => {
    let downloadedId = null
    localStorage.setItem('kabsat_lang', 'en')
    await act(async () => {
      root.render(
        <I18nProvider>
          <CourseHub
            capsules={oneInstalledOneAvailable}
            onOpen={() => {}}
            onDownload={(id) => {
              downloadedId = id
            }}
            onShare={() => {}}
            onImport={() => {}}
          />
        </I18nProvider>
      )
    })

    const availableSection = await expandAvailable()
    const downloadButton = availableSection.querySelector('li button')

    // Click download button
    await act(async () => {
      downloadButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Confirmation modal should be open
    const modal = document.body.querySelector('[aria-labelledby="confirm-download-modal-title"]')
    expect(modal).not.toBeNull()
    expect(modal.textContent).toContain('Download Course')
    expect(modal.textContent).toContain('Hanapbuhay Skills')
    expect(modal.textContent).toContain('128 KB')
    expect(downloadedId).toBeNull()

    // Click Cancel button in modal
    const cancelBtn = [...modal.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Cancel'
    )
    expect(cancelBtn).toBeTruthy()
    await act(async () => {
      cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Modal is dismissed, onDownload was not called
    expect(document.body.querySelector('[aria-labelledby="confirm-download-modal-title"]')).toBeNull()
    expect(downloadedId).toBeNull()
  })

  test('confirming download in modal triggers onDownload with capsule id', async () => {
    let downloadedId = null
    localStorage.setItem('kabsat_lang', 'en')
    await act(async () => {
      root.render(
        <I18nProvider>
          <CourseHub
            capsules={oneInstalledOneAvailable}
            onOpen={() => {}}
            onDownload={(id) => {
              downloadedId = id
            }}
            onShare={() => {}}
            onImport={() => {}}
          />
        </I18nProvider>
      )
    })

    const availableSection = await expandAvailable()
    const downloadButton = availableSection.querySelector('li button')

    await act(async () => {
      downloadButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const modal = document.body.querySelector('[aria-labelledby="confirm-download-modal-title"]')
    expect(modal).not.toBeNull()

    const confirmBtn = [...modal.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Download Now')
    )
    expect(confirmBtn).toBeTruthy()

    await act(async () => {
      confirmBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(downloadedId).toBe('capsule-201')
    expect(document.body.querySelector('[aria-labelledby="confirm-download-modal-title"]')).toBeNull()
  })

  test('installed course card displays "Share" on the share button in English and "Ibahagi" in Filipino', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')
    const installedSectionEn = container.querySelector('section[aria-labelledby="installed-heading"]')
    const shareBtnEn = installedSectionEn.querySelector('li button')
    expect(shareBtnEn.textContent).toContain('Share')
    expect(shareBtnEn.textContent).not.toContain('Pass')

    await renderComponent(oneInstalledOneAvailable, 'fil')
    const installedSectionFil = container.querySelector('section[aria-labelledby="installed-heading"]')
    const shareBtnFil = installedSectionFil.querySelector('li button')
    expect(shareBtnFil.textContent).toContain('Ibahagi')
  })

  test('clicking share button on installed course card opens share modal via portal, cancel dismisses it', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const shareBtn = installedSection.querySelector('li button')

    await act(async () => {
      shareBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const modal = document.body.querySelector('[aria-labelledby="share-modal-title"]')
    expect(modal).not.toBeNull()
    expect(modal.textContent).toContain('Share Course')
    expect(modal.textContent).toContain('Digital Safety')

    const cancelBtn = [...modal.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Cancel'
    )
    expect(cancelBtn).toBeTruthy()
    await act(async () => {
      cancelBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(document.body.querySelector('[aria-labelledby="share-modal-title"]')).toBeNull()
  })
})
