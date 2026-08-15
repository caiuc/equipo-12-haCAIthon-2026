// Public contracts shared by the financial engines and UI.

export type CreditPaymentMode = "minimum" | "accelerated";

export interface CreditSimulationInput {
  balance: number;
  monthlyRate: number;
  paymentMode: CreditPaymentMode;
  monthlyPayment?: number;
}

export interface CreditMonth {
  month: number;
  startingBalance: number;
  interest: number;
  payment: number;
  principalPaid: number;
  endingBalance: number;
}

export type CreditSimulationStatus =
  | "paid_off"
  | "not_amortizing"
  | "max_months_reached";

export interface CreditSimulationResult {
  initialBalance: number;
  totalInterest: number;
  totalPaid: number;
  remainingBalance: number;
  paidOff: boolean;
  payoffMonth: number | null;
  status: CreditSimulationStatus;
  timeline: CreditMonth[];
}

export interface CreditComparison {
  minimum: CreditSimulationResult;
  accelerated: CreditSimulationResult;
}

export type DebtStrategy = "snowball" | "avalanche";

export type DebtStrategyStatus =
  | "success"
  | "insufficient_budget"
  | "not_payable";

export interface Debt {
  id: string;
  name: string;
  balance: number;
  monthlyInterestRate: number;
  minimumPayment: number;
}

export interface DebtPlanInput {
  monthlyNetIncome: number;
  debtAllocationPercent: number;
  debts: readonly Debt[];
}

export interface DebtTimelineBalance {
  id: string;
  name: string;
  remainingBalance: number;
}

export interface DebtTimelineEntry {
  month: number;
  totalRemainingDebt: number;
  totalInterestPaid: number;
  debts: DebtTimelineBalance[];
}

export interface DebtPayoffEvent {
  debtId: string;
  debtName: string;
  payoffMonth: number;
}

export interface DebtStrategyResult {
  strategy: DebtStrategy;
  status: DebtStrategyStatus;
  monthsToDebtFree: number | null;
  initialDebt: number;
  totalPaid: number;
  totalInterest: number;
  monthlyPaymentCapacity: number;
  requiredMinimumPayments: number;
  monthlyShortfall: number;
  payoffOrder: DebtPayoffEvent[];
  timeline: DebtTimelineEntry[];
}

export interface DebtPlanComparison {
  interestDifference: number | null;
  monthsDifference: number | null;
  lowerInterestStrategy: DebtStrategy | "tie" | null;
  fasterStrategy: DebtStrategy | "tie" | null;
}

export interface DebtPlanResult {
  monthlyNetIncome: number;
  debtAllocationPercent: number;
  monthlyPaymentCapacity: number;
  totalInitialDebt: number;
  snowball: DebtStrategyResult;
  avalanche: DebtStrategyResult;
  comparison: DebtPlanComparison;
}

export interface InvestmentPlanInput {
  monthlyNetIncome: number;
  investmentAllocationPercent: number;
  initialCapital?: number;
  horizonYears: number;
}

export interface InvestmentTimelineEntry {
  month: number;
  contributedCapital: number;
  investmentReturns: number;
  totalValue: number;
}

export interface InvestmentScenarioParams {
  initialCapital: number;
  monthlyContribution: number;
  horizonYears: number;
  annualRatePercent: number;
}

export interface InvestmentScenarioResult {
  annualRatePercent: number;
  monthlyRateDecimal: number;
  initialCapital: number;
  monthlyContribution: number;
  horizonYears: number;
  months: number;
  totalContributions: number;
  totalReturns: number;
  finalValue: number;
  contributionSharePercent: number;
  returnsSharePercent: number;
  timeline: InvestmentTimelineEntry[];
}

export interface InvestmentPlanComparison {
  fiveVsZeroGain: number;
  nineVsZeroGain: number;
  nineVsFiveGain: number;
}

export interface InvestmentPlanResult {
  monthlyNetIncome: number;
  investmentAllocationPercent: number;
  monthlyContribution: number;
  initialCapital: number;
  horizonYears: number;
  months: number;
  scenarios: InvestmentScenarioResult[];
  comparison: InvestmentPlanComparison;
}
