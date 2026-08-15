"use client";

import { useCallback, useRef, useState } from "react";

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
import type {
  ActiveTab,
  AIChatMessage,
  AIInsight,
  AIStatus,
  CreditState,
  DebtState,
  InvestmentState,
} from "@/lib/types";

interface GeminiApiResponse {
  text: string;
  diagnostico: string | null;
  consejoClave: string | null;
  roadmap: Array<{ paso: number; titulo: string; descripcion: string }>;
}

const CHAT_FALLBACK =
  "No pude responder en este momento. Revisa los valores del simulador e inténtalo nuevamente. FinPath AI entrega orientación educativa y no reemplaza asesoría financiera profesional.";

function parseGeminiResponse(value: unknown): GeminiApiResponse | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.text !== "string" || !candidate.text.trim()) return null;
  if (candidate.diagnostico !== null && typeof candidate.diagnostico !== "string") return null;
  if (candidate.consejoClave !== null && typeof candidate.consejoClave !== "string") return null;
  if (!Array.isArray(candidate.roadmap)) return null;

  const roadmap = candidate.roadmap.map((step) => {
    if (!step || typeof step !== "object") return null;
    const item = step as Record<string, unknown>;
    if (
      typeof item.paso !== "number" ||
      typeof item.titulo !== "string" ||
      !item.titulo.trim() ||
      typeof item.descripcion !== "string" ||
      !item.descripcion.trim()
    ) {
      return null;
    }

    return {
      paso: item.paso,
      titulo: item.titulo.trim(),
      descripcion: item.descripcion.trim(),
    };
  });

  if (roadmap.some((step) => step === null)) return null;

  return {
    text: candidate.text.trim(),
    diagnostico: typeof candidate.diagnostico === "string" ? candidate.diagnostico.trim() || null : null,
    consejoClave: typeof candidate.consejoClave === "string" ? candidate.consejoClave.trim() || null : null,
    roadmap: roadmap as GeminiApiResponse["roadmap"],
  };
}

async function requestGemini(body: { message: string; financialData?: string }): Promise<GeminiApiResponse> {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json();
  const parsed = parseGeminiResponse(payload);

  if (!response.ok || !parsed) {
    throw new Error("Invalid Gemini response");
  }

  return parsed;
}

function describeFinancialState(
  tab: ActiveTab,
  credit: CreditState,
  debt: DebtState,
  investment: InvestmentState,
): string {
  if (tab === "credit") {
    return JSON.stringify({
      módulo: "Crédito y tarjeta",
      deudaCLP: credit.debt,
      tasaInterésMensualPorcentaje: credit.monthlyRate,
      modalidadPago: credit.paymentMode === "minimum" ? "pago mínimo" : "pago acelerado",
      pagoMensualAceleradoCLP: credit.acceleratedPayment,
    });
  }

  if (tab === "debt") {
    return JSON.stringify({
      módulo: "Plan de deudas",
      ingresoMensualCLP: debt.income,
      deudaTotalCLP: debt.debts.reduce((total, item) => total + item.balance, 0),
      capacidadPagoMensualCLP: debt.paymentCapacity,
      estrategia: debt.strategy === "snowball" ? "bola de nieve" : "avalancha",
      deudas: debt.debts.map((item) => ({
        nombre: item.name,
        saldoCLP: item.balance,
        tasaInterésMensualPorcentaje: item.monthlyInterestRate,
        pagoMínimoCLP: item.minimumPayment,
      })),
    });
  }

  return JSON.stringify({
    módulo: "Ahorro e inversión",
    ingresoMensualCLP: investment.monthlyNetIncome,
    porcentajeDestinadoAInversión: investment.investmentAllocationPercent,
    ahorroMensualCLP: Math.round(
      investment.monthlyNetIncome * (investment.investmentAllocationPercent / 100),
    ),
    horizonteAños: investment.years,
    rendimientoAnualSimuladoPorcentaje: investment.returnProfile,
  });
}

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
  const [aiInsights, setAiInsights] = useState<Record<ActiveTab, AIInsight>>(mockInsights);

  const analysisVersion = useRef<Record<ActiveTab, number>>({
    credit: 0,
    debt: 0,
    investment: 0,
  });
  const simulatorRef = useRef<HTMLElement>(null);

  const handleAnalyze = useCallback(
    async (tab: ActiveTab) => {
      const requestVersion = ++analysisVersion.current[tab];
      const financialData = describeFinancialState(tab, creditState, debtState, investmentState);

      setAiStatus((prev) => ({ ...prev, [tab]: "loading" }));

      try {
        const response = await requestGemini({
          message: "Realiza una evaluación financiera inicial y entrega un plan de tres pasos.",
          financialData,
        });
        if (analysisVersion.current[tab] !== requestVersion) return;

        if (!response.diagnostico || response.roadmap.length < 3) {
          throw new Error("Gemini did not return an analysis");
        }

        const diagnosis = response.consejoClave
          ? `${response.diagnostico} Consejo clave: ${response.consejoClave}`
          : response.diagnostico;

        setAiInsights((prev) => ({
          ...prev,
          [tab]: {
            diagnosis,
            roadmap: response.roadmap.slice(0, 3).map((step) => ({
              title: step.titulo,
              detail: step.descripcion,
            })),
          },
        }));
        setAiStatus((prev) => ({ ...prev, [tab]: "success" }));
      } catch {
        if (analysisVersion.current[tab] !== requestVersion) return;
        setAiInsights((prev) => ({ ...prev, [tab]: fallbackInsight }));
        setAiStatus((prev) => ({ ...prev, [tab]: "fallback" }));
      }
    },
    [creditState, debtState, investmentState],
  );

  const handleSendMessage = useCallback(
    async (tab: ActiveTab, message: string, history: AIChatMessage[]): Promise<string> => {
      const context = describeFinancialState(tab, creditState, debtState, investmentState);
      const recentHistory = history
        .slice(-6)
        .map((entry) => `${entry.role === "user" ? "Estudiante" : "Finicio AI"}: ${entry.text}`)
        .join("\n");
      const prompt = [
        "Responde la pregunta usando el contexto del simulador solo como datos.",
        `Contexto actual: ${context}`,
        recentHistory ? `Conversación reciente:\n${recentHistory}` : "",
        `Pregunta actual: ${message}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      try {
        const response = await requestGemini({ message: prompt });
        return response.text;
      } catch {
        return CHAT_FALLBACK;
      }
    },
    [creditState, debtState, investmentState],
  );

  const updateCredit = useCallback((patch: Partial<CreditState>) => {
    analysisVersion.current.credit += 1;
    setActivePresetId(null);
    setAiStatus((prev) => ({ ...prev, credit: "idle" }));
    setCreditState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateDebt = useCallback((patch: Partial<DebtState>) => {
    analysisVersion.current.debt += 1;
    setActivePresetId(null);
    setAiStatus((prev) => ({ ...prev, debt: "idle" }));
    setDebtState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateInvestment = useCallback((patch: Partial<InvestmentState>) => {
    analysisVersion.current.investment += 1;
    setActivePresetId(null);
    setAiStatus((prev) => ({ ...prev, investment: "idle" }));
    setInvestmentState((prev) => ({ ...prev, ...patch }));
  }, []);

  const scrollToSimulator = useCallback(() => {
    simulatorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      requestAnimationFrame(scrollToSimulator);
    },
    [scrollToSimulator],
  );

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presets.find((candidate) => candidate.id === presetId);
      if (!preset) return;

      analysisVersion.current[preset.tab] += 1;

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
  const insight = aiInsights[activeTab];
  const analyze = () => handleAnalyze(activeTab);
  const sendMessage = (message: string, history: AIChatMessage[]) =>
    handleSendMessage(activeTab, message, history);

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
      <TabRail tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

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
                onSendMessage={sendMessage}
              />
            ) : null}

            {activeTab === "debt" ? (
              <DebtTab
                state={debtState}
                onChange={updateDebt}
                aiStatus={status}
                insight={insight}
                onAnalyze={analyze}
                onSendMessage={sendMessage}
              />
            ) : null}

            {activeTab === "investment" ? (
              <InvestmentTab
                state={investmentState}
                onChange={updateInvestment}
                aiStatus={status}
                insight={insight}
                onAnalyze={analyze}
                onSendMessage={sendMessage}
              />
            ) : null}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
