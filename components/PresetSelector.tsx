"use client";

import { GraduationCap, PiggyBank, Wallet, type LucideIcon } from "lucide-react";

import type { Preset } from "@/lib/types";

/** Icons live here rather than in lib/mockData.ts so preset data stays plain. */
const PRESET_ICONS: Record<string, LucideIcon> = {
  studentCredit: GraduationCap,
  overIndebted: Wallet,
  firstSaver: PiggyBank,
};

interface PresetSelectorProps {
  presets: Preset[];
  activePresetId: string | null;
  onSelect: (preset: Preset) => void;
}

export function PresetSelector({ presets, activePresetId, onSelect }: PresetSelectorProps) {
  return (
    <section aria-label="Escenarios de ejemplo">
      <h2 className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        Empieza con un escenario
      </h2>

      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {presets.map((preset) => {
          const Icon = PRESET_ICONS[preset.id];
          const selected = preset.id === activePresetId;

          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(preset)}
              className={[
                "flex items-center gap-3 rounded-card border bg-surface p-3 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                selected
                  ? "border-accent bg-accent-soft shadow-card"
                  : "border-line hover:border-accent hover:bg-accent-soft",
              ].join(" ")}
            >
              {Icon ? (
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-strong"
                >
                  <Icon size={18} />
                </span>
              ) : null}

              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{preset.label}</span>
                <span className="block text-xs text-ink-muted">{preset.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
