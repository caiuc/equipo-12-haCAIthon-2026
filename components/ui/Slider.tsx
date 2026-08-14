"use client";

import { useId } from "react";

/**
 * Provisional primitive. The visual treatment lives here plus the `.fp-range`
 * block in app/globals.css — swapping in a different slider means editing
 * those two places, never a calculator tab.
 *
 * The track reads as a segmented energy bar; the current value sits above it
 * in the score face so it scans as a readout rather than a caption.
 */
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  /** Formats the value shown beside the label and at the track ends. */
  formatValue?: (value: number) => string;
  hint?: string;
  disabled?: boolean;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => String(v),
  hint,
  disabled = false,
}: SliderProps) {
  const id = useId();
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <div className={disabled ? "opacity-55" : undefined}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink"
        >
          {label}
        </label>
        <span className="pixel pixel-sm pixel-flat pixel-gold shrink-0 px-2 py-0.5 font-score text-lg leading-none tabular-nums text-ink">
          {formatValue(value)}
        </span>
      </div>

      <input
        id={id}
        type="range"
        className="fp-range mt-2.5"
        style={{ "--fp-pct": `${pct}%` } as React.CSSProperties}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={formatValue(value)}
      />

      <div className="mt-1 flex justify-between font-score text-sm leading-none tabular-nums text-ink-muted">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {hint ? <p className="mt-1.5 text-xs leading-snug text-ink-muted">{hint}</p> : null}
    </div>
  );
}
