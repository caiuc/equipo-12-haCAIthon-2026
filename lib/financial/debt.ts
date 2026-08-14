import {
  addClp,
  normalizeClp,
  normalizeNonNegativeClp,
  roundClp,
} from "./money";
import type {
  Debt,
  DebtPayoffEvent,
  DebtPlanComparison,
  DebtPlanInput,
  DebtPlanResult,
  DebtStrategy,
  DebtStrategyResult,
  DebtTimelineEntry,
} from "./types";
import { assertFiniteNumber } from "./validation";

interface NormalizedDebt extends Debt {
  balance: number;
  minimumPayment: number;
}

interface NormalizedDebtPlanInput {
  monthlyNetIncome: number;
  debtAllocationPercent: number;
  monthlyPaymentCapacity: number;
  debts: NormalizedDebt[];
}

type DebtState = NormalizedDebt;

export const MAX_MONTHS = 600;

function compareIds(left: string, right: string): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

export function calculateMonthlyPaymentCapacity(
  monthlyNetIncome: number,
  debtAllocationPercent: number,
): number {
  assertFiniteNumber(monthlyNetIncome, "monthlyNetIncome");
  assertFiniteNumber(debtAllocationPercent, "debtAllocationPercent");

  if (monthlyNetIncome <= 0) {
    throw new RangeError("monthlyNetIncome must be greater than zero.");
  }

  if (debtAllocationPercent <= 0 || debtAllocationPercent > 100) {
    throw new RangeError(
      "debtAllocationPercent must be greater than zero and at most 100.",
    );
  }

  return normalizeClp(
    monthlyNetIncome * (debtAllocationPercent / 100),
    "monthlyPaymentCapacity",
  );
}

export function calculateTotalDebt(debts: readonly Debt[]): number {
  if (!Array.isArray(debts)) {
    throw new TypeError("debts must be an array.");
  }

  return debts.reduce((total, debt, index) => {
    const balance = normalizeNonNegativeClp(
      debt.balance,
      `debts[${index}].balance`,
    );

    return addClp(total, balance, "totalDebt");
  }, 0);
}

function validateAndNormalizeInput(
  input: DebtPlanInput,
): NormalizedDebtPlanInput {
  if (input === null || typeof input !== "object") {
    throw new TypeError("input must be an object.");
  }

  const monthlyPaymentCapacity = calculateMonthlyPaymentCapacity(
    input.monthlyNetIncome,
    input.debtAllocationPercent,
  );
  const monthlyNetIncome = normalizeClp(
    input.monthlyNetIncome,
    "monthlyNetIncome",
  );

  if (monthlyNetIncome <= 0) {
    throw new RangeError(
      "monthlyNetIncome must be at least one CLP after rounding.",
    );
  }

  if (!Array.isArray(input.debts)) {
    throw new TypeError("debts must be an array.");
  }

  const seenIds = new Set<string>();
  const debts = input.debts.map((debt, index): NormalizedDebt => {
    if (debt === null || typeof debt !== "object") {
      throw new TypeError(`debts[${index}] must be an object.`);
    }

    if (typeof debt.id !== "string") {
      throw new TypeError(`debts[${index}].id must be a string.`);
    }

    if (seenIds.has(debt.id)) {
      throw new RangeError(`Duplicate debt id: ${debt.id}.`);
    }
    seenIds.add(debt.id);

    if (typeof debt.name !== "string") {
      throw new TypeError(`debts[${index}].name must be a string.`);
    }

    assertFiniteNumber(
      debt.monthlyInterestRate,
      `debts[${index}].monthlyInterestRate`,
    );
    if (debt.monthlyInterestRate < 0) {
      throw new RangeError(
        `debts[${index}].monthlyInterestRate must be greater than or equal to zero.`,
      );
    }

    return {
      id: debt.id,
      name: debt.name,
      balance: normalizeNonNegativeClp(debt.balance, `debts[${index}].balance`),
      monthlyInterestRate: debt.monthlyInterestRate,
      minimumPayment: normalizeNonNegativeClp(
        debt.minimumPayment,
        `debts[${index}].minimumPayment`,
      ),
    };
  });

  return {
    monthlyNetIncome,
    debtAllocationPercent: input.debtAllocationPercent,
    monthlyPaymentCapacity,
    debts,
  };
}

function totalBalances(debts: readonly DebtState[]): number {
  return debts.reduce(
    (total, debt) => addClp(total, debt.balance, "totalRemainingDebt"),
    0,
  );
}

function createTimelineEntry(
  month: number,
  debts: readonly DebtState[],
  totalInterest: number,
): DebtTimelineEntry {
  return {
    month,
    totalRemainingDebt: totalBalances(debts),
    totalInterestPaid: totalInterest,
    debts: debts.map((debt) => ({
      id: debt.id,
      name: debt.name,
      remainingBalance: debt.balance,
    })),
  };
}

function compareTargets(
  left: DebtState,
  right: DebtState,
  strategy: DebtStrategy,
): number {
  if (strategy === "snowball") {
    return (
      left.balance - right.balance ||
      right.monthlyInterestRate - left.monthlyInterestRate ||
      compareIds(left.id, right.id)
    );
  }

  return (
    right.monthlyInterestRate - left.monthlyInterestRate ||
    left.balance - right.balance ||
    compareIds(left.id, right.id)
  );
}

function selectTarget(
  debts: readonly DebtState[],
  strategy: DebtStrategy,
): DebtState | undefined {
  let target: DebtState | undefined;

  for (const debt of debts) {
    if (
      debt.balance > 0 &&
      (target === undefined || compareTargets(debt, target, strategy) < 0)
    ) {
      target = debt;
    }
  }

  return target;
}

function recordPayoff(
  debt: DebtState,
  month: number,
  payoffOrder: DebtPayoffEvent[],
  paidDebtIds: Set<string>,
): void {
  if (paidDebtIds.has(debt.id)) {
    return;
  }

  debt.balance = 0;
  paidDebtIds.add(debt.id);
  payoffOrder.push({
    debtId: debt.id,
    debtName: debt.name,
    payoffMonth: month,
  });
}

function calculateRequiredMinimumPayments(debts: readonly DebtState[]): number {
  return debts.reduce(
    (total, debt) =>
      addClp(total, debt.minimumPayment, "requiredMinimumPayments"),
    0,
  );
}

function simulateNormalizedDebtStrategy(
  input: NormalizedDebtPlanInput,
  strategy: DebtStrategy,
): DebtStrategyResult {
  const debts: DebtState[] = input.debts
    .filter((debt) => debt.balance > 0)
    .map((debt) => ({ ...debt }));
  const initialDebt = totalBalances(debts);
  const requiredMinimumPayments = calculateRequiredMinimumPayments(debts);
  const monthlyShortfall = Math.max(
    0,
    requiredMinimumPayments - input.monthlyPaymentCapacity,
  );
  const timeline = [createTimelineEntry(0, debts, 0)];

  if (monthlyShortfall > 0) {
    return {
      strategy,
      status: "insufficient_budget",
      monthsToDebtFree: null,
      initialDebt,
      totalPaid: 0,
      totalInterest: 0,
      monthlyPaymentCapacity: input.monthlyPaymentCapacity,
      requiredMinimumPayments,
      monthlyShortfall,
      payoffOrder: [],
      timeline,
    };
  }

  if (debts.length === 0) {
    return {
      strategy,
      status: "success",
      monthsToDebtFree: 0,
      initialDebt: 0,
      totalPaid: 0,
      totalInterest: 0,
      monthlyPaymentCapacity: input.monthlyPaymentCapacity,
      requiredMinimumPayments: 0,
      monthlyShortfall: 0,
      payoffOrder: [],
      timeline,
    };
  }

  let totalPaid = 0;
  let totalInterest = 0;
  const payoffOrder: DebtPayoffEvent[] = [];
  const paidDebtIds = new Set<string>();

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    // Interest is applied before every payment so both strategies use the
    // same monthly accounting model.
    const interestEntries: Array<{
      debt: DebtState;
      interest: number;
      balanceAfterInterest: number;
    }> = [];
    let interestThisMonth = 0;

    for (const debt of debts) {
      if (debt.balance === 0) {
        continue;
      }

      const interest = roundClp(
        debt.balance * (debt.monthlyInterestRate / 100),
      );
      const balanceAfterInterest = roundClp(debt.balance + interest);
      const nextMonthlyInterest = roundClp(interestThisMonth + interest);
      const nextTotalInterest = roundClp(
        totalInterest + nextMonthlyInterest,
      );

      // A finite input can still overflow JavaScript's numeric range after
      // sustained exponential growth. Such a debt is not payable within this
      // simulator; return the explicit financial status instead of throwing.
      if (
        !Number.isSafeInteger(interest) ||
        !Number.isSafeInteger(balanceAfterInterest) ||
        !Number.isSafeInteger(nextMonthlyInterest) ||
        !Number.isSafeInteger(nextTotalInterest)
      ) {
        return {
          strategy,
          status: "not_payable",
          monthsToDebtFree: null,
          initialDebt,
          totalPaid,
          totalInterest,
          monthlyPaymentCapacity: input.monthlyPaymentCapacity,
          requiredMinimumPayments,
          monthlyShortfall: 0,
          payoffOrder,
          timeline,
        };
      }

      interestThisMonth = nextMonthlyInterest;
      interestEntries.push({ debt, interest, balanceAfterInterest });
    }

    for (const entry of interestEntries) {
      entry.debt.balance = entry.balanceAfterInterest;
    }
    totalInterest = addClp(
      totalInterest,
      interestThisMonth,
      "totalInterest",
    );

    let minimumPaymentsMade = 0;
    const paidByMinimum: DebtState[] = [];

    for (const debt of debts) {
      if (debt.balance === 0) {
        continue;
      }

      const payment = Math.min(debt.minimumPayment, debt.balance);
      debt.balance = Math.max(0, debt.balance - payment);
      minimumPaymentsMade = addClp(
        minimumPaymentsMade,
        payment,
        "minimumPaymentsMade",
      );
      totalPaid = addClp(totalPaid, payment, "totalPaid");

      if (debt.balance <= 0) {
        debt.balance = 0;
        paidByMinimum.push(debt);
      }
    }

    // Minimum payments occur in parallel. ID ordering makes simultaneous
    // payoffs deterministic without assigning either strategy an advantage.
    paidByMinimum
      .sort((left, right) => compareIds(left.id, right.id))
      .forEach((debt) => recordPayoff(debt, month, payoffOrder, paidDebtIds));

    let extraMoney = input.monthlyPaymentCapacity - minimumPaymentsMade;

    // Rollover happens immediately: after a payoff, the strategy selects its
    // next target and keeps using the same month's remaining capacity.
    while (extraMoney > 0) {
      const target = selectTarget(debts, strategy);
      if (target === undefined) {
        break;
      }

      const payment = Math.min(extraMoney, target.balance);
      target.balance = Math.max(0, target.balance - payment);
      extraMoney -= payment;
      totalPaid = addClp(totalPaid, payment, "totalPaid");

      if (target.balance <= 0) {
        recordPayoff(target, month, payoffOrder, paidDebtIds);
      }
    }

    timeline.push(createTimelineEntry(month, debts, totalInterest));

    if (debts.every((debt) => debt.balance === 0)) {
      return {
        strategy,
        status: "success",
        monthsToDebtFree: month,
        initialDebt,
        totalPaid,
        totalInterest,
        monthlyPaymentCapacity: input.monthlyPaymentCapacity,
        requiredMinimumPayments,
        monthlyShortfall: 0,
        payoffOrder,
        timeline,
      };
    }
  }

  return {
    strategy,
    status: "not_payable",
    monthsToDebtFree: null,
    initialDebt,
    totalPaid,
    totalInterest,
    monthlyPaymentCapacity: input.monthlyPaymentCapacity,
    requiredMinimumPayments,
    monthlyShortfall: 0,
    payoffOrder,
    timeline,
  };
}

export function simulateDebtStrategy(
  input: DebtPlanInput,
  strategy: DebtStrategy,
): DebtStrategyResult {
  if (strategy !== "snowball" && strategy !== "avalanche") {
    throw new TypeError('strategy must be either "snowball" or "avalanche".');
  }

  return simulateNormalizedDebtStrategy(
    validateAndNormalizeInput(input),
    strategy,
  );
}

function compareSuccessfulStrategies(
  snowball: DebtStrategyResult,
  avalanche: DebtStrategyResult,
): DebtPlanComparison {
  if (snowball.status !== "success" || avalanche.status !== "success") {
    return {
      interestDifference: null,
      monthsDifference: null,
      lowerInterestStrategy: null,
      fasterStrategy: null,
    };
  }

  const snowballMonths = snowball.monthsToDebtFree!;
  const avalancheMonths = avalanche.monthsToDebtFree!;

  return {
    interestDifference: Math.abs(
      snowball.totalInterest - avalanche.totalInterest,
    ),
    monthsDifference: Math.abs(snowballMonths - avalancheMonths),
    lowerInterestStrategy:
      snowball.totalInterest === avalanche.totalInterest
        ? "tie"
        : snowball.totalInterest < avalanche.totalInterest
          ? "snowball"
          : "avalanche",
    fasterStrategy:
      snowballMonths === avalancheMonths
        ? "tie"
        : snowballMonths < avalancheMonths
          ? "snowball"
          : "avalanche",
  };
}

export function calculateDebtPlan(input: DebtPlanInput): DebtPlanResult {
  const normalizedInput = validateAndNormalizeInput(input);
  const snowball = simulateNormalizedDebtStrategy(normalizedInput, "snowball");
  const avalanche = simulateNormalizedDebtStrategy(
    normalizedInput,
    "avalanche",
  );

  return {
    monthlyNetIncome: normalizedInput.monthlyNetIncome,
    debtAllocationPercent: normalizedInput.debtAllocationPercent,
    monthlyPaymentCapacity: normalizedInput.monthlyPaymentCapacity,
    totalInitialDebt: calculateTotalDebt(normalizedInput.debts),
    snowball,
    avalanche,
    comparison: compareSuccessfulStrategies(snowball, avalanche),
  };
}
