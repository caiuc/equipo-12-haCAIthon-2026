import { compareCreditStrategies } from "@/lib/financial/credit";
import type { CreditApiResult } from "@/lib/financial/types";
import {
  handleApiError,
  readJsonObject,
  requireFiniteNumber,
  success,
} from "../_lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const balance = requireFiniteNumber(body, "balance");
    const monthlyInterestRatePercent = requireFiniteNumber(
      body,
      "monthlyInterestRatePercent",
    );
    const acceleratedMonthlyPayment = requireFiniteNumber(
      body,
      "acceleratedMonthlyPayment",
    );

    const result = compareCreditStrategies(
      balance,
      monthlyInterestRatePercent / 100,
      acceleratedMonthlyPayment,
    );
    const bothPaidOff = result.minimum.paidOff && result.accelerated.paidOff;

    return success<CreditApiResult>({
      monthlyInterestRatePercent,
      ...result,
      comparison: {
        interestDifference: bothPaidOff
          ? result.minimum.totalInterest - result.accelerated.totalInterest
          : null,
        monthsDifference: bothPaidOff
          ? result.minimum.payoffMonth! - result.accelerated.payoffMonth!
          : null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
