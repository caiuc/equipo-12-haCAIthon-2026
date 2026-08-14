"use client";

/**
 * Provisional primitive. Two-or-three-way exclusive choice, styled once here.
 *
 * Each option is a full arcade button; the selected one renders permanently
 * pressed (`pixel-pressed`) so the state reads physically, not just by color.
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
      {label ? (
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink">
          {label}
        </p>
      ) : null}

      {/* gap leaves room for each button's 4px shadow plus its pressed travel. */}
      <div
        role="group"
        aria-label={label}
        className="grid gap-2.5 pr-1"
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
                "pixel pixel-sm pixel-btn pixel-focus min-w-0 px-2 py-2 text-center",
                "transition-transform duration-75",
                selected ? "pixel-cyan pixel-pressed text-ink" : "pixel-white text-ink-secondary",
              ].join(" ")}
            >
              <span className="block font-pixel text-[9px] uppercase leading-tight">
                {option.label}
              </span>
              {option.hint ? (
                <span className="mt-1 block text-[10px] font-bold leading-tight text-ink-muted">
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
