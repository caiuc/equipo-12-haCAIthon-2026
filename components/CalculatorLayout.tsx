import type { ReactNode } from "react";

/**
 * The frame every calculator shares: one card holding the controls and their
 * results side by side, the chart beside it, AI section below. Tabs compose
 * this rather than extending it, so a calculator with different controls does
 * not fight the layout.
 */
interface CalculatorLayoutProps {
  title: string;
  description: string;
  controls: ReactNode;
  metrics: ReactNode;
  chart: ReactNode;
  aiSection: ReactNode;
}

export function CalculatorLayout({
  title,
  description,
  controls,
  metrics,
  chart,
  aiSection,
}: CalculatorLayoutProps) {
  return (
    <div>
      <header>
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        <p className="mt-0.5 text-sm text-ink-muted">{description}</p>
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)]">
        {/*
         * Controls and results share one card so the numbers read as output of
         * the sliders beside them. The divider turns horizontal when the two
         * columns stack.
         */}
        <div className="flex flex-col rounded-card border border-line bg-surface shadow-card">
          {/* flex-1 makes the inner grid fill the card so the divider runs its full height. */}
          <div className="grid flex-1 divide-y divide-line md:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] md:divide-x md:divide-y-0">
            <div className="grid content-start gap-5 p-5">{controls}</div>
            <div className="p-5">{metrics}</div>
          </div>
        </div>

        <div className="min-w-0">{chart}</div>
      </div>

      <div className="mt-6">{aiSection}</div>
    </div>
  );
}
