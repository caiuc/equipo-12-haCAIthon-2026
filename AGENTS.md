# Repository Guide

## Current State

- The repository is a Next.js skeleton with npm scripts in `package.json`; use the committed `package-lock.json` for dependency installs. The application logic is intentionally not implemented yet.
- Build FinPath AI directly in the repository root, not in a nested `finpath-ai/` directory.

## Product Constraints

- The target is a Next.js 14+ App Router TypeScript MVP using Tailwind CSS, Lucide React, Recharts, and a server-side Google Gemini integration.
- Do not add authentication or persistent storage. Financial simulation state belongs in React client state.
- Keep financial calculations as pure TypeScript functions separate from UI components. The debt simulator must accept multiple debts so Snowball and Avalanche comparisons are based on actual balances and rates rather than heuristics.
- Keep Gemini credentials server-only behind `app/api/gemini/route.ts`. Invalid client payloads must receive 4xx responses; missing credentials, network failures, and invalid Gemini output must return usable local fallback JSON so the live demo remains functional.
- Treat AI output as educational guidance, never render it as HTML, and include a visible financial-advice disclaimer.

## Hackathon Requirements

- Preserve a root-level OSI license. The existing `LICENSE` is MIT and already satisfies the requirement.
- Declare third-party libraries, APIs, and assets in project documentation and respect their licenses; the event rules explicitly require this.
- Keep the app exhibition-ready and favor a reliable offline/fallback demo path over infrastructure. The original event rules are preserved in `README.hackathon.md`, especially sections 10-13.
