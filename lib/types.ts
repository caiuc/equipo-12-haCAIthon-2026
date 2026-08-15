export type ActiveTab = "credit" | "debt" | "investment";

export type PaymentMode = "minimum" | "accelerated";
export type DebtStrategy = "snowball" | "avalanche";
export type ReturnProfile = 0 | 5 | 9;

/** Lifecycle of the (not yet wired) Gemini call. */
export type AIStatus = "idle" | "loading" | "success" | "fallback";

export interface CreditState {
  debt: number;
  monthlyRate: number;
  paymentMode: PaymentMode;
  acceleratedPayment: number;
}

export interface DebtState {
  income: number;
  totalDebt: number;
  paymentCapacity: number;
  strategy: DebtStrategy;
}

export interface InvestmentState {
  monthlySavings: number;
  years: number;
  returnProfile: ReturnProfile;
}

/** A row of chart data: one x value plus one numeric field per series. */
export type ChartPoint = Record<string, number>;

export interface ChartSeries {
  /** Key of this series inside each ChartPoint. */
  key: string;
  label: string;
  color: string;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  hint?: string;
}

export interface RoadmapStep {
  title: string;
  detail: string;
}

/** Shape the Gemini response is expected to be adapted into. */
export interface AIInsight {
  diagnosis: string;
  roadmap: RoadmapStep[];
}

export interface AIChatMessage {
  role: "user" | "assistant";
  text: string;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  tab: ActiveTab;
  credit?: Partial<CreditState>;
  debt?: Partial<DebtState>;
  investment?: Partial<InvestmentState>;
}
