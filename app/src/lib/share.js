import { exportCapsule, installCapsule } from './capsuleStore.js'

/** A shareable File for a capsule, carrying its hash. */
export async function capsuleFile(id) {
  const json = await exportCapsule(id)
  if (!json) throw new Error(`capsule not found: ${id}`)
  return new File([json], `${id}.kabsat`, { type: 'application/json' })
}

export function downloadFile(file) {
  const url = URL.createObjectURL(file)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Send a capsule through the OS share sheet — Bluetooth, Nearby Share, AirDrop.
 * Falls back to a plain file download when sharing is unavailable.
 */
export async function shareCapsule(id) {
  const file = await capsuleFile(id)

  const canShareFiles =
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })

  if (canShareFiles && typeof navigator.share === 'function') {
    try {
      await navigator.share({ files: [file], title: `KabsatLearn: ${id}` })
      return { ok: true, method: 'share' }
    } catch (error) {
      if (error?.name === 'AbortError') return { ok: false, method: 'cancelled' }
    }
  }

  downloadFile(file)
  return { ok: true, method: 'download' }
}

/** Import a `.kabsat` file chosen by the learner. */
export async function importCapsuleFile(file) {
  return installCapsule(file)
}
