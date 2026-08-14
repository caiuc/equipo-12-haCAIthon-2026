import { chartColors } from "@/lib/theme";
import { formatCLP, formatMonths } from "@/lib/format";
import type {
  AIInsight,
  ActiveTab,
  ChartPoint,
  ChartSeries,
  CreditState,
  DebtState,
  InvestmentState,
  Metric,
  Preset,
} from "@/lib/types";

/* ------------------------------------------------------------------ *
 * PLACEHOLDER DATA — no financial engine lives here.
 *
 * Every builder below reshapes a canned curve or scales a canned number so
 * the UI reacts while you drag a slider. None of it amortises a balance,
 * applies an interest rate, or compounds anything.
 *
 * To wire up the real thing: replace the bodies of the build* functions with
 * calls into lib/mathEngine.ts. The signatures are already what the tabs
 * consume, so no component needs to change.
 * ------------------------------------------------------------------ */

export const initialCreditState: CreditState = {
  debt: 500_000,
  monthlyRate: 2.8,
  paymentMode: "minimum",
  acceleratedPayment: 50_000,
};

export const initialDebtState: DebtState = {
  income: 650_000,
  totalDebt: 1_200_000,
  paymentCapacity: 80_000,
  strategy: "snowball",
};

export const initialInvestmentState: InvestmentState = {
  monthlySavings: 40_000,
  years: 3,
  returnProfile: 5,
};

/* ---------------------------------- Crédito ---------------------------------- */

export const creditSeries: ChartSeries[] = [
  { key: "balance", label: "Saldo de la tarjeta", color: chartColors.series1 },
];

/** Canned payoff shapes: [month, share of the starting balance still owed]. */
const CREDIT_SHAPE = {
  minimum: [
    [0, 1],
    [6, 0.86],
    [12, 0.68],
    [18, 0.44],
    [24, 0],
  ],
  accelerated: [
    [0, 1],
    [4, 0.63],
    [8, 0.29],
    [12, 0],
  ],
} as const;

export function buildCreditChartData(state: CreditState): ChartPoint[] {
  return CREDIT_SHAPE[state.paymentMode].map(([month, share]) => ({
    month,
    balance: Math.round(state.debt * share),
  }));
}

/** Canned result numbers, scaled so the cards track the slider. */
export function buildCreditMetrics(state: CreditState): Metric[] {
  const scale = state.debt / initialCreditState.debt;
  const isMinimum = state.paymentMode === "minimum";
  const months = isMinimum ? 24 : 12;
  const interest = Math.round((isMinimum ? 120_000 : 58_000) * scale);
  const total = Math.round((isMinimum ? 620_000 : 558_000) * scale);

  return [
    {
      id: "months",
      label: "Tiempo estimado",
      value: formatMonths(months),
      hint: isMinimum ? "Pagando el mínimo" : "Con pago acelerado",
    },
    { id: "interest", label: "Intereses", value: formatCLP(interest), hint: "Costo del crédito" },
    { id: "total", label: "Total pagado", value: formatCLP(total), hint: "Deuda + intereses" },
  ];
}

/* ----------------------------------- Deuda ----------------------------------- */

export const debtSeries: ChartSeries[] = [
  { key: "debt", label: "Deuda pendiente", color: chartColors.series1 },
];

/** Canned payoff shapes per strategy: [progress 0-1, share still owed]. */
const DEBT_SHAPE = {
  snowball: [
    [0, 1],
    [0.25, 0.79],
    [0.5, 0.56],
    [0.75, 0.29],
    [1, 0],
  ],
  avalanche: [
    [0, 1],
    [0.25, 0.83],
    [0.5, 0.59],
    [0.75, 0.28],
    [1, 0],
  ],
} as const;

/** Canned horizon buckets — a lookup table, not a payoff calculation. */
function mockDebtMonths(capacity: number): number {
  if (capacity >= 200_000) return 12;
  if (capacity >= 120_000) return 18;
  if (capacity >= 60_000) return 24;
  return 36;
}

export function buildDebtChartData(state: DebtState): ChartPoint[] {
  const months = mockDebtMonths(state.paymentCapacity);
  return DEBT_SHAPE[state.strategy].map(([progress, share]) => ({
    month: Math.round(months * progress),
    debt: Math.round(state.totalDebt * share),
  }));
}

export function buildDebtMetrics(state: DebtState): Metric[] {
  const months = mockDebtMonths(state.paymentCapacity);
  const shareOfIncome = Math.round((state.paymentCapacity / state.income) * 100);

  return [
    {
      id: "months",
      label: "Meses restantes",
      value: formatMonths(months),
      hint: state.strategy === "snowball" ? "Estrategia bola de nieve" : "Estrategia avalancha",
    },
    {
      id: "payment",
      label: "Pago mensual",
      value: formatCLP(state.paymentCapacity),
      hint: `${shareOfIncome}% de tu ingreso`,
    },
    {
      id: "remaining",
      label: "Deuda restante",
      value: formatCLP(state.totalDebt),
      hint: "Saldo actual",
    },
  ];
}

/* --------------------------------- Inversión --------------------------------- */

export const investmentSeries: ChartSeries[] = [
  { key: "balance", label: "Saldo estimado", color: chartColors.series1 },
  { key: "contributions", label: "Total aportado", color: chartColors.series2 },
];

/**
 * Canned uplift factors indexed by year — a hand-picked lookup table used to
 * separate the two lines on screen. This is not compound interest.
 */
const MOCK_UPLIFT: Record<number, number[]> = {
  0: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  5: [1, 1.04, 1.08, 1.13, 1.18, 1.23, 1.29, 1.35, 1.41, 1.47, 1.54],
  9: [1, 1.07, 1.16, 1.25, 1.35, 1.46, 1.58, 1.71, 1.85, 2.0, 2.17],
};

export function buildInvestmentChartData(state: InvestmentState): ChartPoint[] {
  const uplift = MOCK_UPLIFT[state.returnProfile] ?? MOCK_UPLIFT[0];

  return Array.from({ length: state.years + 1 }, (_, year) => {
    const contributions = state.monthlySavings * 12 * year;
    return {
      year,
      contributions,
      balance: Math.round(contributions * (uplift[year] ?? 1)),
    };
  });
}

export function buildInvestmentMetrics(state: InvestmentState): Metric[] {
  const points = buildInvestmentChartData(state);
  const last = points[points.length - 1];

  return [
    {
      id: "contributed",
      label: "Total aportado",
      value: formatCLP(last.contributions),
      hint: "Lo que sale de tu bolsillo",
    },
    {
      id: "gain",
      label: "Ganancia estimada",
      value: formatCLP(last.balance - last.contributions),
      hint: `Perfil ${state.returnProfile}%`,
    },
    { id: "final", label: "Saldo final", value: formatCLP(last.balance), hint: "Al cierre del horizonte" },
  ];
}

/* --------------------------------- Presets ----------------------------------- */

export const presets: Preset[] = [
  {
    id: "studentCredit",
    label: "Estudiante con Tarjeta",
    description: "Primer crédito, saldo bajo y pago mínimo",
    tab: "credit",
    credit: { debt: 500_000, monthlyRate: 2.8, paymentMode: "minimum", acceleratedPayment: 50_000 },
  },
  {
    id: "overIndebted",
    label: "Endeudado",
    description: "Varias deudas y poca holgura mensual",
    tab: "debt",
    debt: { income: 650_000, totalDebt: 2_400_000, paymentCapacity: 120_000, strategy: "avalanche" },
  },
  {
    id: "firstSaver",
    label: "Primer Ahorrante",
    description: "Empieza a invertir con montos pequeños",
    tab: "investment",
    investment: { monthlySavings: 60_000, years: 5, returnProfile: 5 },
  },
];

/* ------------------------------- AI placeholders ------------------------------ */

/** Stands in for the Gemini response until app/api/gemini is wired up. */
export const mockInsights: Record<ActiveTab, AIInsight> = {
  credit: {
    diagnosis:
      "Tus pagos actuales reducen la deuda lentamente y la mayor parte del esfuerzo se va en intereses. Aumentar el pago mensual podría disminuir el tiempo necesario para pagarla y lo que terminas desembolsando.",
    roadmap: [
      {
        title: "Entiende tus intereses",
        detail: "Revisa cuánto de tu pago mensual va a intereses y cuánto baja el saldo real.",
      },
      {
        title: "Compara distintos pagos",
        detail: "Mueve el pago mensual y observa cómo cambia el tiempo total de la deuda.",
      },
      {
        title: "Define un plan mensual",
        detail: "Elige un monto que puedas sostener todos los meses sin quedarte sin holgura.",
      },
    ],
  },
  debt: {
    diagnosis:
      "Tu capacidad de pago cubre una parte acotada de la deuda total, así que el plazo se estira. Ordenar las deudas con una estrategia clara ayuda a que cada pago rinda más.",
    roadmap: [
      { title: "Ordena tus deudas", detail: "Anota cada deuda con su saldo y su tasa antes de decidir." },
      {
        title: "Elige una estrategia",
        detail: "Bola de nieve motiva con victorias rápidas; avalancha ahorra más intereses.",
      },
      {
        title: "Protege tu holgura",
        detail: "Deja un margen mensual para imprevistos y así evitar tomar deuda nueva.",
      },
    ],
  },
  investment: {
    diagnosis:
      "Aportar de forma constante importa más que el monto inicial. Con tu horizonte actual, la mayor parte del saldo final viene de tus propios aportes más que del rendimiento.",
    roadmap: [
      { title: "Asegura tu colchón", detail: "Antes de invertir, cubre entre 3 y 6 meses de gastos básicos." },
      { title: "Automatiza el aporte", detail: "Programa la transferencia el día que recibes tu ingreso." },
      { title: "Piensa en años, no meses", detail: "Alarga el horizonte antes de buscar un perfil más agresivo." },
    ],
  },
};

/** Shown when the Gemini call fails and the demo falls back to local content. */
export const fallbackInsight: AIInsight = {
  diagnosis:
    "No pudimos generar un análisis personalizado en este momento, así que te mostramos orientación general basada en tu escenario.",
  roadmap: [
    { title: "Revisa tus números", detail: "Confirma el saldo, la tasa y el pago que estás usando." },
    { title: "Prueba un escenario", detail: "Cambia un solo control a la vez para ver su efecto." },
    { title: "Consulta una fuente oficial", detail: "Compara con la información de tu institución financiera." },
  ],
};
