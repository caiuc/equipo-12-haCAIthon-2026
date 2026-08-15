import { compareCreditStrategies } from "./financial/credit";
import { calculateDebtPlan as runDebtPlan } from "./financial/debt";
import { calculateInvestmentPlan as runInvestmentPlan } from "./financial/investment";
import type {
  CreditSimulationResult,
  DebtPlanInput,
  DebtPlanResult,
  InvestmentPlanInput,
  InvestmentPlanResult,
} from "./financial/types";
import { assertFiniteNumber } from "./financial/validation";

export type {
  DebtPlanInput,
  DebtPlanResult,
  InvestmentPlanInput,
  InvestmentPlanResult,
} from "./financial/types";

export interface CreditEngineInput {
  balance: number;
  monthlyInterestRatePercent: number;
  acceleratedMonthlyPayment: number;
}

export interface CreditEngineResult {
  monthlyInterestRatePercent: number;
  minimum: CreditSimulationResult;
  accelerated: CreditSimulationResult;
  comparison: {
    interestDifference: number | null;
    monthsDifference: number | null;
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Compares the educational minimum payment with an accelerated payment. */
export function calculateCreditPlan(
  input: CreditEngineInput,
): CreditEngineResult {
  if (!isObject(input)) {
    throw new TypeError("input must be an object.");
  }

  assertFiniteNumber(
    input.monthlyInterestRatePercent,
    "monthlyInterestRatePercent",
  );

  const result = compareCreditStrategies(
    input.balance,
    input.monthlyInterestRatePercent / 100,
    input.acceleratedMonthlyPayment,
  );
  const bothPaidOff = result.minimum.paidOff && result.accelerated.paidOff;

  return {
    monthlyInterestRatePercent: input.monthlyInterestRatePercent,
    ...result,
    comparison: {
      interestDifference: bothPaidOff
        ? result.minimum.totalInterest - result.accelerated.totalInterest
        : null,
      monthsDifference: bothPaidOff
        ? result.minimum.payoffMonth! - result.accelerated.payoffMonth!
        : null,
    },
  };
}

/** Compares Snowball and Avalanche using the supplied debts. */
export function calculateDebtPlan(input: DebtPlanInput): DebtPlanResult {
  return runDebtPlan(input);
}

/** Projects the educational annual-return scenarios of 0%, 5%, and 9%. */
export function calculateInvestmentPlan(
  input: InvestmentPlanInput,
): InvestmentPlanResult {
  return runInvestmentPlan(input);
}
