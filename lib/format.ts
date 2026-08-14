/**
 * Display formatting only.
 *
 * Grouping is done by hand rather than through Intl so the server and the
 * browser always produce the same string — a locale that resolves differently
 * in Node than in the client would cause a hydration mismatch.
 */

/** 500000 -> "$500.000" (Chilean peso convention: "." groups, no decimals). */
export function formatCLP(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${groupThousands(Math.abs(rounded))}`;
}

/** 500000 -> "500.000" */
export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}${groupThousands(Math.abs(rounded))}`;
}

/** 1200000 -> "$1,2M" — for axis ticks, where full numbers do not fit. */
export function formatCompactCLP(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${trimZero(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trimZero(abs / 1_000)}k`;
  return `${sign}$${Math.round(abs)}`;
}

/** 2.8 -> "2,8%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

export function formatMonths(value: number): string {
  return `${value} ${value === 1 ? "mes" : "meses"}`;
}

export function formatYears(value: number): string {
  return `${value} ${value === 1 ? "año" : "años"}`;
}

function groupThousands(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function trimZero(value: number): string {
  const fixed = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return fixed.replace(/\.0$/, "").replace(".", ",");
}
