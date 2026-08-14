import { calculateDebtPlan } from "@/lib/financial/debt";
import type {
  DebtPlanInput,
  DebtPlanResult,
} from "@/lib/financial/types";
import { handleApiError, readJsonObject, success } from "../_lib/http";

export async function POST(request: Request) {
  try {
    const body = await readJsonObject(request);
    const result = calculateDebtPlan(body as unknown as DebtPlanInput);

    return success<DebtPlanResult>(result);
  } catch (error) {
    return handleApiError(error);
  }
}
