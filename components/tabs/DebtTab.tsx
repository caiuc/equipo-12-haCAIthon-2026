"use client";

import { AISection } from "@/components/AISection";
import { CalculatorLayout, MetricRow } from "@/components/CalculatorLayout";
import { ChartViewer } from "@/components/ui/ChartViewer";
import { MetricCard } from "@/components/ui/MetricCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Slider } from "@/components/ui/Slider";
import { buildDebtChartData, buildDebtMetrics, debtSeries } from "@/lib/mockData";
import { formatCLP, formatCompactCLP } from "@/lib/format";
import type { AIInsight, AIStatus, DebtState, DebtStrategy } from "@/lib/types";

interface DebtTabProps {
  state: DebtState;
  onChange: (patch: Partial<DebtState>) => void;
  aiStatus: AIStatus;
  insight: AIInsight;
  onAnalyze: () => void;
}

const STRATEGIES = [
  { value: "snowball" as DebtStrategy, label: "Bola de Nieve", hint: "Menor saldo primero" },
  { value: "avalanche" as DebtStrategy, label: "Avalancha", hint: "Mayor tasa primero" },
];

export function DebtTab({ state, onChange, aiStatus, insight, onAnalyze }: DebtTabProps) {
  // Swap these two lines for the real engine output; nothing below changes.
  const chartData = buildDebtChartData(state);
  const metrics = buildDebtMetrics(state);

  return (
    <CalculatorLayout
      title="Deuda"
      description="Ordena tus deudas y estima cuánto tardarías en dejarlas atrás."
      controls={
        <>
          <Slider
            label="Ingreso Mensual Líquido"
            value={state.income}
            min={400_000}
            max={2_000_000}
            step={10_000}
            onChange={(income) => onChange({ income })}
            formatValue={formatCLP}
          />

          <Slider
            label="Deuda Total"
            value={state.totalDebt}
            min={200_000}
            max={5_000_000}
            step={10_000}
            onChange={(totalDebt) => onChange({ totalDebt })}
            formatValue={formatCLP}
          />

          <Slider
            label="Capacidad de Pago Mensual"
            value={state.paymentCapacity}
            min={20_000}
            max={300_000}
            step={5_000}
            onChange={(paymentCapacity) => onChange({ paymentCapacity })}
            formatValue={formatCLP}
            hint="Lo que puedes destinar a deuda sin quedarte corto."
          />

          <SegmentedControl
            label="Estrategia"
            options={STRATEGIES}
            value={state.strategy}
            onChange={(strategy) => onChange({ strategy })}
          />
        </>
      }
      chart={
        <ChartViewer
          data={chartData}
          series={debtSeries}
          xKey="month"
          xLabel="Mes"
          formatX={(value) => String(value)}
          formatValue={formatCLP}
          formatTick={formatCompactCLP}
          title="Deuda pendiente en el tiempo"
          subtitle="Valores de ejemplo mientras se conecta el motor de cálculo."
        />
      }
      metrics={
        <MetricRow>
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
            />
          ))}
        </MetricRow>
      }
      aiSection={<AISection status={aiStatus} insight={insight} onAnalyze={onAnalyze} />}
    />
  );
}
