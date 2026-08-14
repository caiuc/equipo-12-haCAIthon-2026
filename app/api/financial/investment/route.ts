import { calculateInvestmentPlan } from "@/lib/financial/investment";
import type {
  InvestmentPlanInput,
  InvestmentPlanResult,
} from "@/lib/financial/types";
import { handleApiError, readJsonObject, success } from "../_lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const result = calculateInvestmentPlan(
      body as unknown as InvestmentPlanInput,
    );

    return success<InvestmentPlanResult>(result);
  } catch (error) {
    return handleApiError(error);
  }
}
