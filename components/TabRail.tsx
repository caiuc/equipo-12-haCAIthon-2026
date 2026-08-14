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
 * App-shell rail: flush to the left edge, full viewport height, icon stacked
 * over its label. The buttons stay grouped at the top — the empty space below
 * them is intentional. Collapses to a horizontal strip under `lg`.
 */
export function TabRail({ tabs, activeTab, onTabChange }: TabRailProps) {
  return (
    <nav
      aria-label="Calculadoras"
      className="flex shrink-0 items-center gap-1 border-b border-line bg-surface px-2 py-2 lg:h-full lg:w-[92px] lg:flex-col lg:items-stretch lg:gap-1 lg:border-b-0 lg:border-r lg:py-3"
    >
      <span className="shrink-0 px-2 text-sm font-semibold leading-tight text-ink lg:mb-3 lg:px-0 lg:text-center lg:text-xs">
        FinPath AI
      </span>

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
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              "lg:flex-none",
              selected
                ? "bg-accent-strong text-white shadow-card"
                : "text-ink-secondary hover:bg-accent-soft hover:text-accent-strong",
            ].join(" ")}
          >
            <Icon size={20} aria-hidden="true" className="shrink-0" />
            <span className="w-full truncate text-center text-[11px] font-medium leading-tight">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
