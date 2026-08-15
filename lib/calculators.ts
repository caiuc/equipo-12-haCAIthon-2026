/* ------------------------------------------------------------------ *
 * Engine → UI adapter.
 *
 * Every function here runs the real simulation in lib/mathEngine.ts once and
 * reshapes that single result into the chart points and metric cards the tabs
 * render. Nothing below invents, scales or interpolates a number: if a value
 * appears on screen it came out of the engine.
 *
 * The tabs call one `build*View` per render (memoised on their state), so a
 * calculator never runs its simulation twice to fill two panels.
 * ------------------------------------------------------------------ */

import {
  calculateCreditPlan,
  calculateDebtPlan,
  calculateInvestmentPlan,
} from "@/lib/mathEngine";
import { formatCLP, formatMonths, formatPercent, formatYears } from "@/lib/format";
import { chartColors } from "@/lib/theme";
import type {
  ChartPoint,
  ChartSeries,
  CreditState,
  DebtState,
  InvestmentState,
  Metric,
} from "@/lib/types";

export interface CalculatorView {
  chartData: ChartPoint[];
  metrics: Metric[];
  /** Caption under the chart title, describing what was actually simulated. */
  chartSubtitle: string;
  /**
   * Set when there is no curve to draw — either the inputs were rejected or the
   * scenario never amortises. The tab shows it in place of the plot.
   */
  chartNotice: string | null;
}

/**
 * Points kept per chart. The engine emits one entry per month and a payoff can
 * run past 250 of them; every entry becomes an axis tick and a table row, so
 * the series is thinned down to something a reader can actually scan.
 */
const MAX_CHART_POINTS = 13;

/** Evenly spaced sample that always keeps the first and last entry. */
function sampleEvenly<T>(entries: readonly T[]): T[] {
  if (entries.length <= MAX_CHART_POINTS) {
    return [...entries];
  }

  const step = (entries.length - 1) / (MAX_CHART_POINTS - 1);
  return Array.from(
    { length: MAX_CHART_POINTS },
    (_, index) => entries[Math.round(index * step)],
  );
}

/**
 * The engine throws `TypeError` / `RangeError` with English developer messages.
 * Sliders cannot produce out-of-range values, so this only guards against a
 * future control widening its bounds — the user gets a Spanish sentence rather
 * than a blank tab or a crashed render.
 */
function invalidInputView(chartSubtitle: string): CalculatorView {
  return {
    chartData: [],
    metrics: [
      {
        id: "invalid",
        label: "Sin resultado",
        value: "—",
        hint: "Revisa los valores ingresados: hay un dato fuera del rango que el simulador acepta.",
      },
    ],
    chartSubtitle,
    chartNotice: "No pudimos simular este escenario con los datos actuales.",
  };
}

/** "Más de 50 años" is the honest reading of hitting the 600-month ceiling. */
const BEYOND_HORIZON = "Más de 50 años";

/* ---------------------------------- Crédito ---------------------------------- */

export const creditSeries: ChartSeries[] = [
  { key: "balance", label: "Saldo de la tarjeta", color: chartColors.series1 },
];

export function buildCreditView(state: CreditState): CalculatorView {
  const isMinimum = state.paymentMode === "minimum";
  const chartSubtitle = isMinimum
    ? "Saldo mes a mes pagando sólo el mínimo estimado."
    : "Saldo mes a mes con el pago acelerado que elegiste.";

  let plan;
  try {
    // Both scenarios are simulated on every render even though one is shown:
    // the comparison between them is what the metric hints are made of.
    plan = calculateCreditPlan({
      balance: state.debt,
      monthlyInterestRatePercent: state.monthlyRate,
      acceleratedMonthlyPayment: state.acceleratedPayment,
    });
  } catch {
    return invalidInputView(chartSubtitle);
  }

  const scenario = isMinimum ? plan.minimum : plan.accelerated;

  // The payment that does not cover its own interest: the balance grows every
  // month, so there is no payoff curve to plot.
  if (scenario.status === "not_amortizing") {
    const firstMonth = scenario.timeline[0];
    return {
      chartData: [],
      metrics: [
        {
          id: "months",
          label: "Tiempo estimado",
          value: "No se paga",
          hint: "Tu pago no alcanza a cubrir el interés del mes, así que el saldo sube.",
        },
        {
          id: "interest",
          label: "Interés del mes",
          value: formatCLP(firstMonth.interest),
          hint: "Necesitas pagar más que esto para que el saldo baje.",
        },
        {
          id: "reference",
          label: "Con pago mínimo",
          value: monthsValue(plan.minimum.payoffMonth),
          hint: "Plazo del mínimo estimado, como referencia.",
        },
      ],
      chartSubtitle,
      chartNotice:
        "Con este pago la deuda no baja, así que no hay una curva de pago que mostrar.",
    };
  }

  // Month 0 is the starting balance; the engine's timeline begins at month 1.
  const points: ChartPoint[] = [
    { month: 0, balance: scenario.initialBalance },
    ...scenario.timeline.map((month) => ({
      month: month.month,
      balance: month.endingBalance,
    })),
  ];

  const { interestDifference, monthsDifference } = plan.comparison;
  const showsSavings =
    !isMinimum && interestDifference !== null && monthsDifference !== null;

  return {
    chartData: sampleEvenly(points),
    metrics: [
      {
        id: "months",
        label: "Tiempo estimado",
        value: monthsValue(scenario.payoffMonth),
        hint: showsSavings
          ? `${formatMonths(monthsDifference!)} menos que pagando el mínimo.`
          : isMinimum
            ? "Pagando el mínimo estimado."
            : "Con tu pago acelerado.",
      },
      {
        id: "interest",
        label: "Intereses",
        value: formatCLP(scenario.totalInterest),
        hint: showsSavings
          ? `Ahorras ${formatCLP(interestDifference!)} frente al mínimo.`
          : "Lo que te cuesta el crédito.",
      },
      {
        id: "total",
        label: "Total pagado",
        value: formatCLP(scenario.totalPaid),
        hint: "Deuda + intereses.",
      },
    ],
    chartSubtitle,
    chartNotice: null,
  };
}

function monthsValue(payoffMonth: number | null): string {
  return payoffMonth === null ? BEYOND_HORIZON : formatMonths(payoffMonth);
}

/* ----------------------------------- Deuda ----------------------------------- */

export const debtSeries: ChartSeries[] = [
  { key: "debt", label: "Deuda pendiente", color: chartColors.series1 },
];

const STRATEGY_LABEL = {
  snowball: "bola de nieve",
  avalanche: "avalancha",
} as const;

export function buildDebtView(state: DebtState): CalculatorView {
  const chartSubtitle = `Deuda total pendiente mes a mes, estrategia ${STRATEGY_LABEL[state.strategy]}.`;

  if (state.debts.length === 0) {
    return {
      chartData: [],
      metrics: [
        {
          id: "empty",
          label: "Sin deudas",
          value: "—",
          hint: "Agrega al menos una deuda para comparar las dos estrategias.",
        },
      ],
      chartSubtitle,
      chartNotice: "Agrega una deuda para ver el plan de pago.",
    };
  }

  let plan;
  try {
    plan = calculateDebtPlan({
      monthlyNetIncome: state.income,
      // The engine takes a share of income; the slider collects the pesos that
      // share represents, which is the number a student can actually reason
      // about. Converting here keeps the round trip exact.
      debtAllocationPercent: (state.paymentCapacity / state.income) * 100,
      debts: state.debts,
    });
  } catch {
    return invalidInputView(chartSubtitle);
  }

  const selected = plan[state.strategy];
  const shareOfIncome = Math.round(
    (selected.monthlyPaymentCapacity / plan.monthlyNetIncome) * 100,
  );
  const capacityMetric: Metric = {
    id: "payment",
    label: "Pago mensual",
    value: formatCLP(selected.monthlyPaymentCapacity),
    hint: `${shareOfIncome}% de tu ingreso.`,
  };

  // The budget does not even cover the minimums, so no payment plan exists.
  // The shortfall is the one number worth showing.
  if (selected.status === "insufficient_budget") {
    return {
      chartData: [],
      metrics: [
        {
          id: "shortfall",
          label: "Te faltan",
          value: formatCLP(selected.monthlyShortfall),
          hint: "Cada mes, para cubrir los pagos mínimos de tus deudas.",
        },
        {
          id: "minimums",
          label: "Pagos mínimos",
          value: formatCLP(selected.requiredMinimumPayments),
          hint: "Suma de los mínimos que exigen tus deudas.",
        },
        capacityMetric,
      ],
      chartSubtitle,
      chartNotice:
        "Tu capacidad de pago no cubre los pagos mínimos, así que todavía no hay un plan que proyectar.",
    };
  }

  const chartData = sampleEvenly(selected.timeline).map((entry) => ({
    month: entry.month,
    debt: entry.totalRemainingDebt,
  }));

  if (selected.status === "not_payable") {
    return {
      chartData,
      metrics: [
        {
          id: "months",
          label: "Tiempo estimado",
          value: BEYOND_HORIZON,
          hint: "Con esta capacidad los intereses avanzan casi tan rápido como tus pagos.",
        },
        {
          id: "remaining",
          label: "Deuda total",
          value: formatCLP(selected.initialDebt),
          hint: `${state.debts.length} ${state.debts.length === 1 ? "deuda" : "deudas"} en tu lista.`,
        },
        capacityMetric,
      ],
      chartSubtitle,
      chartNotice: null,
    };
  }

  const otherLabel = STRATEGY_LABEL[
    state.strategy === "snowball" ? "avalanche" : "snowball"
  ];
  const { comparison } = plan;

  return {
    chartData,
    metrics: [
      {
        id: "months",
        label: "Tiempo estimado",
        value: formatMonths(selected.monthsToDebtFree!),
        hint: comparisonHint(
          comparison.fasterStrategy,
          state.strategy,
          comparison.monthsDifference,
          otherLabel,
          formatMonths,
          "menos",
          "más",
          "Mismo plazo que",
        ),
      },
      {
        id: "interest",
        label: "Intereses",
        value: formatCLP(selected.totalInterest),
        hint: comparisonHint(
          comparison.lowerInterestStrategy,
          state.strategy,
          comparison.interestDifference,
          otherLabel,
          formatCLP,
          "menos",
          "más",
          "Mismos intereses que",
        ),
      },
      {
        id: "total",
        label: "Total pagado",
        value: formatCLP(selected.totalPaid),
        hint: "Deuda + intereses.",
      },
      capacityMetric,
    ],
    chartSubtitle,
    chartNotice: null,
  };
}

/**
 * Turns one leg of the engine's Snowball/Avalanche comparison into a sentence
 * about the strategy the user is currently looking at.
 */
function comparisonHint(
  winner: "snowball" | "avalanche" | "tie" | null,
  selected: "snowball" | "avalanche",
  difference: number | null,
  otherLabel: string,
  format: (value: number) => string,
  betterWord: string,
  worseWord: string,
  tiePrefix: string,
): string | undefined {
  if (winner === null || difference === null) {
    return undefined;
  }

  if (winner === "tie") {
    return `${tiePrefix} ${otherLabel}.`;
  }

  const word = winner === selected ? betterWord : worseWord;
  return `${format(difference)} ${word} que ${otherLabel}.`;
}

/* --------------------------------- Inversión --------------------------------- */

export const investmentSeries: ChartSeries[] = [
  { key: "balance", label: "Saldo estimado", color: chartColors.series1 },
  { key: "contributions", label: "Total aportado", color: chartColors.series2 },
];

export function buildInvestmentView(state: InvestmentState): CalculatorView {
  const chartSubtitle = `Aportes y saldo proyectado con un rendimiento anual de ${formatPercent(state.returnProfile, 0)}.`;

  // The engine rejects a zero income or share outright, but here that is just
  // an empty form rather than bad data — say so instead of raising an error.
  if (state.monthlyNetIncome <= 0 || state.investmentAllocationPercent <= 0) {
    return {
      chartData: [],
      metrics: [
        {
          id: "empty",
          label: "Sin aporte",
          value: "—",
          hint: "Ingresa tu ingreso mensual y el porcentaje que destinarás a invertir.",
        },
      ],
      chartSubtitle,
      chartNotice: "Completa tu ingreso y el porcentaje a invertir para ver la proyección.",
    };
  }

  let plan;
  try {
    plan = calculateInvestmentPlan({
      monthlyNetIncome: state.monthlyNetIncome,
      investmentAllocationPercent: state.investmentAllocationPercent,
      horizonYears: state.years,
    });
  } catch {
    return invalidInputView(chartSubtitle);
  }

  const scenario =
    plan.scenarios.find(
      (item) => item.annualRatePercent === state.returnProfile,
    ) ?? plan.scenarios[0];
  const baseline = plan.scenarios[0];

  // The engine works in months; this chart is read by year, so only the year
  // boundaries are plotted, then thinned like the others once the horizon runs
  // long. No value is interpolated — every point is a real timeline entry.
  const chartData = sampleEvenly(
    scenario.timeline.filter((entry) => entry.month % 12 === 0),
  ).map((entry) => ({
    year: entry.month / 12,
    contributions: entry.contributedCapital,
    balance: entry.totalValue,
  }));

  // At 0% the engine pins the balance to the contributions exactly, so the 0%
  // run is the "money under the mattress" benchmark the other two are read
  // against — and the gain over it is, by construction, the returns themselves.
  const earnsReturns = scenario.finalValue > baseline.finalValue;

  return {
    chartData,
    metrics: [
      {
        id: "contribution",
        label: "Aporte mensual",
        value: formatCLP(plan.monthlyContribution),
        // The field steps in whole percent, so a decimal is only ever shown
        // when the user typed one.
        hint: `${formatPercent(
          plan.investmentAllocationPercent,
          Number.isInteger(plan.investmentAllocationPercent) ? 0 : 1,
        )} de tu ingreso.`,
      },
      {
        id: "contributed",
        label: "Total aportado",
        value: formatCLP(scenario.totalContributions),
        hint: "Lo que sale de tu bolsillo.",
      },
      {
        id: "gain",
        label: "Ganancia estimada",
        value: formatCLP(scenario.totalReturns),
        hint: earnsReturns
          ? `El ${Math.round(scenario.returnsSharePercent)}% del saldo final viene del rendimiento, no de tu bolsillo.`
          : "Sin rendimiento, el saldo final es exactamente lo que aportaste.",
      },
      {
        id: "final",
        label: "Saldo final",
        value: formatCLP(scenario.finalValue),
        hint: `Al cierre de ${formatYears(scenario.horizonYears)}.`,
      },
    ],
    chartSubtitle,
    chartNotice: null,
  };
}
