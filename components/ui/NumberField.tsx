"use client";

import { useId } from "react";

/**
 * Provisional primitive. A compact labelled input for values a slider cannot
 * carry — the debt table needs four fields per row, which is more than the
 * controls column has width for in slider form.
 *
 * Values stay numeric: the field never holds a half-typed string, so whatever
 * the engine receives is always simulatable. Clearing the box reads as 0.
 */
interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Unit shown inside the box, e.g. "$" before the amount or "%" after it. */
  prefix?: string;
  suffix?: string;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  prefix,
  suffix,
  hideLabel = false,
}: NumberFieldProps) {
  const id = useId();

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className={
          hideLabel
            ? "sr-only"
            : "block text-[9px] font-extrabold uppercase tracking-[0.08em] text-ink-muted"
        }
      >
        {label}
      </label>

      <div className="pixel pixel-sm pixel-flat pixel-white mt-1 flex items-center gap-1 px-2 py-1">
        {prefix ? (
          <span aria-hidden="true" className="font-score text-sm leading-none text-ink-muted">
            {prefix}
          </span>
        ) : null}

        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="pixel-focus w-full min-w-0 bg-transparent font-score text-base leading-none tabular-nums text-ink outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (!Number.isFinite(next)) {
              onChange(min);
              return;
            }
            onChange(max === undefined ? Math.max(min, next) : Math.min(max, Math.max(min, next)));
          }}
        />

        {suffix ? (
          <span aria-hidden="true" className="font-score text-sm leading-none text-ink-muted">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}
