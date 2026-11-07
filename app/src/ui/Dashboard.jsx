import { useCallback, useEffect, useState } from 'react'
import { masteryByCompetency, proposedRemediations } from '../lib/mastery.js'
import { flush, listQueue, queueEvent, queueSize } from '../lib/telemetry.js'

const BARANGAYS = [
  { name: 'Biday', mastery: 58 },
  { name: 'Pagdaraoan', mastery: 71 },
  { name: 'Poro', mastery: 46 },
  { name: 'Ili Norte', mastery: 79 },
  { name: 'Sevilla', mastery: 64 },
]

function Bar({ label, value }) {
  const width = value === null ? 0 : Math.max(4, value)
  return (
    <li>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-[var(--color-muted)]">
          {value === null ? '—' : `${value}%`}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-line)]" aria-hidden="true">
        <div
          className="h-full rounded-full bg-[var(--color-accent)]"
          style={{ width: `${width}%` }}
        />
      </div>
    </li>
  )
}

export default function Dashboard() {
  const [events, setEvents] = useState([])
  const [queued, setQueued] = useState(0)
  const [status, setStatus] = useState(null)
  const [approved, setApproved] = useState([])
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    setEvents(await listQueue())
    setQueued(await queueSize())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const mastery = masteryByCompetency(events)
  const remediations = proposedRemediations(events).filter((row) => !approved.includes(row.competency))

  const sync = async () => {
    setBusy(true)
    const result = await flush()
    await refresh()
    setStatus(
      result.sent === 0
        ? 'Walang naka-queue. Walang kailangang i-sync.'
        : `Naipadala ang ${result.sent} logs sa City dashboard.`,
    )
    setBusy(false)
  }

  const approve = async (row) => {
    await queueEvent({
      type: 'remediation_approved',
      competency: row.competency,
      approvedBy: 'facilitator',
    })
    setApproved((current) => [...current, row.competency])
    await refresh()
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="mastery-heading">
        <h2 id="mastery-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Mastery by competency
        </h2>
        <ul className="mt-3 space-y-3">
          {mastery.map((row) => (
            <Bar key={row.competency} label={row.label} value={row.mastery} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="queue-heading" className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4">
        <h2 id="queue-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Offline queue
        </h2>
        <p className="mt-2 text-2xl font-bold tabular-nums">📦 {queued}</p>
        <p className="text-sm text-[var(--color-muted)]">learning logs waiting for a connection</p>
        <button
          type="button"
          onClick={sync}
          disabled={busy}
          className="mt-3 min-h-11 w-full rounded-xl border border-[var(--color-accent)] text-sm font-semibold text-[var(--color-accent)] disabled:opacity-50"
        >
          {busy ? 'Syncing…' : 'Simulate barangay Wi-Fi'}
        </button>
        {status && <p className="mt-2 text-sm text-[var(--color-muted)]">{status}</p>}
      </section>

      <section aria-labelledby="remediation-heading">
        <h2 id="remediation-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Proposed follow-up · needs approval
        </h2>
        {remediations.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Wala pang proposed follow-up. Tapusin ang isang quiz para may datos.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {remediations.map((row) => (
              <li key={row.competency} className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
                <p className="text-sm font-semibold">{row.label}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{row.reason}</p>
                <button
                  type="button"
                  onClick={() => approve(row)}
                  className="mt-2 min-h-10 w-full rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-on-accent)]"
                >
                  Approve follow-up
                </button>
              </li>
            ))}
          </ul>
        )}
        {approved.length > 0 && (
          <p className="mt-2 text-xs text-[var(--color-good)]">
            {approved.length} follow-up approved by the facilitator.
          </p>
        )}
      </section>

      <section aria-labelledby="barangay-heading">
        <h2 id="barangay-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          Barangay heatmap · synthetic sample
        </h2>
        <ul className="mt-3 space-y-2">
          {BARANGAYS.map((barangay) => (
            <Bar key={barangay.name} label={barangay.name} value={barangay.mastery} />
          ))}
        </ul>
        <p className="mt-2 text-xs text-[var(--color-muted)]">
          Sample data for the demo. No real learner records are used.
        </p>
      </section>
    </div>
  )
}
