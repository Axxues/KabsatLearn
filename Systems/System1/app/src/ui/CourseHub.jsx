const CARD_STYLES = {
  capsule: 'rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(17,19,26,0.05)]',
}

function CapsuleCard({ capsule, onOpen, onDownload, onShare, downloading }) {
  const installed = Boolean(capsule.installed)

  return (
    <li className={CARD_STYLES.capsule}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold leading-snug">{capsule.title}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{capsule.subtitle}</p>
        </div>
        {installed ? (
          <span className="shrink-0 rounded-full bg-[var(--color-accent)]/10 px-2 py-1 text-xs font-semibold text-[var(--color-accent)]">
            Ready
          </span>
        ) : (
          <span className="shrink-0 rounded-full border border-[var(--color-line)] px-2 py-1 text-xs font-medium text-[var(--color-muted)]">
            {capsule.kb} KB
          </span>
        )}
      </div>

      <dl className="mt-3 flex gap-4 text-xs text-[var(--color-muted)]">
        <div>
          <dt className="sr-only">Cards</dt>
          <dd>{capsule.cards} cards</dd>
        </div>
        <div>
          <dt className="sr-only">Questions</dt>
          <dd>{capsule.questions} questions</dd>
        </div>
      </dl>

      <div className="mt-4 flex gap-2">
        {installed ? (
          <button
            type="button"
            onClick={() => onOpen(capsule.id)}
            className="min-h-11 flex-1 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-on-accent)] transition-colors hover:bg-[var(--color-accent-strong)]"
          >
            Open course
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDownload(capsule.id)}
            disabled={downloading}
            className="min-h-11 flex-1 rounded-xl border border-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/5 disabled:opacity-60"
          >
            {downloading ? 'Downloading…' : `Download (${capsule.kb} KB)`}
          </button>
        )}
        <button
          type="button"
          onClick={() => onShare(capsule.id)}
          disabled={!installed}
          className="min-h-11 rounded-xl border border-[var(--color-line)] px-3 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-40"
        >
          Pass
        </button>
      </div>
    </li>
  )
}

export default function CourseHub({ capsules, onOpen, onDownload, onShare, downloadingId }) {
  if (capsules.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">Loading your courses…</p>
  }

  const installed = capsules.filter((c) => c.installed)
  const available = capsules.filter((c) => !c.installed)

  return (
    <div className="space-y-6">
      <section aria-labelledby="installed-heading">
        <h2 id="installed-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
          On this phone
        </h2>
        <ul className="mt-3 space-y-3">
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

      {available.length > 0 && (
        <section aria-labelledby="available-heading">
          <h2 id="available-heading" className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">
            Download when you have signal
          </h2>
          <ul className="mt-3 space-y-3">
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
