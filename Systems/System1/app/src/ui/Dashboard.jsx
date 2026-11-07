import { useCallback, useEffect, useMemo, useState } from 'react'
import { masteryByCompetency, proposedRemediations } from '../lib/mastery.js'
import { flush, listQueue, queueEvent, queueSize } from '../lib/telemetry.js'
import { listCapsules } from '../lib/capsuleStore.js'
import { CAPSULE_BY_ID } from '../data/catalogue.js'
import { useI18n } from '../lib/i18n.jsx'
import RollingNumber from './RollingNumber.jsx'
import AnimatedSuccessCheck from './AnimatedSuccessCheck.jsx'
import {
  BarChart3,
  Package,
  Wifi,
  RotateCw,
  Check,
  TrendingUp,
  MapPin,
} from 'lucide-react'

const BARANGAYS = [
  { name: 'Biday', mastery: 58 },
  { name: 'Pagdaraoan', mastery: 71 },
  { name: 'Poro', mastery: 46 },
  { name: 'Ili Norte', mastery: 79 },
  { name: 'Sevilla', mastery: 64 },
]

function Bar({ label, value }) {
  const { t } = useI18n()
  const width = value === null ? 0 : Math.max(4, value)
  const isHigh = value !== null && value >= 70
  const isMid = value !== null && value >= 50 && value < 70

  const barColor = isHigh
    ? 'bg-[var(--color-good)]'
    : isMid
      ? 'bg-[var(--color-warn)]'
      : 'bg-[var(--color-terracotta)]'

  return (
    <li className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 shadow-2xs">
      <div className="flex items-baseline justify-between text-xs">
        <span className="font-bold text-[var(--color-ink)]">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums font-black text-[var(--color-ink)]">
            {value === null ? '—' : `${value}%`}
          </span>
          {value !== null && (
            <span
              className={`rounded-md px-1.5 py-0.2 text-[10px] font-bold ${
                isHigh
                  ? 'bg-[var(--color-good-subtle)] text-[var(--color-good)]'
                  : isMid
                    ? 'bg-[var(--color-warn-subtle)] text-[var(--color-warn)]'
                    : 'bg-[var(--color-terracotta-subtle)] text-[var(--color-terracotta)]'
              }`}
            >
              {isHigh ? t('masteryHigh') : isMid ? t('masteryMid') : t('masteryLow')}
            </span>
          )}
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-line)]" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </li>
  )
}

export default function Dashboard({ capsules: propCapsules } = {}) {
  const { t } = useI18n()
  const [events, setEvents] = useState([])
  const [queued, setQueued] = useState(0)
  const [installedCapsules, setInstalledCapsules] = useState([])
  const [status, setStatus] = useState(null)
  const [approved, setApproved] = useState([])
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    const [q, s, loaded] = await Promise.all([listQueue(), queueSize(), listCapsules()])
    setEvents(q)
    setQueued(s)
    setInstalledCapsules(loaded)
  }, [])

  useEffect(() => {
    let active = true
    Promise.all([listQueue(), queueSize(), listCapsules()]).then(([q, s, loaded]) => {
      if (!active) return
      setEvents(q)
      setQueued(s)
      setInstalledCapsules(loaded)
    })
    return () => {
      active = false
    }
  }, [])

  const installedList =
    installedCapsules.length > 0
      ? installedCapsules
      : (propCapsules || []).filter((c) => c.installed)

  const activeCompetencies = useMemo(() => {
    const set = new Set()
    for (const c of installedList) {
      const full = CAPSULE_BY_ID[c.id] || c
      if (Array.isArray(full.competency)) {
        full.competency.forEach((comp) => set.add(comp))
      } else if (typeof full.competency === 'string') {
        set.add(full.competency)
      }
      if (Array.isArray(full.questions)) {
        full.questions.forEach((q) => {
          if (q?.competency) set.add(q.competency)
        })
      }
    }
    return set
  }, [installedList])

  const mastery = masteryByCompetency(
    events,
    activeCompetencies
  )
  const remediations = proposedRemediations(
    events,
    60,
    activeCompetencies
  ).filter((row) => !approved.includes(row.competency))

  const validScores = mastery.map((m) => m.mastery).filter((v) => v !== null)
  const avgMastery =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null

  const sync = async () => {
    setBusy(true)
    const result = await flush()
    await refresh()
    setStatus(
      result.sent === 0
        ? t('syncEmpty')
        : t('syncSuccess', { n: result.sent }),
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
      {/* Civic Header Card */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-sunken)] p-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-white shadow-xs">
            <BarChart3 className="size-5 stroke-[2.2]" aria-hidden="true" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--color-accent)]">
              City of San Fernando · ALS Hub
            </span>
            <h2 className="text-base font-extrabold text-[var(--color-ink)]">
              Education Monitoring
            </h2>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
          {t('dashboardSubtitle')}
        </p>
      </section>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
              {t('queuedLogs')}
            </p>
            <Package className="size-4 text-[var(--color-muted)] stroke-[2]" aria-hidden="true" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums text-[var(--color-ink)]">
              <RollingNumber value={queued} />
            </span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">{t('events')}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
              {t('avgMastery')}
            </p>
            <TrendingUp className="size-4 text-[var(--color-accent)] stroke-[2.2]" aria-hidden="true" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black tabular-nums text-[var(--color-accent)]">
              {avgMastery === null ? '—' : <><RollingNumber value={avgMastery} />%</>}
            </span>
            <span className="text-xs font-semibold text-[var(--color-muted)]">{t('overall')}</span>
          </div>
        </div>
      </div>

      {/* Mastery by Competency */}
      <section aria-labelledby="mastery-heading">
        <div className="flex items-center justify-between pb-2">
          <h2
            id="mastery-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            {t('masteryHeading')}
          </h2>
        </div>
        <ul className="mt-1 space-y-2">
          {mastery.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[var(--color-line)] p-4 text-center text-xs text-[var(--color-muted)]">
              {t('noDownloadedCourses')}
            </li>
          ) : (
            mastery.map((row) => (
              <Bar key={row.competency} label={row.label} value={row.mastery} />
            ))
          )}
        </ul>
      </section>

      {/* Offline Queue & Sync */}
      <section
        aria-labelledby="queue-heading"
        className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              <Package className="size-4 stroke-[2.2]" aria-hidden="true" />
            </span>
            <h2 id="queue-heading" className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]">
              {t('queueCardTitle')}
            </h2>
          </div>
          <span className="rounded-full bg-[var(--color-surface-sunken)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--color-muted)]">
            {t('syncPending', { n: queued })}
          </span>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted)]">
          {t('queueCardSub')}
        </p>

        <button
          type="button"
          onClick={sync}
          disabled={busy}
          className="btn-press mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-xs font-bold text-[var(--color-on-accent)] shadow-sm hover:bg-[var(--color-accent-strong)] disabled:opacity-50"
        >
          {busy ? (
            <>
              <RotateCw className="size-4 animate-spin stroke-[2.5]" aria-hidden="true" />
              <span>{t('syncingButton')}</span>
            </>
          ) : (
            <>
              <Wifi className="size-4 stroke-[2.5]" aria-hidden="true" />
              <span>{t('syncWifiButton')}</span>
            </>
          )}
        </button>

        {status && (
          <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-[var(--color-good)]/30 bg-[var(--color-good-subtle)] p-2.5 text-xs font-semibold text-[var(--color-good)] animate-pop-in">
            <AnimatedSuccessCheck className="size-4" circleColor="var(--color-good)" tickColor="var(--color-good)" />
            <span>{status}</span>
          </div>
        )}
      </section>

      {/* Facilitator Remediation Gate */}
      <section aria-labelledby="remediation-heading">
        <div className="pb-2">
          <h2
            id="remediation-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            {t('remediationHeading')}
          </h2>
        </div>

        {remediations.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 text-center">
            <p className="text-xs font-medium text-[var(--color-muted)]">
              {t('noRemediations')}
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {remediations.map((row) => (
              <li
                key={row.competency}
                className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-ink)]">
                      {row.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                      {row.reason}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[var(--color-terracotta-subtle)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--color-terracotta)]">
                    {t('remediationNeeded')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => approve(row)}
                  className="btn-press mt-3 flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] text-xs font-bold text-[var(--color-on-accent)] shadow-xs hover:bg-[var(--color-accent-strong)]"
                >
                  <Check className="size-3.5 stroke-[3]" aria-hidden="true" />
                  <span>{t('approveButton')}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {approved.length > 0 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-good)] animate-pop-in">
            <AnimatedSuccessCheck className="size-4" circleColor="var(--color-good)" tickColor="var(--color-good)" />
            <span>{t('remediationApprovedSummary', { n: approved.length })}</span>
          </p>
        )}
      </section>

      {/* Barangay Heatmap Overview */}
      <section aria-labelledby="barangay-heading">
        <div className="flex items-center gap-1.5 pb-2">
          <MapPin className="size-3.5 text-[var(--color-muted)] stroke-[2]" aria-hidden="true" />
          <h2
            id="barangay-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            {t('barangayHeading')}
          </h2>
        </div>
        <ul className="space-y-2">
          {BARANGAYS.map((barangay) => (
            <Bar
              key={barangay.name}
              label={barangay.name}
              value={barangay.mastery}
            />
          ))}
        </ul>
        <p className="mt-2 text-[11px] text-[var(--color-muted)] leading-relaxed">
          {t('barangayDisclaimer')}
        </p>
      </section>
    </div>
  )
}
