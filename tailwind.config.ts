import type { Config } from "tailwindcss";

// Design tokens for FinPath AI — 8-bit arcade skin.
//
// The palette is the classic four-colour arcade set (magenta / cyan / lime /
// gold) laid over a mint ground, outlined in a near-black indigo. Every hue
// comes in three steps: `soft` for tinted fills, the base for large surfaces,
// and `strong` for anything carrying white text or fine detail.
//
// The two `series` hues are mirrored in lib/theme.ts because Recharts needs
// real color strings in JS. Keep the two files in sync.
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "#78e0d1",
        "page-deep": "#4fcbb9",
        surface: "#ffffff",
        "surface-muted": "#fff6e9",
        // `line` is the outline every pixel frame is drawn with, not a hairline.
        line: "#241b3b",
        grid: "#e7e2f2",
        ink: "#241b3b",
        "ink-secondary": "#4b4168",
        "ink-muted": "#6b6089",

        // Magenta is the primary. `accent` is the brand/chart hue; buttons use
        // `accent-strong`, which is the step that clears 4.5:1 with white text.
        accent: "#e0369e",
        "accent-strong": "#c22986",
        "accent-deep": "#8f1a61",
        "accent-soft": "#ffe3f4",

        cyan: "#2cc0ee",
        "cyan-strong": "#1596c4",
        "cyan-soft": "#ddf4fd",

        lime: "#4bc94b",
        "lime-strong": "#2e9b36",
        "lime-soft": "#dffbdc",

        gold: "#ffc53d",
        "gold-strong": "#c98200",
        "gold-soft": "#fff2cf",

        // Validated categorical pair (magenta / gold): worst adjacent CVD ΔE
        // 17.1 deuteranopia, 10.6 tritanopia, 25.4 normal vision, and both
        // clear 3:1 against the white chart surface.
        series1: "#e0369e",
        series2: "#c98200",

        good: "#2e9b36",
        warning: "#c98200",
        critical: "#d93b4e",
      },
      fontFamily: {
        // Short labels, titles and buttons. Never body prose — the glyphs are
        // one em wide and Spanish sentences fall apart at this size.
        pixel: ["var(--font-pixel)", "monospace"],
        // Numeric readouts, styled after an arcade score display.
        score: ["var(--font-score)", "monospace"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        // Pixel frames are cut with clip-path (see `.px` in globals.css); a
        // real border radius would round the steps back off.
        card: "0px",
      },
      boxShadow: {
        card: "none",
        raised: "4px 4px 0 0 #241b3b",
      },
      keyframes: {
        "px-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
