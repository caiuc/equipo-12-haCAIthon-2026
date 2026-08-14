"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "@/components/Footer";
import { LandingHero } from "@/components/LandingHero";
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
  presets,
} from "@/lib/mockData";
import type { ActiveTab, AIStatus, CreditState, DebtState, InvestmentState } from "@/lib/types";

/** How long the placeholder "analysis" spends in the loading state. */
const MOCK_ANALYSIS_MS = 1400;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("credit");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

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
  const simulatorRef = useRef<HTMLElement>(null);

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
    setActivePresetId(null);
    setCreditState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDebt = useCallback((patch: Partial<DebtState>) => {
    setActivePresetId(null);
    setDebtState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateInvestment = useCallback((patch: Partial<InvestmentState>) => {
    setActivePresetId(null);
    setInvestmentState((prev) => ({ ...prev, ...patch }));
  }, []);

  const scrollToSimulator = useCallback(() => {
    simulatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presets.find((candidate) => candidate.id === presetId);
      if (!preset) return;

      const pending = timers.current[preset.tab];
      if (pending) clearTimeout(pending);

      setActiveTab(preset.tab);
      setActivePresetId(preset.id);
      setAiStatus((prev) => ({ ...prev, [preset.tab]: "idle" }));

      if (preset.credit) {
        setCreditState((prev) => ({ ...prev, ...preset.credit }));
      }

      if (preset.debt) {
        setDebtState((prev) => ({
          ...prev,
          ...preset.debt,
          ...(preset.id === "overIndebted" ? { strategy: "snowball" } : {}),
        }));
      }

      if (preset.investment) {
        setInvestmentState((prev) => ({ ...prev, ...preset.investment }));
      }

      requestAnimationFrame(scrollToSimulator);
    },
    [scrollToSimulator],
  );

  const status = aiStatus[activeTab];
  const insight = status === "fallback" ? fallbackInsight : mockInsights[activeTab];
  const analyze = () => handleAnalyze(activeTab);

  return (
    /*
     * Full-bleed app shell: the rail owns the left edge and the full viewport
     * height, and only the content column scrolls. Under `lg` the rail becomes
     * a horizontal strip and the whole page scrolls normally.
     */
    /*
     * No background on the shell: the checkerboard ground is painted on <body>
     * (globals.css) and a color here would flatten it back out.
     */
    <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
      <TabRail tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col lg:overflow-y-auto">
        <main className="flex-1 p-5 sm:p-7 lg:p-9">
          <LandingHero
            activePresetId={activePresetId}
            onGoToSimulator={scrollToSimulator}
            onPresetSelect={handlePresetSelect}
          />

          <section
            ref={simulatorRef}
            id="simulador"
            aria-label="Simulador financiero interactivo"
            className="scroll-mt-6 border-t-4 border-line pt-14 sm:pt-16"
          >
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <span className="pixel pixel-sm pixel-flat pixel-magenta px-3 py-2 font-pixel text-[9px] uppercase leading-relaxed text-white">
                Zona interactiva
              </span>
              <p className="text-xs font-extrabold text-ink-secondary">
                Ajusta los controles · Compara el resultado · Pide tu análisis
              </p>
            </div>

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
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
