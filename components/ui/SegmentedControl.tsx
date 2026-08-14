"use client";

/**
 * Provisional primitive. Two-or-three-way exclusive choice, styled once here.
 */
export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Optional caption under the label, e.g. "Conservador" beneath "5%". */
  hint?: string;
}

interface SegmentedControlProps<T extends string | number> {
  label?: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div>
      {label ? <p className="mb-2 text-sm font-medium text-ink">{label}</p> : null}

      <div
        role="group"
        aria-label={label}
        className="grid gap-1.5 rounded-xl bg-surface-muted p-1.5"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={[
                "rounded-lg px-2 py-2 text-center transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                selected
                  ? "bg-accent-strong text-white shadow-card"
                  : "text-ink-secondary hover:bg-surface hover:text-ink",
              ].join(" ")}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {option.hint ? (
                <span
                  className={[
                    "mt-0.5 block text-[11px] leading-tight",
                    selected ? "text-white/80" : "text-ink-muted",
                  ].join(" ")}
                >
                  {option.hint}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
