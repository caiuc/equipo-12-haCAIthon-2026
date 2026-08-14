import type { ReactNode } from "react";

/**
 * Provisional primitives. Values arrive pre-formatted as strings so these stay
 * presentational — the financial engine decides what a number means.
 */
interface MetricPanelProps {
  title?: string;
  children: ReactNode;
}

/**
 * Groups the tab's result metrics as a dark arcade readout: the one place in
 * the layout where the numbers glow instead of sitting on paper. Rows are
 * separated by a lit hairline rather than a border so the panel stays a screen.
 */
export function MetricPanel({ title, children }: MetricPanelProps) {
  return (
    /*
     * The scanlines live on the inner element, not the panel: `.pixel` paints
     * its face on a negative-z pseudo-element, which covers the element's own
     * background. Padding sits inside too, so the lines reach the panel edge.
     */
    <div className="pixel pixel-flat pixel-screen h-full">
      <div className="pixel-scanlines h-full p-4">
        {title ? (
          <h3 className="mb-1 font-pixel text-[10px] uppercase leading-none text-gold">{title}</h3>
        ) : null}
        <div className="divide-y divide-white/15">{children}</div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="py-3.5 last:pb-0">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-page">{label}</p>
      {/*
       * break-words rather than truncate: a clipped peso figure is worse than
       * a wrapped one. It only splits a token that cannot fit at all, so
       * "$1.234.567" survives intact and "24 meses" still breaks at the space.
       */}
      <p className="mt-0.5 break-words font-score text-[30px] leading-none tabular-nums text-white">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[11px] leading-snug text-white/70">{hint}</p> : null}
    </div>
  );
}
