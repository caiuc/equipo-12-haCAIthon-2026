import { roundClp } from "./money";
import type {
  InvestmentPlanInput,
  InvestmentPlanResult,
  InvestmentScenarioParams,
  InvestmentScenarioResult,
  InvestmentTimelineEntry,
} from "./types";
import { assertFiniteNumber } from "./validation";

export const DEFAULT_INVESTMENT_SCENARIOS = [0, 5, 9] as const;

const MIN_HORIZON_YEARS = 1;
const MAX_HORIZON_YEARS = 40;

export class InvestmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvestmentValidationError";
  }
}

function validateMonthlyNetIncome(monthlyNetIncome: number): void {
  assertFiniteNumber(
    monthlyNetIncome,
    "monthlyNetIncome",
    InvestmentValidationError,
  );

  if (monthlyNetIncome <= 0) {
    throw new InvestmentValidationError(
      "monthlyNetIncome must be greater than 0",
    );
  }
}

function validateInvestmentAllocationPercent(
  investmentAllocationPercent: number,
): void {
  assertFiniteNumber(
    investmentAllocationPercent,
    "investmentAllocationPercent",
    InvestmentValidationError,
  );

  if (
    investmentAllocationPercent <= 0 ||
    investmentAllocationPercent > 100
  ) {
    throw new InvestmentValidationError(
      "investmentAllocationPercent must be greater than 0 and at most 100",
    );
  }
}

function validateNonNegativeAmount(value: number, fieldName: string): void {
  assertFiniteNumber(value, fieldName, InvestmentValidationError);

  if (value < 0) {
    throw new InvestmentValidationError(
      `${fieldName} must be greater than or equal to 0`,
    );
  }
}

function validateHorizonYears(horizonYears: number): void {
  assertFiniteNumber(horizonYears, "horizonYears", InvestmentValidationError);

  if (
    !Number.isInteger(horizonYears) ||
    horizonYears < MIN_HORIZON_YEARS ||
    horizonYears > MAX_HORIZON_YEARS
  ) {
    throw new InvestmentValidationError(
      `horizonYears must be an integer between ${MIN_HORIZON_YEARS} and ${MAX_HORIZON_YEARS}`,
    );
  }
}

function validateAnnualRatePercent(annualRatePercent: number): void {
  assertFiniteNumber(
    annualRatePercent,
    "annualRatePercent",
    InvestmentValidationError,
  );

  // An effective annual rate of -100% or less has no real monthly equivalent.
  if (annualRatePercent <= -100) {
    throw new InvestmentValidationError(
      "annualRatePercent must be greater than -100",
    );
  }
}

function toTimelineEntry(
  month: number,
  contributedCapital: number,
  totalValue: number,
): InvestmentTimelineEntry {
  const roundedContributedCapital = roundClp(contributedCapital);
  const roundedTotalValue = roundClp(totalValue);

  return {
    month,
    contributedCapital: roundedContributedCapital,
    investmentReturns: roundedTotalValue - roundedContributedCapital,
    totalValue: roundedTotalValue,
  };
}

function deriveMonthlyContribution(
  monthlyNetIncome: number,
  investmentAllocationPercent: number,
): number {
  validateMonthlyNetIncome(monthlyNetIncome);
  validateInvestmentAllocationPercent(investmentAllocationPercent);

  const monthlyContribution =
    monthlyNetIncome * (investmentAllocationPercent / 100);

  if (!Number.isFinite(monthlyContribution)) {
    throw new InvestmentValidationError(
      "monthlyNetIncome and investmentAllocationPercent produce a non-finite monthly contribution",
    );
  }

  return monthlyContribution;
}

/** Derives the end-of-month contribution from income and allocation percentage. */
export function calculateMonthlyContribution(
  monthlyNetIncome: number,
  investmentAllocationPercent: number,
): number {
  return roundClp(
    deriveMonthlyContribution(
      monthlyNetIncome,
      investmentAllocationPercent,
    ),
  );
}

/** Converts an effective annual rate to its equivalent effective monthly rate. */
export function annualRateToMonthlyRate(
  annualRatePercent: number,
): number {
  validateAnnualRatePercent(annualRatePercent);

  if (annualRatePercent === 0) {
    return 0;
  }

  const annualRateDecimal = annualRatePercent / 100;
  return Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
}

export function simulateInvestmentScenario(
  params: InvestmentScenarioParams,
): InvestmentScenarioResult {
  const {
    initialCapital,
    monthlyContribution,
    horizonYears,
    annualRatePercent,
  } = params;

  validateNonNegativeAmount(initialCapital, "initialCapital");
  validateNonNegativeAmount(monthlyContribution, "monthlyContribution");
  validateHorizonYears(horizonYears);
  validateAnnualRatePercent(annualRatePercent);

  const months = horizonYears * 12;
  const monthlyRateDecimal = annualRateToMonthlyRate(annualRatePercent);
  const timeline: InvestmentTimelineEntry[] = [
    toTimelineEntry(0, initialCapital, initialCapital),
  ];
  let balance = initialCapital;

  for (let month = 1; month <= months; month += 1) {
    // Contributions are made at the end of each month, so the existing balance
    // earns returns before the new monthly contribution is added.
    balance = balance * (1 + monthlyRateDecimal) + monthlyContribution;

    // Deriving this value from the inputs avoids accumulating rounding error in
    // the contribution ledger. At 0%, it also preserves the exact benchmark.
    const contributedCapital = initialCapital + monthlyContribution * month;
    if (monthlyRateDecimal === 0) {
      balance = contributedCapital;
    }

    if (!Number.isFinite(balance)) {
      throw new InvestmentValidationError(
        "the investment scenario produces a non-finite balance",
      );
    }

    timeline.push(toTimelineEntry(month, contributedCapital, balance));
  }

  const finalTimelineEntry = timeline[timeline.length - 1];
  const finalValue = finalTimelineEntry.totalValue;
  const totalContributions = finalTimelineEntry.contributedCapital;
  const totalReturns = finalValue - totalContributions;
  const contributionSharePercent =
    finalValue === 0 ? 0 : (totalContributions / finalValue) * 100;
  const returnsSharePercent =
    finalValue === 0 ? 0 : (totalReturns / finalValue) * 100;

  return {
    annualRatePercent,
    monthlyRateDecimal,
    initialCapital: roundClp(initialCapital),
    monthlyContribution: roundClp(monthlyContribution),
    horizonYears,
    months,
    totalContributions,
    totalReturns,
    finalValue,
    contributionSharePercent,
    returnsSharePercent,
    timeline,
  };
}

export function calculateInvestmentPlan(
  input: InvestmentPlanInput,
): InvestmentPlanResult {
  const {
    monthlyNetIncome,
    investmentAllocationPercent,
    initialCapital = 0,
    horizonYears,
  } = input;

  validateMonthlyNetIncome(monthlyNetIncome);
  validateInvestmentAllocationPercent(investmentAllocationPercent);
  validateNonNegativeAmount(initialCapital, "initialCapital");
  validateHorizonYears(horizonYears);

  // Keep the unrounded derived contribution for the simulation. Monetary values
  // are rounded only when they cross the module's public output boundary.
  const preciseMonthlyContribution = deriveMonthlyContribution(
    monthlyNetIncome,
    investmentAllocationPercent,
  );

  const scenarios = DEFAULT_INVESTMENT_SCENARIOS.map((annualRatePercent) =>
    simulateInvestmentScenario({
      initialCapital,
      monthlyContribution: preciseMonthlyContribution,
      horizonYears,
      annualRatePercent,
    }),
  );
  const [zeroPercent, fivePercent, ninePercent] = scenarios;

  return {
    monthlyNetIncome: roundClp(monthlyNetIncome),
    investmentAllocationPercent,
    monthlyContribution: roundClp(preciseMonthlyContribution),
    initialCapital: roundClp(initialCapital),
    horizonYears,
    months: horizonYears * 12,
    scenarios,
    comparison: {
      fiveVsZeroGain: fivePercent.finalValue - zeroPercent.finalValue,
      nineVsZeroGain: ninePercent.finalValue - zeroPercent.finalValue,
      nineVsFiveGain: ninePercent.finalValue - fivePercent.finalValue,
    },
  };
}
