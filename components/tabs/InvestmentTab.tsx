"use client";

import { AISection } from "@/components/AISection";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ChartViewer } from "@/components/ui/ChartViewer";
import { MetricCard, MetricPanel } from "@/components/ui/MetricCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Slider } from "@/components/ui/Slider";
import {
  buildInvestmentChartData,
  buildInvestmentMetrics,
  investmentSeries,
} from "@/lib/mockData";
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
  // Swap these two lines for the real engine output; nothing below changes.
  const chartData = buildInvestmentChartData(state);
  const metrics = buildInvestmentMetrics(state);

  return (
    <CalculatorLayout
      title="Inversión"
      description="Proyecta lo que podrías acumular ahorrando un monto fijo cada mes."
      controls={
        <>
          <Slider
            label="Ahorro Mensual"
            value={state.monthlySavings}
            min={10_000}
            max={300_000}
            step={5_000}
            onChange={(monthlySavings) => onChange({ monthlySavings })}
            formatValue={formatCLP}
          />

          <Slider
            label="Horizonte"
            value={state.years}
            min={1}
            max={10}
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
          data={chartData}
          series={investmentSeries}
          xKey="year"
          xLabel="Año"
          formatX={(value) => String(value)}
          formatValue={formatCLP}
          formatTick={formatCompactCLP}
          title="Aportes y saldo proyectado"
          subtitle="Valores de ejemplo mientras se conecta el motor de cálculo."
        />
      }
      metrics={
        <MetricPanel title="Resultado">
          {metrics.map((metric) => (
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
