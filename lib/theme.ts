/**
 * Colors Recharts needs as real strings (SVG attributes cannot read Tailwind
 * classes). These mirror the `series*` / chrome tokens in tailwind.config.ts —
 * change both together.
 *
 * The categorical pair was validated for colorblind separation against a white
 * chart surface: worst-pair ΔE 24.7 under protanopia, 33.6 normal vision.
 */
export const chartColors = {
  series1: "#2a78d6",
  series2: "#eb6834",
} as const;

export const chartChrome = {
  surface: "#ffffff",
  grid: "#eceff5",
  axis: "#c9d2e0",
  axisText: "#5f6d81",
  ink: "#0f2033",
} as const;
