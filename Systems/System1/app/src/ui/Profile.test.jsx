import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { I18nProvider } from '../lib/i18n.jsx'
import Profile from './Profile.jsx'

const EMOJI = /\p{Extended_Pictographic}/u

const sampleProfile = {
  id: 'me',
  nickname: 'Karding',
  sector: 'student',
  ageBand: '18-24',
  municipality: 'San Fernando City, La Union',
  language: 'tl',
  accessibility: { voice: true, largeText: false, highContrast: false },
  updatedAt: 123456789,
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
})

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

function setInputValue(input, value) {
  act(() => {
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    ).set
    nativeSetter.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function setSelectValue(select, value) {
  act(() => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}


describe('Profile component', () => {
  let container
  let root
  let onSavedMock
  let onCloseMock

  beforeEach(async () => {
    localStorage.clear()
    onSavedMock = vi.fn()
    onCloseMock = vi.fn()
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

  async function mount(props = {}) {
    await act(async () => {
      root.render(
        <I18nProvider>
          <Profile
            profile={sampleProfile}
            onSaved={onSavedMock}
            onClose={onCloseMock}
            {...props}
          />
        </I18nProvider>
      )
    })
  }

  test('renders header with back button, avatar, and no emoji', async () => {
    await mount()

    const backBtn = container.querySelector('header button')
    expect(backBtn).not.toBeNull()
    expect(backBtn.querySelector('svg.lucide-arrow-left')).not.toBeNull()

    // Avatar displays first letter of nickname
    expect(container.textContent).toContain('K')
    expect(container.textContent).toContain('Karding')
    expect(container.textContent).not.toMatch(EMOJI)
  })

  test('clicking back button calls onClose', async () => {
    await mount()

    const backBtn = container.querySelector('header button')
    click(backBtn)
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  test('editing nickname and saving calls onSaved with updated data', async () => {
    await mount()

    const nicknameInput = container.querySelector('input[placeholder="hal. Ana"]')
    expect(nicknameInput).not.toBeNull()
    expect(nicknameInput.value).toBe('Karding')

    setInputValue(nicknameInput, 'Maria')

    const saveBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('I-save')
    )
    expect(saveBtn).not.toBeNull()

    await act(async () => {
      saveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await vi.waitFor(() => expect(onSavedMock).toHaveBeenCalled())
    })

    const savedData = onSavedMock.mock.calls[0][0]
    expect(savedData.nickname).toBe('Maria')
    expect(savedData.accessibility).toEqual(sampleProfile.accessibility)

    // Shows saved status confirmation
    expect(container.textContent).toContain('Na-save na')
  })

  test('switching language button updates active language selection', async () => {
    await mount()

    const englishBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('English')
    )
    expect(englishBtn).not.toBeNull()
    click(englishBtn)

    expect(englishBtn.getAttribute('aria-pressed')).toBe('true')
  })

  test('does not render delete my data button', async () => {
    await mount()

    const clearBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('Burahin') || b.textContent.includes('Delete my data')
    )
    expect(clearBtn).toBeUndefined()
  })

  test('does not render privacy guarantee card', async () => {
    await mount()

    expect(container.textContent).not.toContain('Pribado sa Device')
    expect(container.textContent).not.toContain('On-Device Privacy')
    expect(container.textContent).not.toContain('This profile is stored only on your phone')
    expect(container.querySelector('svg.lucide-shield-check')).toBeNull()
  })

  test('renders province dropdown with only Region 1 provinces', async () => {
    await mount()

    const provinceSelect = container.querySelector('select[aria-label="Lalawigan"]')
    expect(provinceSelect).not.toBeNull()

    const options = [...provinceSelect.querySelectorAll('option')].map((o) => o.value)
    // First option is empty placeholder
    expect(options[0]).toBe('')
    // Exactly Region 1 provinces: Ilocos Norte, Ilocos Sur, La Union, Pangasinan
    expect(options.slice(1)).toEqual([
      'Ilocos Norte',
      'Ilocos Sur',
      'La Union',
      'Pangasinan',
    ])
  })

  test('disables municipality dropdown when no province is chosen', async () => {
    await mount({
      profile: {
        id: 'me',
        nickname: '',
        sector: '',
        ageBand: '',
        province: '',
        municipality: '',
      },
    })

    const municipalitySelect = container.querySelector('select[aria-label="Munisipyo o lungsod"]')
    expect(municipalitySelect).not.toBeNull()
    expect(municipalitySelect.disabled).toBe(true)
    expect(municipalitySelect.value).toBe('')
    expect(municipalitySelect.textContent).toContain('Pumili muna ng probinsya')
  })

  test('enables municipality dropdown and lists only municipalities of chosen province', async () => {
    await mount({
      profile: {
        id: 'me',
        nickname: 'Ana',
        province: '',
        municipality: '',
      },
    })

    const provinceSelect = container.querySelector('select[aria-label="Lalawigan"]')
    const municipalitySelect = container.querySelector('select[aria-label="Munisipyo o lungsod"]')
    expect(municipalitySelect.disabled).toBe(true)

    // Select Ilocos Norte
    setSelectValue(provinceSelect, 'Ilocos Norte')
    expect(municipalitySelect.disabled).toBe(false)

    const ilocosNorteOptions = [...municipalitySelect.querySelectorAll('option')].map((o) => o.value)
    expect(ilocosNorteOptions).toContain('Laoag City')
    expect(ilocosNorteOptions).toContain('Batac City')
    expect(ilocosNorteOptions).toContain('Pagudpud')
    expect(ilocosNorteOptions).not.toContain('San Fernando City')
    expect(ilocosNorteOptions).not.toContain('Dagupan City')

    // Select La Union
    setSelectValue(provinceSelect, 'La Union')
    const laUnionOptions = [...municipalitySelect.querySelectorAll('option')].map((o) => o.value)
    expect(laUnionOptions).toContain('San Fernando City')
    expect(laUnionOptions).toContain('Agoo')
    expect(laUnionOptions).toContain('San Juan')
    expect(laUnionOptions).not.toContain('Laoag City')
    expect(laUnionOptions).not.toContain('Dagupan City')
  })

  test('resets municipality selection when switching to a different province without that municipality', async () => {
    await mount({
      profile: {
        id: 'me',
        nickname: 'Ana',
        province: 'La Union',
        municipality: 'San Fernando City',
      },
    })

    const provinceSelect = container.querySelector('select[aria-label="Lalawigan"]')
    const municipalitySelect = container.querySelector('select[aria-label="Munisipyo o lungsod"]')

    expect(provinceSelect.value).toBe('La Union')
    expect(municipalitySelect.value).toBe('San Fernando City')

    // Switch province to Pangasinan
    setSelectValue(provinceSelect, 'Pangasinan')

    // San Fernando City does not exist in Pangasinan -> reset to empty
    expect(municipalitySelect.value).toBe('')

    // Pick Dagupan City
    setSelectValue(municipalitySelect, 'Dagupan City')
    expect(municipalitySelect.value).toBe('Dagupan City')
  })

  test('saving persists selected province and municipality', async () => {
    await mount({
      profile: {
        id: 'me',
        nickname: 'Juan',
        province: '',
        municipality: '',
      },
    })

    const provinceSelect = container.querySelector('select[aria-label="Lalawigan"]')
    const municipalitySelect = container.querySelector('select[aria-label="Munisipyo o lungsod"]')

    setSelectValue(provinceSelect, 'Pangasinan')
    setSelectValue(municipalitySelect, 'Dagupan City')

    const saveBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('I-save')
    )

    await act(async () => {
      saveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await vi.waitFor(() => expect(onSavedMock).toHaveBeenCalled())
    })

    const savedData = onSavedMock.mock.calls[0][0]
    expect(savedData.province).toBe('Pangasinan')
    expect(savedData.municipality).toBe('Dagupan City')
  })

  test('saving shows loading spinner on button and displays popup notification with in and out animation', async () => {
    await mount()

    const saveBtn = [...container.querySelectorAll('button')].find((b) =>
      b.textContent.includes('I-save')
    )
    expect(saveBtn).not.toBeNull()

    await act(async () => {
      saveBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await vi.waitFor(() => expect(onSavedMock).toHaveBeenCalled())
    })

    // Popup notification appears at the top with in-animation
    const popup = container.querySelector('.animate-toast-down')
    expect(popup).not.toBeNull()
    expect(popup.textContent).toContain('Na-save na')

    // Dismiss popup triggers out-animation
    const closeBtn = popup.querySelector('button')
    expect(closeBtn).not.toBeNull()
    await act(async () => {
      closeBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // Out animation class is active while exiting
    expect(container.querySelector('.animate-toast-down-out')).not.toBeNull()

    // Unmounts once exit animation duration finishes
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 160))
    })
    expect(container.querySelector('.animate-toast-down-out')).toBeNull()
  })
})
