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
    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-ink">Diagnóstico</h3>
        <StatusBadge status={status} />
      </div>

      {status === "loading" ? (
        <div className="fp-shimmer mt-3 space-y-2" aria-hidden="true">
          <div className="h-3 w-full rounded bg-surface-muted" />
          <div className="h-3 w-11/12 rounded bg-surface-muted" />
          <div className="h-3 w-8/12 rounded bg-surface-muted" />
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
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

function StatusBadge({ status }: { status: AIStatus }) {
  if (status === "loading") {
    return (
      <span className="fp-shimmer inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-strong">
        Analizando tu escenario...
      </span>
    );
  }

  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-strong">
        <Sparkles size={11} aria-hidden="true" />
        Generado con IA
      </span>
    );
  }

  if (status === "fallback") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf3dd] px-2 py-0.5 text-[11px] font-medium text-[#7a5300]">
        <AlertTriangle size={11} aria-hidden="true" />
        Contenido de respaldo
      </span>
    );
  }

  return null;
}
