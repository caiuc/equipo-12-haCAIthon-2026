import { AlertTriangle, Sparkles } from "lucide-react";

import type { AIStatus } from "@/lib/types";

interface DiagnosisCardProps {
  status: AIStatus;
  diagnosis: string;
}

/**
 * Renders the model's diagnosis. `diagnosis` is always placed as a text child,
 * never as HTML — model output must not be able to inject markup.
 */
export function DiagnosisCard({ status, diagnosis }: DiagnosisCardProps) {
  return (
    <div className="pixel pixel-white p-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="font-pixel text-[11px] uppercase leading-none text-ink">Diagnóstico</h3>
        <StatusBadge status={status} />
      </div>

      {status === "loading" ? (
        <div className="fp-shimmer mt-4 space-y-2" aria-hidden="true">
          <div className="h-3 w-full bg-accent-soft" />
          <div className="h-3 w-11/12 bg-accent-soft" />
          <div className="h-3 w-8/12 bg-accent-soft" />
        </div>
      ) : (
        <p className="mt-3.5 text-sm font-semibold leading-relaxed text-ink-secondary">
          {status === "idle"
            ? "Ajusta los controles y pide un análisis para ver una lectura de tu escenario."
            : diagnosis}
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {status === "loading" ? "Analizando tu escenario" : ""}
      </p>
    </div>
  );
}

/**
 * Status is carried by an icon and a word as well as the tone, so it never
 * depends on color alone.
 */
function StatusBadge({ status }: { status: AIStatus }) {
  const base =
    "pixel pixel-sm pixel-flat inline-flex items-center gap-1.5 px-2.5 py-1 font-pixel text-[8px] uppercase leading-none";

  if (status === "loading") {
    return (
      <span className={`${base} pixel-cyan fp-shimmer text-ink`}>Analizando...</span>
    );
  }

  if (status === "success") {
    return (
      <span className={`${base} pixel-lime text-ink`}>
        <Sparkles size={10} aria-hidden="true" strokeWidth={3} />
        Generado con IA
      </span>
    );
  }

  if (status === "fallback") {
    return (
      <span className={`${base} pixel-gold text-ink`}>
        <AlertTriangle size={10} aria-hidden="true" strokeWidth={3} />
        Respaldo
      </span>
    );
  }

  return null;
}
