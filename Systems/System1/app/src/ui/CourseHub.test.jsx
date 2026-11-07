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

  async function renderComponent(capsules, lang = 'fil', handlers = {}) {
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
            {...handlers}
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

  test('installed course card renders 3-dots menu button, opening dropdown with Share and Archive options', async () => {
    let archivedCapsule = null
    await renderComponent(oneInstalledOneAvailable, 'en', {
      onArchive: (c) => {
        archivedCapsule = c
      },
    })
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')
    expect(menuBtn).not.toBeNull()

    // Initially menu is closed
    expect(installedSection.textContent).not.toContain('Archive')

    // Click 3-dots button to open menu
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(installedSection.textContent).toContain('Share')
    expect(installedSection.textContent).toContain('Archive')

    // Click Archive option
    const archiveBtn = [...installedSection.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Archive'
    )
    expect(archiveBtn).toBeTruthy()
    await act(async () => {
      archiveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(archivedCapsule).toEqual(oneInstalledOneAvailable[0])
  })

  test('installed course card displays "Share" in English and "Ibahagi" in Filipino inside 3-dots menu', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')
    let installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    let menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(installedSection.textContent).toContain('Share')
    expect(installedSection.textContent).not.toContain('Pass')

    await renderComponent(oneInstalledOneAvailable, 'fil')
    installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(installedSection.textContent).toContain('Ibahagi')
    expect(installedSection.textContent).toContain('I-archive')
  })

  test('clicking share option in 3-dots menu opens share modal via portal, cancel dismisses it', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')

    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const shareBtn = [...installedSection.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Share'
    )
    expect(shareBtn).toBeTruthy()
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

  test('open 3-dots menu is not clipped by overflow-hidden on the card or any ancestor', async () => {
    await renderComponent(oneInstalledOneAvailable, 'en')
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const card = installedSection.querySelector('li')
    const menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')

    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Locate the dropdown container first, then assert on its contents.
    const shareBtn = [...card.querySelectorAll('button')].find(
      (b) => b.textContent.trim() === 'Share'
    )
    expect(shareBtn).toBeTruthy()
    const dropdown = shareBtn.parentElement
    const dropdownLabels = [...dropdown.querySelectorAll('button')].map((b) =>
      b.textContent.trim()
    )
    expect(dropdownLabels).toContain('Share')
    expect(dropdownLabels).toContain('Archive')

    // No ancestor of the dropdown may clip it.
    const clippingAncestors = []
    let node = dropdown.parentElement
    while (node && node !== document.body) {
      if (typeof node.className === 'string' && node.className.includes('overflow-hidden')) {
        clippingAncestors.push(node.className)
      }
      node = node.parentElement
    }
    expect(clippingAncestors).toEqual([])

    // The card itself must not clip, and it is raised above its siblings while open.
    expect(card.className).not.toContain('overflow-hidden')
    expect(card.className).toContain('z-30')

    // The artwork keeps its own clipped, rounded wrapper so the SVG cannot overhang.
    const clipWrapper = [...card.children].find(
      (child) =>
        child.tagName === 'DIV' &&
        typeof child.className === 'string' &&
        child.className.includes('overflow-hidden') &&
        child.className.includes('rounded-2xl')
    )
    expect(clipWrapper).toBeTruthy()
    expect(clipWrapper.getAttribute('aria-hidden')).toBe('true')

    // Closing the menu drops the raised stacking order.
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(card.className).not.toContain('z-30')
  })

  test('clicking card body while 3-dots menu is open closes menu without triggering onOpen', async () => {
    let openedId = null
    await renderComponent(oneInstalledOneAvailable, 'en', {
      onOpen: (id) => {
        openedId = id
      },
    })
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    const menuBtn = installedSection.querySelector('button[aria-label="Options for Digital Safety"]')
    const card = installedSection.querySelector('li')

    // Open menu
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(installedSection.textContent).toContain('Archive')

    // Click card body
    await act(async () => {
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Menu is closed, and onOpen was NOT called
    expect(installedSection.textContent).not.toContain('Archive')
    expect(openedId).toBeNull()
  })
})
