interface RoadmapCardProps {
  /** Zero-based; the card renders it as a 1-based step number. */
  index: number;
  title: string;
  detail: string;
  loading?: boolean;
}

/**
 * One step of the roadmap. Like the diagnosis, `title` and `detail` are
 * rendered as text children so model output can never inject markup.
 */
export function RoadmapCard({ index, title, detail, loading = false }: RoadmapCardProps) {
  return (
    <li className="flex gap-3 rounded-card border border-line bg-surface p-4 shadow-card">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-strong"
      >
        {index + 1}
      </span>

      {loading ? (
        <div className="fp-shimmer flex-1 space-y-2 pt-1" aria-hidden="true">
          <div className="h-3 w-7/12 rounded bg-surface-muted" />
          <div className="h-3 w-full rounded bg-surface-muted" />
        </div>
      ) : (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{detail}</p>
        </div>
      )}
    </li>
  );
}
