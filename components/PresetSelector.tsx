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
      <h2 className="font-pixel text-[10px] uppercase leading-none text-ink">
        Empieza con un escenario
      </h2>

      <div className="mt-3.5 grid gap-4 pb-2 pr-2 sm:grid-cols-3">
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
                "pixel pixel-sm pixel-btn pixel-focus flex items-center gap-3 p-3 text-left",
                "transition-transform duration-75",
                selected ? "pixel-cyan pixel-pressed" : "pixel-white",
              ].join(" ")}
            >
              {Icon ? (
                <span
                  aria-hidden="true"
                  className="pixel pixel-sm pixel-flat pixel-gold flex h-9 w-9 shrink-0 items-center justify-center text-ink"
                >
                  <Icon size={17} strokeWidth={2.75} />
                </span>
              ) : null}

              <span className="min-w-0">
                <span className="block truncate font-pixel text-[9px] uppercase leading-tight text-ink">
                  {preset.label}
                </span>
                <span className="mt-1.5 block text-[11px] font-semibold leading-snug text-ink-secondary">
                  {preset.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
