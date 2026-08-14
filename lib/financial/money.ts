import { assertFiniteNumber } from "./validation";

/** Rounds a monetary amount to whole Chilean pesos. */
export function roundClp(value: number): number {
  return Math.round(value);
}

/**
 * Rounds a monetary amount and guards the integer precision required for CLP
 * accounting.
 */
export function normalizeClp(value: number, fieldName: string): number {
  const roundedValue = roundClp(value);

  if (!Number.isSafeInteger(roundedValue)) {
    throw new RangeError(`${fieldName} is outside the supported CLP range.`);
  }

  return roundedValue;
}

export function normalizeNonNegativeClp(
  value: number,
  fieldName: string,
): number {
  assertFiniteNumber(value, fieldName);

  if (value < 0) {
    throw new RangeError(`${fieldName} must be greater than or equal to zero.`);
  }

  return normalizeClp(value, fieldName);
}

export function normalizePositiveClp(
  value: number,
  fieldName: string,
): number {
  assertFiniteNumber(value, fieldName);

  if (value <= 0) {
    throw new RangeError(`${fieldName} must be greater than zero.`);
  }

  const normalizedValue = normalizeClp(value, fieldName);

  if (normalizedValue <= 0) {
    throw new RangeError(
      `${fieldName} must be at least one CLP after rounding.`,
    );
  }

  return normalizedValue;
}

export function addClp(
  left: number,
  right: number,
  fieldName: string,
): number {
  return normalizeClp(left + right, fieldName);
}
