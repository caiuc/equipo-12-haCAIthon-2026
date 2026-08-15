"use client";

import { useMemo } from "react";

import { AISection } from "@/components/AISection";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ChartViewer } from "@/components/ui/ChartViewer";
import { MetricCard, MetricPanel } from "@/components/ui/MetricCard";
import { NumberField } from "@/components/ui/NumberField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Slider } from "@/components/ui/Slider";
import { buildInvestmentView, investmentSeries } from "@/lib/calculators";
import { formatCLP, formatCompactCLP, formatYears } from "@/lib/format";
import type { AIChatMessage, AIInsight, AIStatus, InvestmentState, ReturnProfile } from "@/lib/types";

interface InvestmentTabProps {
  state: InvestmentState;
  onChange: (patch: Partial<InvestmentState>) => void;
  aiStatus: AIStatus;
  insight: AIInsight;
  onAnalyze: () => void;
  onSendMessage: (message: string, history: AIChatMessage[]) => Promise<string>;
}

const RETURN_PROFILES = [
  { value: 0 as ReturnProfile, label: "0%", hint: "Sin rendimiento" },
  { value: 5 as ReturnProfile, label: "5%", hint: "Conservador" },
  { value: 9 as ReturnProfile, label: "9%", hint: "Moderado" },
];

export function InvestmentTab({
  state,
  onChange,
  aiStatus,
  insight,
  onAnalyze,
  onSendMessage,
}: InvestmentTabProps) {
  // The engine returns all three return profiles at once; the toggle picks the
  // one on screen and the 0% run stays as the benchmark behind the hints.
  const view = useMemo(() => buildInvestmentView(state), [state]);

  return (
    <CalculatorLayout
      title="Inversión"
      description="Proyecta lo que podrías acumular ahorrando un monto fijo cada mes."
      controls={
        <>
          {/*
           * The engine derives the contribution from these two, so they are the
           * inputs — the resulting amount is shown as a result, not typed in.
           */}
          <div>
            <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink">
              Aporte Mensual
            </p>
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2.5">
              <NumberField
                label="Ingreso líquido"
                value={state.monthlyNetIncome}
                min={0}
                step={10_000}
                prefix="$"
                onChange={(monthlyNetIncome) => onChange({ monthlyNetIncome })}
              />
              <NumberField
                label="A invertir"
                value={state.investmentAllocationPercent}
                min={0}
                max={100}
                step={1}
                suffix="%"
                onChange={(investmentAllocationPercent) =>
                  onChange({ investmentAllocationPercent })
                }
              />
            </div>
            <p className="mt-1.5 text-xs leading-snug text-ink-muted">
              El porcentaje de tu ingreso que apartas cada mes.
            </p>
          </div>

          <Slider
            label="Horizonte"
            value={state.years}
            min={1}
            max={40}
            step={1}
            onChange={(years) => onChange({ years })}
            formatValue={formatYears}
          />

          <SegmentedControl
            label="Perfil de Rendimiento"
            options={RETURN_PROFILES}
            value={state.returnProfile}
            onChange={(returnProfile) => onChange({ returnProfile })}
          />
        </>
      }
      chart={
        <ChartViewer
          data={view.chartData}
          series={investmentSeries}
          xKey="year"
          xLabel="Año"
          formatX={(value) => String(value)}
          formatValue={formatCLP}
          formatTick={formatCompactCLP}
          title="Aportes y saldo proyectado"
          subtitle={view.chartSubtitle}
          notice={view.chartNotice}
        />
      }
      metrics={
        <MetricPanel title="Resultado">
          {view.metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
            />
          ))}
        </MetricPanel>
      }
      aiSection={
        <AISection
          status={aiStatus}
          insight={insight}
          onAnalyze={onAnalyze}
          onSendMessage={onSendMessage}
        />
      }
    />
  );
}
