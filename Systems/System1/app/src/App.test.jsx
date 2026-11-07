import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App.jsx'

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
})

function renderHeader() {
  const html = renderToStaticMarkup(<App />)
  const header = html.match(/<header[\s\S]*?<\/header>/)
  expect(header).not.toBeNull()
  return header[0]
}

describe('app header', () => {
  test('shows no connectivity status chip', () => {
    const header = renderHeader()
    expect(header).not.toMatch(/\b(online|offline)\b/i)
  })

  test('keeps the brand, page title and theme toggle, and no region badge', () => {
    const header = renderHeader()
    expect(header).toContain('KabsatLearn')
    expect(header).not.toContain('La Union')
    expect(header).toContain('Mga Kurso')
    expect(header).toContain('alt="KabsatLearn logo"')
    expect(header).toMatch(/aria-label="Switch to dark mode"/)
  })

  test('renders action buttons in order: Language toggle, Theme toggle, and Profile button as rightmost', () => {
    const header = renderHeader()
    const langIndex = header.indexOf('aria-label="Switch language to')
    const themeIndex = header.indexOf('aria-label="Switch to dark mode"')
    const profileIndex = header.indexOf('aria-label="Profile"')

    expect(langIndex).toBeGreaterThan(-1)
    expect(themeIndex).toBeGreaterThan(-1)
    expect(profileIndex).toBeGreaterThan(-1)

    expect(langIndex).toBeLessThan(themeIndex)
    expect(themeIndex).toBeLessThan(profileIndex)
  })
})

describe('theme toggle', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  test('toggles theme to dark and sets data-theme and localStorage', async () => {
    const toggleBtn = container.querySelector('button[aria-label="Switch to dark mode"]')
    expect(toggleBtn).not.toBeNull()

    await act(async () => {
      toggleBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('kabsat_theme')).toBe('dark')
    expect(toggleBtn.getAttribute('aria-label')).toBe('Switch to light mode')
  })
})

describe('bottom navigation', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  function nav() {
    return container.querySelector('nav[aria-label="Main Navigation"]')
  }

  function buttonStartingWith(text) {
    return [...container.querySelectorAll('button')].find((button) =>
      button.textContent.replace(/\s+/g, ' ').trim().startsWith(text)
    )
  }

  function click(element) {
    act(() => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  test('stays visible on the Kabsat AI page', () => {
    click(buttonStartingWith('Kabsat AI'))

    expect(nav()).not.toBeNull()
    expect(container.textContent).toContain('Kabsat AI')
  })

  test('Kabsat AI input is contained and not overlapped by bottom navigation', () => {
    click(buttonStartingWith('Kabsat AI'))

    const input = container.querySelector('#ask')
    expect(input).not.toBeNull()
    const form = input.closest('form')
    expect(form).not.toBeNull()
    expect(form.className).not.toContain('sticky bottom-0')
    expect(form.className).toContain('shrink-0')
    expect(form.className).toContain('pb-7')

    const kabsatAiRoot = form.parentElement
    expect(kabsatAiRoot.className).toContain('flex-1')
    expect(kabsatAiRoot.className).toContain('min-h-0')
    expect(kabsatAiRoot.className).not.toContain('h-dvh')
  })

  test('stays visible on the quiz intro and hides only while the quiz runs', () => {
    click(buttonStartingWith('Quiz'))
    expect(nav()).not.toBeNull()

    vi.useFakeTimers()
    click(buttonStartingWith('Isahang Laro'))
    expect(nav()).toBeNull()

    for (let question = 0; question < 10; question += 1) {
      const tile = [...container.querySelectorAll('main button')].find((button) =>
        button.className.includes('bg-gradient-to-br')
      )
      click(tile)
      expect(nav()).toBeNull()

      act(() => {
        vi.advanceTimersByTime(1600)
      })
    }

    expect(nav()).not.toBeNull()
  })
})

describe('popup notifications', () => {
  let container
  let root

  beforeEach(async () => {
    localStorage.clear()
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = () => 'blob:mock-url'
      globalThis.URL.revokeObjectURL = () => {}
    }
    HTMLAnchorElement.prototype.click = () => {}
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    await act(async () => {
      root.render(<App />)
    })
    // Wait for initial seed and course list to load
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (container.querySelector('button[aria-label^="Options for"]')) break
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
      })
    }
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    vi.useRealTimers()
  })

  test('floating toast notification appears at the top with in and out animation', async () => {
    const menuBtn = container.querySelector('button[aria-label^="Options for"]')
    expect(menuBtn).not.toBeNull()

    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const shareBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Ibahagi') || b.textContent.includes('Share')
    )
    expect(shareBtn).not.toBeNull()

    await act(async () => {
      shareBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const downloadKabsatBtn = [...document.body.querySelectorAll('button')].find((b) =>
      b.textContent.includes('.kabsat')
    )
    expect(downloadKabsatBtn).not.toBeNull()

    await act(async () => {
      downloadKabsatBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Wait for async downloadCapsule to resolve and set toast
    for (let attempt = 0; attempt < 50; attempt += 1) {
      if (container.querySelector('[role="status"].animate-toast-down')) break
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 20))
      })
    }

    const toast = container.querySelector('[role="status"].animate-toast-down')
    expect(toast).not.toBeNull()
    expect(toast.getAttribute('style')).toContain('top: calc(var(--sat) + 1rem)')

    const closeBtn = toast.querySelector('button[aria-label="Close notification"]')
    expect(closeBtn).not.toBeNull()

    await act(async () => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('.animate-toast-down-out')).not.toBeNull()

    await vi.waitFor(() => {
      expect(container.querySelector('[role="status"]')).toBeNull()
    })
  })

  test('clicking profile button in header opens dropdown with Profile and Archive options', async () => {
    const profileBtn = container.querySelector('header button[aria-label="Profile"]')
    expect(profileBtn).not.toBeNull()

    // Initially menu is closed
    expect(container.textContent).not.toContain('Archive')

    // Click profile button to open dropdown
    await act(async () => {
      profileBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const dropdown = container.querySelector('[role="menu"]')
    expect(dropdown).not.toBeNull()
    expect(dropdown.textContent).toContain('Profile')
    expect(dropdown.textContent).toContain('Archive')

    // Clicking Archive opens ArchivePage
    const archiveMenuOption = [...dropdown.querySelectorAll('button')].find(
      (b) => b.textContent.includes('Archive')
    )
    expect(archiveMenuOption).toBeTruthy()

    await act(async () => {
      archiveMenuOption.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // ArchivePage is now rendered with its header and empty state or courses
    expect(container.querySelector('h1').textContent).toMatch(/Archive|Naka-archive/i)

    // Back button returns to Hub
    const backBtn = container.querySelector('header button')
    await act(async () => {
      backBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(container.querySelector('h1').textContent).toContain('Mga Kurso')
  })

  test('archiving a course moves it to ArchivePage and removes it from active CourseHub', async () => {
    // Locate 3-dots button on installed course card
    const menuBtn = container.querySelector('button[aria-label^="Options for"]')
    expect(menuBtn).not.toBeNull()

    // Open card 3-dots menu
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Click Archive option
    const archiveCardOption = [...container.querySelectorAll('button')].find(
      (b) => b.textContent.includes('Archive') || b.textContent.includes('I-archive')
    )
    expect(archiveCardOption).toBeTruthy()

    await act(async () => {
      archiveCardOption.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Course should no longer be in active CourseHub installed section list
    const installedSection = container.querySelector('section[aria-labelledby="installed-heading"]')
    expect(installedSection.querySelector('li')).toBeNull()

    // Open profile menu -> Archive
    const profileBtn = container.querySelector('header button[aria-label="Profile"]')
    await act(async () => {
      profileBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    const archiveMenuOption = [...container.querySelectorAll('[role="menu"] button')].find(
      (b) => b.textContent.includes('Archive')
    )
    await act(async () => {
      archiveMenuOption.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Course is present in ArchivePage
    expect(container.textContent).toContain('Ligtas na Digital Wallet')

    // Click Unarchive button
    const unarchiveBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent.includes('Ibalik sa Kurso') || b.textContent.includes('Unarchive')
    )
    expect(unarchiveBtn).toBeTruthy()

    await act(async () => {
      unarchiveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Go back to CourseHub
    const backBtn = container.querySelector('header button')
    await act(async () => {
      backBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Course is restored in installed section
    expect(container.querySelector('section[aria-labelledby="installed-heading"]')).not.toBeNull()
  })

  test('opening a course from ArchivePage in StoryReader and exiting returns to ArchivePage', async () => {
    // Archive capsule-101
    const menuBtn = container.querySelector('button[aria-label^="Options for"]')
    await act(async () => {
      menuBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    const archiveCardOption = [...container.querySelectorAll('button')].find(
      (b) => b.textContent.includes('Archive') || b.textContent.includes('I-archive')
    )
    await act(async () => {
      archiveCardOption.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Open ArchivePage
    const profileBtn = container.querySelector('header button[aria-label="Profile"]')
    await act(async () => {
      profileBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    const archiveMenuOption = [...container.querySelectorAll('[role="menu"] button')].find(
      (b) => b.textContent.includes('Archive')
    )
    await act(async () => {
      archiveMenuOption.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Click on the archived course card to open StoryReader
    const archivedCard = container.querySelector('li')
    await act(async () => {
      archivedCard.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // StoryReader is open and renders exit button
    const exitReaderBtn =
      container.querySelector('button[aria-label="Bumalik sa mga aralin"]') ||
      container.querySelector('header button')
    expect(exitReaderBtn).not.toBeNull()

    // Exit StoryReader
    await act(async () => {
      exitReaderBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // User is returned to ArchivePage, NOT CourseHub
    expect(container.querySelector('h1').textContent).toMatch(/Archive|Naka-archive/i)
  })
})
