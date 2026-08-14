import type { Config } from "tailwindcss";

// Design tokens for FinPath AI.
// The two `series` hues are mirrored in lib/theme.ts because Recharts needs
// real color strings in JS. Keep the two files in sync.
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#f4f6fa",
        surface: "#ffffff",
        "surface-muted": "#f7f9fc",
        line: "#e3e8f0",
        grid: "#eceff5",
        ink: "#0f2033",
        "ink-secondary": "#4a5a6e",
        "ink-muted": "#5f6d81",
        accent: "#2a78d6",
        "accent-strong": "#1c5cab",
        "accent-soft": "#e8f1fd",
        series1: "#2a78d6",
        series2: "#eb6834",
        good: "#0ca30c",
        warning: "#fab219",
        critical: "#d03b3b",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 32, 51, 0.05), 0 1px 8px rgba(15, 32, 51, 0.04)",
        raised: "0 4px 16px rgba(15, 32, 51, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
