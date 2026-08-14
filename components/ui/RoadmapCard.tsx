interface RoadmapCardProps {
  /** Zero-based; the card renders it as a 1-based step number. */
  index: number;
  title: string;
  detail: string;
  loading?: boolean;
}

/**
 * One step of the roadmap, numbered like a level select. Like the diagnosis,
 * `title` and `detail` are rendered as text children so model output can never
 * inject markup.
 */
export function RoadmapCard({ index, title, detail, loading = false }: RoadmapCardProps) {
  return (
    <li className="pixel pixel-white flex gap-3.5 p-4">
      <span
        aria-hidden="true"
        className="pixel pixel-sm pixel-flat pixel-gold flex h-8 w-8 shrink-0 items-center justify-center font-pixel text-[11px] leading-none text-ink"
      >
        {index + 1}
      </span>

      {loading ? (
        <div className="fp-shimmer flex-1 space-y-2 pt-1.5" aria-hidden="true">
          <div className="h-3 w-7/12 bg-accent-soft" />
          <div className="h-3 w-full bg-accent-soft" />
        </div>
      ) : (
        <div className="min-w-0">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.04em] text-ink">{title}</p>
          <p className="mt-1.5 text-xs font-semibold leading-relaxed text-ink-secondary">
            {detail}
          </p>
        </div>
      )}
    </li>
  );
}
