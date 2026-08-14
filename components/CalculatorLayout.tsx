import type { ReactNode } from "react";

/**
 * The frame every calculator shares: controls beside the chart, metrics below,
 * AI section at the bottom. Tabs compose this rather than extending it, so a
 * calculator with different controls does not fight the layout.
 */
interface CalculatorLayoutProps {
  title: string;
  description: string;
  controls: ReactNode;
  chart: ReactNode;
  metrics: ReactNode;
  aiSection: ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  controls,
  chart,
  metrics,
  aiSection,
}: CalculatorLayoutProps) {
  return (
    <div>
      <header>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </header>

      {/* ~37% controls / ~63% visualization on desktop, stacked below lg. */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,37fr)_minmax(0,63fr)]">
        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
          <div className="grid gap-5">{controls}</div>
        </div>
        <div className="min-w-0">{chart}</div>
      </div>

      <div className="mt-5">{metrics}</div>

      <div className="mt-6">{aiSection}</div>
    </div>
  );
}

/** Metric rows are identical across tabs, so they share one wrapper. */
export function MetricRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
}
