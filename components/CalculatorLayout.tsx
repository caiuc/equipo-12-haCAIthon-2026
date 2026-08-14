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
        <h1 className="pixel-title font-pixel text-xl uppercase leading-tight text-ink">{title}</h1>
        <p className="mt-3 max-w-[60ch] text-sm font-semibold leading-relaxed text-ink-secondary">
          {description}
        </p>
      </header>

      {/* pr-2/pb-2 on the grid keeps every panel's hard shadow inside the column. */}
      <div className="mt-7 grid gap-7 pb-2 pr-2 lg:grid-cols-[minmax(0,48fr)_minmax(0,52fr)]">
        {/*
         * Controls and results share one card so the numbers read as output of
         * the sliders beside them. Inside it the results sit on their own dark
         * readout panel, which is what separates the two columns — no divider.
         */}
        <div className="pixel pixel-white flex flex-col p-4">
          <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,56fr)_minmax(0,44fr)]">
            <div className="grid content-start gap-6 p-1">{controls}</div>
            {metrics}
          </div>
        </div>

        <div className="min-w-0">{chart}</div>
      </div>

      <div className="mt-2 pb-2 pr-2">{aiSection}</div>
    </div>
  );
}
