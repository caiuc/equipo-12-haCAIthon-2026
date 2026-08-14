"use client";

import type { ReactNode } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { DiagnosisCard } from "@/components/ui/DiagnosisCard";
import { Mascot } from "@/components/ui/Mascot";
import { RoadmapCard } from "@/components/ui/RoadmapCard";
import type { AIInsight, AIStatus } from "@/lib/types";

interface AISectionProps {
  status: AIStatus;
  insight: AIInsight;
  onAnalyze: () => void;
  /** Replaces the default character; the section lays out fine without one. */
  mascot?: ReactNode;
}

export function AISection({ status, insight, onAnalyze, mascot }: AISectionProps) {
  const loading = status === "loading";
  const steps = loading ? PLACEHOLDER_STEPS : insight.roadmap;

  return (
    <section
      aria-label="Análisis con IA"
      className="rounded-card border border-line bg-surface-muted p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        {/* Character column: the section's visual anchor and its one action. */}
        <div className="flex shrink-0 flex-row items-center gap-4 lg:w-[170px] lg:flex-col lg:justify-center lg:gap-3">
          {mascot ?? <Mascot status={status} />}

          <Button onClick={onAnalyze} disabled={loading} size="sm" className="lg:w-full">
            {status === "idle" ? (
              <Sparkles size={14} aria-hidden="true" />
            ) : (
              <RefreshCw
                size={14}
                aria-hidden="true"
                className={loading ? "animate-spin" : undefined}
              />
            )}
            {loading ? "Analizando..." : status === "idle" ? "Analizar con IA" : "Volver a analizar"}
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <DiagnosisCard status={status} diagnosis={insight.diagnosis} />

          {/* The roadmap comes back with the analysis, so it has nothing to show until one runs. */}
          {status !== "idle" && (
            <>
              <h3 className="mb-2 mt-4 text-sm font-semibold text-ink">Ruta sugerida</h3>
              <ol className="m-0 grid list-none gap-2 p-0">
                {steps.map((step, index) => (
                  <RoadmapCard
                    key={step.title || index}
                    index={index}
                    title={step.title}
                    detail={step.detail}
                    loading={loading}
                  />
                ))}
              </ol>
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink-muted">
        Contenido educativo generado automáticamente. No constituye asesoría financiera ni una
        recomendación de inversión; confirma cualquier decisión con tu institución financiera.
      </p>
    </section>
  );
}

/** Three empty slots so the loading skeleton keeps the section's height. */
const PLACEHOLDER_STEPS = [
  { title: "", detail: "" },
  { title: "", detail: "" },
  { title: "", detail: "" },
];
