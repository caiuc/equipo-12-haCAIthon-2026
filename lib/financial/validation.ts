export type ValidationErrorConstructor = new (message: string) => Error;

/** Ensures calculations never start with NaN or an infinite value. */
export function assertFiniteNumber(
  value: number,
  fieldName: string,
  ErrorType: ValidationErrorConstructor = TypeError,
): void {
  if (!Number.isFinite(value)) {
    throw new ErrorType(`${fieldName} must be a finite number.`);
  }
}
