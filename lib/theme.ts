/**
 * Colors Recharts needs as real strings (SVG attributes cannot read Tailwind
 * classes). These mirror the `series*` / chrome tokens in tailwind.config.ts —
 * change both together.
 *
 * The categorical pair is the arcade magenta/gold. Validated against the white
 * chart surface: worst-pair ΔE 17.1 under deuteranopia, 10.6 under tritanopia,
 * 25.4 normal vision, and both clear 3:1 contrast.
 */
export const chartColors = {
  series1: "#e0369e",
  series2: "#c98200",
} as const;

export const chartChrome = {
  surface: "#ffffff",
  grid: "#e7e2f2",
  axis: "#241b3b",
  axisText: "#6b6089",
  ink: "#241b3b",
} as const;
