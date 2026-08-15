import { addClp, normalizeClp, normalizePositiveClp } from "./money";
import type {
  CreditComparison,
  CreditMonth,
  CreditSimulationInput,
  CreditSimulationResult,
} from "./types";
import { assertFiniteNumber } from "./validation";

/* Maximum number of months to simulate */
export const MAX_MONTHS = 600;

const MINIMUM_PRINCIPAL_RATE = 0.05;

function calculateInterest(balance: number, monthlyRate: number): number {
  return normalizeClp(balance * monthlyRate, "monthly interest");
}

function validateMonthlyRate(monthlyRate: number): void {
  assertFiniteNumber(monthlyRate, "monthlyRate");

  if (monthlyRate < 0) {
    throw new RangeError("monthlyRate must be greater than or equal to zero.");
  }
}

/**
 * Estimates an educational minimum payment for the MVP. It is not a bank's
 * actual minimum payment. Monetary components are rounded to whole CLP.
 */
export function calculateEstimatedMinimumPayment(
  balance: number,
  monthlyRate: number,
): number {
  const normalizedBalance = normalizePositiveClp(balance, "balance");
  validateMonthlyRate(monthlyRate);

  const interest = calculateInterest(normalizedBalance, monthlyRate);
  // At whole-peso precision, a positive residual balance must still amortize.
  const principalPayment = Math.min(
    normalizedBalance,
    Math.max(
      1,
      normalizeClp(
        normalizedBalance * MINIMUM_PRINCIPAL_RATE,
        "minimum principal payment",
      ),
    ),
  );
  const totalDebt = addClp(
    normalizedBalance,
    interest,
    "balance including interest",
  );
  const estimatedPayment = addClp(
    interest,
    principalPayment,
    "estimated minimum payment",
  );

  return Math.min(totalDebt, estimatedPayment);
}

function validateInput(input: CreditSimulationInput): {
  balance: number;
  monthlyPayment?: number;
} {
  const balance = normalizePositiveClp(input.balance, "balance");
  validateMonthlyRate(input.monthlyRate);

  if (input.paymentMode !== "minimum" && input.paymentMode !== "accelerated") {
    throw new TypeError(
      'paymentMode must be either "minimum" or "accelerated".',
    );
  }

  if (input.paymentMode === "accelerated") {
    if (input.monthlyPayment === undefined) {
      throw new TypeError(
        "monthlyPayment is required for accelerated payments.",
      );
    }

    return {
      balance,
      monthlyPayment: normalizePositiveClp(
        input.monthlyPayment,
        "monthlyPayment",
      ),
    };
  }

  return { balance };
}

export function simulateCredit(
  input: CreditSimulationInput,
): CreditSimulationResult {
  const validatedInput = validateInput(input);
  const initialBalance = validatedInput.balance;
  const timeline: CreditMonth[] = [];

  let currentBalance = initialBalance;
  let totalInterest = 0;
  let totalPaid = 0;

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    const startingBalance = currentBalance;
    const interest = calculateInterest(startingBalance, input.monthlyRate);
    const balanceIncludingInterest = addClp(
      startingBalance,
      interest,
      "balance including interest",
    );
    const scheduledPayment =
      input.paymentMode === "minimum"
        ? calculateEstimatedMinimumPayment(startingBalance, input.monthlyRate)
        : validatedInput.monthlyPayment!;
    const payment = Math.min(scheduledPayment, balanceIncludingInterest);
    const principalPaid = payment - interest;
    const endingBalance = Math.max(0, balanceIncludingInterest - payment);

    totalInterest = addClp(totalInterest, interest, "totalInterest");
    totalPaid = addClp(totalPaid, payment, "totalPaid");
    timeline.push({
      month,
      startingBalance,
      interest,
      payment,
      principalPaid,
      endingBalance,
    });
    currentBalance = endingBalance;

    if (endingBalance === 0) {
      return {
        initialBalance,
        totalInterest,
        totalPaid,
        remainingBalance: 0,
        paidOff: true,
        payoffMonth: month,
        status: "paid_off",
        timeline,
      };
    }

    if (input.paymentMode === "accelerated" && principalPaid <= 0) {
      return {
        initialBalance,
        totalInterest,
        totalPaid,
        remainingBalance: currentBalance,
        paidOff: false,
        payoffMonth: null,
        status: "not_amortizing",
        timeline,
      };
    }
  }

  return {
    initialBalance,
    totalInterest,
    totalPaid,
    remainingBalance: currentBalance,
    paidOff: false,
    payoffMonth: null,
    status: "max_months_reached",
    timeline,
  };
}

/** Runs the estimated-minimum and accelerated scenarios with the same credit. */
export function compareCreditStrategies(
  balance: number,
  monthlyRate: number,
  acceleratedMonthlyPayment: number,
): CreditComparison {
  return {
    minimum: simulateCredit({
      balance,
      monthlyRate,
      paymentMode: "minimum",
    }),
    accelerated: simulateCredit({
      balance,
      monthlyRate,
      paymentMode: "accelerated",
      monthlyPayment: acceleratedMonthlyPayment,
    }),
  };
}
