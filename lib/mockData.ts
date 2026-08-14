import type {
  AIInsight,
  ActiveTab,
  CreditState,
  DebtState,
  InvestmentState,
  Preset,
} from "@/lib/types";

/* ------------------------------------------------------------------ *
 * Starting values, scenarios and AI placeholders.
 *
 * The financial math is NOT here: every number the calculators display comes
 * out of lib/mathEngine.ts through the adapters in lib/calculators.ts. What
 * remains in this file is the seed state each tab opens with plus the canned
 * Gemini copy, which is still a placeholder.
 * ------------------------------------------------------------------ */

export const initialCreditState: CreditState = {
  debt: 500_000,
  monthlyRate: 2.8,
  paymentMode: "minimum",
  acceleratedPayment: 50_000,
};

/*
 * Three debts with deliberately different orderings by balance and by rate —
 * the smallest balance is not the most expensive one — so Snowball and
 * Avalanche pay them off in a different order out of the box.
 */
export const initialDebtState: DebtState = {
  income: 650_000,
  paymentCapacity: 80_000,
  strategy: "snowball",
  debts: [
    {
      id: "tarjeta",
      name: "Tarjeta de crédito",
      balance: 450_000,
      monthlyInterestRate: 3.4,
      minimumPayment: 25_000,
    },
    {
      id: "consumo",
      name: "Crédito de consumo",
      balance: 600_000,
      monthlyInterestRate: 1.8,
      minimumPayment: 35_000,
    },
    {
      id: "avance",
      name: "Avance en efectivo",
      balance: 150_000,
      monthlyInterestRate: 2.5,
      minimumPayment: 12_000,
    },
  ],
};

export const initialInvestmentState: InvestmentState = {
  monthlyNetIncome: 500_000,
  investmentAllocationPercent: 8,
  years: 3,
  returnProfile: 5,
};

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
    debt: {
      income: 650_000,
      paymentCapacity: 120_000,
      strategy: "avalanche",
      debts: [
        {
          id: "tarjeta",
          name: "Tarjeta de crédito",
          balance: 1_100_000,
          monthlyInterestRate: 3.8,
          minimumPayment: 55_000,
        },
        {
          id: "consumo",
          name: "Crédito de consumo",
          balance: 1_000_000,
          monthlyInterestRate: 2.1,
          minimumPayment: 45_000,
        },
        {
          id: "retail",
          name: "Tarjeta de retail",
          balance: 300_000,
          monthlyInterestRate: 2.9,
          minimumPayment: 18_000,
        },
      ],
    },
  },
  {
    id: "firstSaver",
    label: "Primer Ahorrante",
    description: "Empieza a invertir con montos pequeños",
    tab: "investment",
    investment: {
      monthlyNetIncome: 600_000,
      investmentAllocationPercent: 10,
      years: 5,
      returnProfile: 5,
    },
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
