"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { TabRail, tabs } from "@/components/TabRail";
import { CreditTab } from "@/components/tabs/CreditTab";
import { DebtTab } from "@/components/tabs/DebtTab";
import { InvestmentTab } from "@/components/tabs/InvestmentTab";
import {
  fallbackInsight,
  initialCreditState,
  initialDebtState,
  initialInvestmentState,
  mockInsights,
} from "@/lib/mockData";
import type { ActiveTab, AIStatus, CreditState, DebtState, InvestmentState } from "@/lib/types";

/*
 * The preset/scenario picker is built but not mounted. To bring it back:
 * render <PresetSelector presets={presets} activePresetId={id} onSelect={fn} />
 * above the calculator container — see components/PresetSelector.tsx and the
 * `presets` export in lib/mockData.ts.
 */

/** How long the placeholder "analysis" spends in the loading state. */
const MOCK_ANALYSIS_MS = 1400;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("credit");

  // One state object per calculator, held here so switching tabs preserves
  // whatever the user already entered. Values are never copied between tabs.
  const [creditState, setCreditState] = useState<CreditState>(initialCreditState);
  const [debtState, setDebtState] = useState<DebtState>(initialDebtState);
  const [investmentState, setInvestmentState] = useState<InvestmentState>(initialInvestmentState);

  const [aiStatus, setAiStatus] = useState<Record<ActiveTab, AIStatus>>({
    credit: "idle",
    debt: "idle",
    investment: "idle",
  });

  const timers = useRef<Partial<Record<ActiveTab, ReturnType<typeof setTimeout>>>>({});

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of Object.values(pending)) {
        if (timer) clearTimeout(timer);
      }
    };
  }, []);

  /**
   * Placeholder for the Gemini round-trip: no request is made, it just walks
   * the status through loading and lands on success. Replace the body with a
   * fetch to /api/gemini and set "fallback" when that call fails.
   */
  const handleAnalyze = useCallback((tab: ActiveTab) => {
    const pending = timers.current[tab];
    if (pending) clearTimeout(pending);

    setAiStatus((prev) => ({ ...prev, [tab]: "loading" }));
    timers.current[tab] = setTimeout(() => {
      setAiStatus((prev) => ({ ...prev, [tab]: "success" }));
    }, MOCK_ANALYSIS_MS);
  }, []);

  const updateCredit = useCallback((patch: Partial<CreditState>) => {
    setCreditState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDebt = useCallback((patch: Partial<DebtState>) => {
    setDebtState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateInvestment = useCallback((patch: Partial<InvestmentState>) => {
    setInvestmentState((prev) => ({ ...prev, ...patch }));
  }, []);

  const status = aiStatus[activeTab];
  const insight = status === "fallback" ? fallbackInsight : mockInsights[activeTab];
  const analyze = () => handleAnalyze(activeTab);

  return (
    /*
     * Full-bleed app shell: the rail owns the left edge and the full viewport
     * height, and only the content column scrolls. Under `lg` the rail becomes
     * a horizontal strip and the whole page scrolls normally.
     */
    <div className="flex min-h-screen flex-col bg-page lg:h-screen lg:flex-row lg:overflow-hidden">
      <TabRail tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "credit" ? (
            <CreditTab
              state={creditState}
              onChange={updateCredit}
              aiStatus={status}
              insight={insight}
              onAnalyze={analyze}
            />
          ) : null}

          {activeTab === "debt" ? (
            <DebtTab
              state={debtState}
              onChange={updateDebt}
              aiStatus={status}
              insight={insight}
              onAnalyze={analyze}
            />
          ) : null}

          {activeTab === "investment" ? (
            <InvestmentTab
              state={investmentState}
              onChange={updateInvestment}
              aiStatus={status}
              insight={insight}
              onAnalyze={analyze}
            />
          ) : null}
        </main>

        <Footer />
      </div>
    </div>
  );
}
