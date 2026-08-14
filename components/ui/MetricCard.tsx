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
 * Groups the tab's result metrics, hairline-separated. Carries no card chrome
 * of its own — it sits inside the shared controls card (see CalculatorLayout).
 */
export function MetricPanel({ title, children }: MetricPanelProps) {
  return (
    <div>
      {title ? <h3 className="mb-1 text-sm font-semibold text-ink">{title}</h3> : null}
      <div className="divide-y divide-line">{children}</div>
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
    <div className="py-4 last:pb-0">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
}
