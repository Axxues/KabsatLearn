import {
  ShieldCheck,
  Briefcase,
  Check,
  BookOpen,
  HelpCircle,
  Zap,
  Play,
  Download,
  Share2,
  UploadCloud,
  MapPin,
  Loader2,
} from 'lucide-react'

function CapsuleCard({ capsule, onOpen, onDownload, onShare, downloading }) {
  const installed = Boolean(capsule.installed)

  return (
    <li className="card-tactile group relative overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4.5 shadow-sm transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md">
      {/* Decorative top accent bar for installed courses */}
      {installed && (
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-strong)]"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--color-accent-subtle)] text-[var(--color-accent)]">
              {capsule.id === 'capsule-101' ? (
                <ShieldCheck className="size-4 stroke-[2.2]" aria-hidden="true" />
              ) : (
                <Briefcase className="size-4 stroke-[2.2]" aria-hidden="true" />
              )}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">
              {capsule.id === 'capsule-101' ? 'Digital Safety' : 'Hanapbuhay'}
            </span>
          </div>
          <h2 className="mt-1.5 text-base font-bold leading-snug text-[var(--color-ink)]">
            {capsule.title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
            {capsule.subtitle}
          </p>
        </div>

        {installed ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-good)]/30 bg-[var(--color-good-subtle)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-good)]">
            <Check className="size-3 stroke-[3]" aria-hidden="true" />
            Handa
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-[var(--color-line)] bg-[var(--color-surface-sunken)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-[var(--color-muted)]">
            {capsule.kb} KB
          </span>
        )}
      </div>

      {/* Meta counters */}
      <div className="mt-3.5 flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-line)]/60 text-xs text-[var(--color-muted)]">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-sunken)] px-2.5 py-1 font-medium text-[var(--color-ink)]">
          <BookOpen className="size-3.5 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
          {capsule.cards} aralin
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface-sunken)] px-2.5 py-1 font-medium text-[var(--color-ink)]">
          <HelpCircle className="size-3.5 text-[var(--color-terracotta)] stroke-[2]" aria-hidden="true" />
          {capsule.questions} tanong
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
          <Zap className="size-3 text-[var(--color-warn)] fill-[var(--color-warn)]" aria-hidden="true" />
          100% Offline
        </span>
      </div>

      {/* Simulated download progress bar with animation */}
      {downloading && (
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-[var(--color-accent)]">
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin stroke-[2.5]" aria-hidden="true" />
              Kinukuha ang aralin…
            </span>
            <span className="animate-pulse">Downloading</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-line)]">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-terracotta)] transition-all duration-300" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex gap-2.5">
        {installed ? (
          <button
            type="button"
            onClick={() => onOpen(capsule.id)}
            className="btn-press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-bold text-[var(--color-on-accent)] shadow-sm hover:bg-[var(--color-accent-strong)]"
          >
            <Play className="size-4 fill-current stroke-none" aria-hidden="true" />
            Buksan ang Kurso
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDownload(capsule.id)}
            disabled={downloading}
            className="btn-press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-accent)] bg-transparent px-4 text-sm font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
          >
            <Download className="size-4 stroke-[2.5]" aria-hidden="true" />
            {downloading ? 'Kinukuha…' : `I-download (${capsule.kb} KB)`}
          </button>
        )}
        <button
          type="button"
          onClick={() => onShare(capsule.id)}
          disabled={!installed}
          title="Ipasa sa kaklase via Bluetooth o Nearby Share"
          aria-label={`Ipasa ang ${capsule.title} sa kaklase`}
          className="btn-press flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 text-xs font-semibold text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)] disabled:opacity-40"
        >
          <Share2 className="size-4 text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
          Ipasa
        </button>
      </div>
    </li>
  )
}

export default function CourseHub({
  capsules,
  onOpen,
  onDownload,
  onShare,
  onImport,
  downloadingId,
}) {
  if (capsules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="size-10 animate-spin text-[var(--color-accent)] stroke-[2]" aria-hidden="true" />
        <p className="mt-4 text-sm font-medium text-[var(--color-muted)]">Kinukuha ang iyong mga kurso…</p>
      </div>
    )
  }

  const installed = capsules.filter((c) => c.installed)
  const available = capsules.filter((c) => !c.installed)

  return (
    <div className="space-y-6">
      {/* Community Learner Greeting Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-strong)] p-4.5 text-[var(--color-on-accent)] shadow-md">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-xs">
            <MapPin className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            <span>San Fernando, La Union</span>
          </div>
          <h2 className="mt-2 text-lg font-extrabold leading-tight tracking-tight">
            Naimbag nga aldaw, Kabsat!
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-blue-100">
            Aralin sa sariling wika, kahit walang koneksyon sa internet. Maaari kang mag-aral, mag-quiz, at magbahagi sa kaklase.
          </p>
        </div>
        <div className="pointer-events-none absolute -bottom-6 -right-6 size-28 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
      </section>

      {/* Interactive Import Card */}
      <label className="card-tactile group flex min-h-16 cursor-pointer items-center gap-3.5 rounded-2xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-3.5 transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)]/50">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-subtle)] text-[var(--color-accent)] group-hover:scale-105 transition-transform duration-150">
          <UploadCloud className="size-5 stroke-[2]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[var(--color-ink)]">
            Mag-import ng .kabsat file
          </p>
          <p className="text-[11px] text-[var(--color-muted)]">
            Ipasa mula sa kaklase gamit ang Bluetooth, Nearby, o USB
          </p>
        </div>
        <span className="shrink-0 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-1 text-[10px] font-bold text-[var(--color-accent)]">
          Piliin
        </span>
        <input
          type="file"
          accept=".kabsat,application/json"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImport(file)
            event.target.value = ''
          }}
        />
      </label>

      {/* Installed Capsules Section */}
      <section aria-labelledby="installed-heading">
        <div className="flex items-center justify-between pb-2">
          <h2
            id="installed-heading"
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
          >
            Nasa teleponong ito
          </h2>
          <span className="rounded-full bg-[var(--color-good-subtle)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-good)]">
            {installed.length} handa na
          </span>
        </div>
        <ul className="mt-2 space-y-3">
          {installed.map((capsule) => (
            <CapsuleCard
              key={capsule.id}
              capsule={capsule}
              onOpen={onOpen}
              onDownload={onDownload}
              onShare={onShare}
              downloading={downloadingId === capsule.id}
            />
          ))}
        </ul>
      </section>

      {/* Available for Download Section */}
      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <div className="flex items-center justify-between pb-2">
            <h2
              id="available-heading"
              className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]"
            >
              Maaaring i-download kapag may Wi-Fi
            </h2>
            <span className="rounded-full bg-[var(--color-surface-sunken)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]">
              {available.length} available
            </span>
          </div>
          <ul className="mt-2 space-y-3">
            {available.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onOpen={onOpen}
                onDownload={onDownload}
                onShare={onShare}
                downloading={downloadingId === capsule.id}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
