import type { AIStatus } from "@/lib/types";

interface MascotProps {
  status: AIStatus;
  size?: number;
}

/**
 * Optional decorative character for the AI section. Purely visual — the
 * section lays out fine if this is removed or swapped for an illustration.
 * The idle float is disabled under prefers-reduced-motion (see globals.css).
 */
export function Mascot({ status, size = 132 }: MascotProps) {
  const thinking = status === "loading";
  const happy = status === "success";

  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={(size * 150) / 120}
      role="img"
      aria-label="Asistente de FinPath"
      className="fp-float shrink-0"
    >
      {/* Body */}
      <path
        d="M60 10 L110 75 L60 140 L10 75 Z"
        fill="#e8f1fd"
        stroke="#1c5cab"
        strokeWidth={3}
        strokeLinejoin="round"
      />

      {/* Glasses */}
      <g stroke="#1c5cab" strokeWidth={2.5} fill="#ffffff">
        <circle cx={45} cy={68} r={13} />
        <circle cx={75} cy={68} r={13} />
      </g>
      <path d="M58 68 H62" stroke="#1c5cab" strokeWidth={2.5} strokeLinecap="round" />

      {/* Eyes — a flat line while "thinking" reads as concentration */}
      {thinking ? (
        <g stroke="#0f2033" strokeWidth={3} strokeLinecap="round">
          <path d="M41 68 H49" />
          <path d="M71 68 H79" />
        </g>
      ) : (
        <g fill="#0f2033">
          <circle cx={45} cy={68} r={3.5} />
          <circle cx={75} cy={68} r={3.5} />
        </g>
      )}

      {/* Mouth */}
      <path
        d={happy ? "M46 92 Q60 106 74 92" : "M48 94 Q60 101 72 94"}
        fill="none"
        stroke="#1c5cab"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Thinking dots */}
      {thinking ? (
        <g fill="#2a78d6" className="fp-shimmer">
          <circle cx={88} cy={34} r={3} />
          <circle cx={97} cy={26} r={4} />
          <circle cx={107} cy={16} r={5} />
        </g>
      ) : null}
    </svg>
  );
}
