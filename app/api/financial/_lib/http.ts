import { NextResponse } from "next/server";

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiErrorBody {
  error: {
    code: "INVALID_REQUEST" | "INTERNAL_ERROR";
    message: string;
  };
}

export class ApiRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function readJsonObject(
  request: Request,
): Promise<Record<string, unknown>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ApiRequestError("El cuerpo debe contener JSON valido.");
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiRequestError("El cuerpo JSON debe ser un objeto.");
  }

  return body as Record<string, unknown>;
}

export function requireFiniteNumber(
  body: Record<string, unknown>,
  fieldName: string,
): number {
  const value = body[fieldName];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiRequestError(`${fieldName} debe ser un numero finito.`);
  }

  return value;
}

export function success<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ data });
}

function isDomainValidationError(error: unknown): error is Error {
  return (
    error instanceof ApiRequestError ||
    error instanceof TypeError ||
    error instanceof RangeError ||
    (error instanceof Error && error.name === "InvestmentValidationError")
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (isDomainValidationError(error)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_REQUEST",
          message: error.message,
        },
      },
      { status: 400 },
    );
  }

  console.error("Unexpected financial API error", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "No fue posible procesar la simulacion financiera.",
      },
    },
    { status: 500 },
  );
}
