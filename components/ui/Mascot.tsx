import type { AIStatus } from "@/lib/types";

interface MascotProps {
  status: AIStatus;
  size?: number;
}

/**
 * Optional decorative character for the AI section. Purely visual — the
 * section lays out fine if this is removed or swapped for an illustration.
 *
 * The sprite is authored as a character grid rather than paths, so editing it
 * means retyping pixels: one character per pixel, mapped through PALETTE. Only
 * the face band (rows 6-11) changes with status; the rest of the body is
 * shared. The idle bob is disabled under prefers-reduced-motion (globals.css).
 */
const PALETTE: Record<string, string> = {
  K: "#241b3b", // outline
  C: "#2cc0ee", // face plate
  M: "#c22986", // body
  G: "#ffc53d", // antenna bulb + chest coin
  W: "#ffffff", // eye white
  E: "#241b3b", // pupil
};

const SPRITE_W = 16;

/** Rows 0-5: antenna and the top of the head. */
const HEAD = [
  "......KKKK......",
  ".....KKGGKK.....",
  "......KKKK......",
  ".......KK.......",
  ".KKKKKKKKKKKKKK.",
  ".KCCCCCCCCCCCCK.",
];

/** Rows 12-19: jaw, neck and body. */
const BODY = [
  ".KKKKKKKKKKKKKK.",
  "....KK....KK....",
  ".KKKKKKKKKKKKKK.",
  ".KMMMMMMMMMMMMK.",
  ".KMMMGGGGGGMMMK.",
  ".KMMMGGGGGGMMMK.",
  ".KMMMMMMMMMMMMK.",
  ".KKKKKKKKKKKKKK.",
];

/** Rows 6-11 — the only band that reacts to status. */
const FACES: Record<"neutral" | "thinking" | "happy", string[]> = {
  neutral: [
    ".KCWWWCCCCWWWCK.",
    ".KCWEWCCCCWEWCK.",
    ".KCWWWCCCCWWWCK.",
    ".KCCCCCCCCCCCCK.",
    ".KCCCCKKKKCCCCK.",
    ".KCCCCCCCCCCCCK.",
  ],
  // Eyes squeezed to a single lit row and the mouth pinched: concentration.
  thinking: [
    ".KCCCCCCCCCCCCK.",
    ".KCWWWCCCCWWWCK.",
    ".KCCCCCCCCCCCCK.",
    ".KCCCCCCCCCCCCK.",
    ".KCCCCCKKCCCCCK.",
    ".KCCCCCCCCCCCCK.",
  ],
  happy: [
    ".KCWWWCCCCWWWCK.",
    ".KCWEWCCCCWEWCK.",
    ".KCWWWCCCCWWWCK.",
    ".KCCKCCCCCCKCCK.",
    ".KCCKKKKKKKKCCK.",
    ".KCCCCCCCCCCCCK.",
  ],
};

export function Mascot({ status, size = 132 }: MascotProps) {
  const face =
    status === "loading" ? "thinking" : status === "success" ? "happy" : "neutral";
  const rows = [...HEAD, ...FACES[face], ...BODY];

  return (
    <svg
      viewBox={`0 0 ${SPRITE_W} ${rows.length}`}
      width={size}
      height={(size * rows.length) / SPRITE_W}
      role="img"
      aria-label="Asistente de FinPath"
      shapeRendering="crispEdges"
      className="fp-float shrink-0"
    >
      {rows.map((row, y) =>
        [...row].map((cell, x) => {
          const fill = PALETTE[cell];
          if (!fill) return null;
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />;
        }),
      )}

      {/* Thought bubbles, drawn on the same pixel grid as the sprite. */}
      {status === "loading" ? (
        <g fill="#241b3b" className="fp-shimmer">
          <rect x={12} y={3} width={1} height={1} />
          <rect x={13} y={1} width={2} height={2} />
        </g>
      ) : null}
    </svg>
  );
}
