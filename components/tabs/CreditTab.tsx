"use client";

import { useMemo } from "react";

import { AISection } from "@/components/AISection";
import { CalculatorLayout } from "@/components/CalculatorLayout";
import { ChartViewer } from "@/components/ui/ChartViewer";
import { MetricCard, MetricPanel } from "@/components/ui/MetricCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Slider } from "@/components/ui/Slider";
import { buildCreditView, creditSeries } from "@/lib/calculators";
import { formatCLP, formatCompactCLP, formatPercent } from "@/lib/format";
import type { AIInsight, AIStatus, CreditState, PaymentMode } from "@/lib/types";

interface CreditTabProps {
  state: CreditState;
  onChange: (patch: Partial<CreditState>) => void;
  aiStatus: AIStatus;
  insight: AIInsight;
  onAnalyze: () => void;
}

const PAYMENT_MODES = [
  { value: "minimum" as PaymentMode, label: "Pago Mínimo" },
  { value: "accelerated" as PaymentMode, label: "Pago Acelerado" },
];

export function CreditTab({ state, onChange, aiStatus, insight, onAnalyze }: CreditTabProps) {
  // One amortisation run per state change feeds both the chart and the cards.
  const view = useMemo(() => buildCreditView(state), [state]);

  return (
    <CalculatorLayout
      title="Crédito"
      description="Mira cómo cambia tu deuda de tarjeta según lo que pagas cada mes."
      controls={
        <>
          <Slider
            label="Deuda en la Tarjeta"
            value={state.debt}
            min={100_000}
            max={3_000_000}
            step={10_000}
            onChange={(debt) => onChange({ debt })}
            formatValue={formatCLP}
          />

          <Slider
            label="Tasa de Interés Mensual"
            value={state.monthlyRate}
            min={1.5}
            max={4.5}
            step={0.1}
            onChange={(monthlyRate) => onChange({ monthlyRate })}
            formatValue={(value) => formatPercent(value)}
          />

          <SegmentedControl
            label="Modalidad de Pago"
            options={PAYMENT_MODES}
            value={state.paymentMode}
            onChange={(paymentMode) => onChange({ paymentMode })}
          />

          {state.paymentMode === "accelerated" ? (
            <Slider
              label="Pago Mensual"
              value={state.acceleratedPayment}
              min={20_000}
              max={500_000}
              step={5_000}
              onChange={(acceleratedPayment) => onChange({ acceleratedPayment })}
              formatValue={formatCLP}
              hint="Cuánto abonas por sobre el mínimo exigido."
            />
          ) : null}
        </>
      }
      chart={
        <ChartViewer
          data={view.chartData}
          series={creditSeries}
          xKey="month"
          xLabel="Mes"
          formatX={(value) => String(value)}
          formatValue={formatCLP}
          formatTick={formatCompactCLP}
          title="Saldo de la tarjeta en el tiempo"
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
      aiSection={<AISection status={aiStatus} insight={insight} onAnalyze={onAnalyze} />}
    />
  );
}
