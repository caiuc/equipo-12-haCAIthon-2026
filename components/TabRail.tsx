"use client";

import { CreditCard, Landmark, TrendingUp, type LucideIcon } from "lucide-react";

import type { ActiveTab } from "@/lib/types";

export interface TabDefinition {
  id: ActiveTab;
  label: string;
  icon: LucideIcon;
}

export const tabs: TabDefinition[] = [
  { id: "credit", label: "Crédito", icon: CreditCard },
  { id: "debt", label: "Deuda", icon: Landmark },
  { id: "investment", label: "Inversión", icon: TrendingUp },
];

interface TabRailProps {
  tabs: TabDefinition[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

/**
 * App-shell rail: flush to the left edge, full viewport height, an arcade
 * cabinet menu of icon-over-label buttons. The selected tab renders
 * permanently pressed rather than merely tinted. The buttons stay grouped at
 * the top — the empty space below them is intentional. Collapses to a
 * horizontal strip under `lg`.
 */
export function TabRail({ tabs, activeTab, onTabChange }: TabRailProps) {
  return (
    <nav
      aria-label="Calculadoras"
      className="flex shrink-0 items-center gap-2.5 border-b-4 border-line bg-surface-muted px-3 py-3 lg:h-full lg:w-[118px] lg:flex-col lg:items-stretch lg:gap-3 lg:border-b-0 lg:border-r-4 lg:py-5"
    >
      {/* Wordmark: one line on the strip, stacked on the rail. Deliberately not
          a badge — a filled accent square reads as a selected tab down here. */}
      <div className="flex shrink-0 items-baseline gap-1.5 pr-2 font-pixel text-[10px] uppercase leading-none lg:mb-2 lg:flex-col lg:items-center lg:gap-1.5 lg:border-b-4 lg:border-line lg:pb-4 lg:pr-0 lg:text-[11px]">
        <span className="text-ink">FinPath</span>
        <span className="text-accent-strong">AI</span>
      </div>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => onTabChange(tab.id)}
            className={[
              // min-w-0 lets labels truncate instead of overflowing the strip.
              "pixel pixel-sm pixel-btn pixel-focus flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1 py-3",
              "transition-transform duration-75 lg:flex-none",
              selected ? "pixel-magenta pixel-pressed text-white" : "pixel-white text-ink",
            ].join(" ")}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" strokeWidth={2.75} />
            <span className="w-full truncate text-center font-pixel text-[9px] uppercase leading-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
