"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { RefreshCw, Send, Sparkles } from "lucide-react";

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
  const [message, setMessage] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  function handleAnalyze() {
    setMessage("");
    setSentMessage(null);
    setSending(false);
    onAnalyze();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || status === "idle" || loading || sending) return;

    setSentMessage(trimmedMessage);
    setMessage("");
    setSending(true);
  }

  return (
    <section aria-label="Análisis con IA" className="pixel pixel-cream p-5">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-7">
        {/* Character column: the section's visual anchor and its one action. */}
        <div className="flex shrink-0 flex-row items-center gap-5 lg:w-[180px] lg:flex-col lg:justify-center lg:gap-4">
          {mascot ?? <Mascot status={status} />}

          <Button onClick={handleAnalyze} disabled={loading} size="sm" className="lg:w-full">
            {status === "idle" ? (
              <Sparkles size={13} aria-hidden="true" strokeWidth={3} />
            ) : (
              <RefreshCw
                size={13}
                aria-hidden="true"
                strokeWidth={3}
                className={loading ? "fp-step-spin" : undefined}
              />
            )}
            {loading ? "Analizando" : status === "idle" ? "Analizar" : "Reintentar"}
          </Button>
        </div>

        {/* pr-2/pb-2 keeps the nested panels' hard shadows off the section edge. */}
        <div className="grid min-w-0 flex-1 gap-7 pb-2 pr-2 xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
          <div className="min-w-0">
            <DiagnosisCard status={status} diagnosis={insight.diagnosis} />

            {/* The roadmap comes back with the analysis, so it has nothing to show until one runs. */}
            {status !== "idle" && (
              <>
                <h3 className="mb-3 mt-6 font-pixel text-[11px] uppercase leading-none text-ink">
                  Ruta sugerida
                </h3>
                <ol className="m-0 grid list-none gap-3.5 p-0">
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

          <div className="pixel pixel-sm pixel-white flex min-h-[300px] min-w-0 flex-col p-4">
            <div className="border-b-4 border-line pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={15} aria-hidden="true" className="text-accent-strong" strokeWidth={3} />
                <h3 className="font-pixel text-[10px] uppercase leading-relaxed text-ink">
                  Conversa sobre tu análisis
                </h3>
              </div>
              <p className="mt-2 text-xs font-bold leading-relaxed text-ink-muted">
                Haz una pregunta sobre tu escenario y la ruta sugerida.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-end gap-4 py-5" aria-live="polite">
              {status === "idle" ? (
                <p className="my-auto text-center text-sm font-bold leading-relaxed text-ink-muted">
                  Analiza tu escenario para habilitar el chat.
                </p>
              ) : loading ? (
                <p className="fp-shimmer my-auto text-center text-sm font-bold leading-relaxed text-ink-muted">
                  El chat estará disponible cuando termine el análisis.
                </p>
              ) : sentMessage ? (
                <>
                  <p className="ml-auto max-w-[90%] border-4 border-line bg-accent-strong px-3 py-2 text-sm font-bold leading-relaxed text-white">
                    {sentMessage}
                  </p>
                  {sending ? (
                    <div className="mr-auto flex items-center gap-3 border-4 border-line bg-surface-muted px-3 py-2 text-sm font-bold text-ink-secondary">
                      <span className="fp-shimmer flex gap-1" aria-hidden="true">
                        <span className="h-2 w-2 bg-accent" />
                        <span className="h-2 w-2 bg-cyan" />
                        <span className="h-2 w-2 bg-gold" />
                      </span>
                      Escribiendo respuesta...
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="my-auto text-center text-sm font-bold leading-relaxed text-ink-muted">
                  Pregunta qué paso priorizar o cómo cambiaría tu escenario.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t-4 border-line pt-4 sm:flex-row sm:items-end">
              <label htmlFor="ai-chat-message" className="sr-only">
                Pregunta sobre tu análisis
              </label>
              <textarea
                id="ai-chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribe tu pregunta..."
                rows={2}
                maxLength={500}
                disabled={status === "idle" || loading || sending}
                className="min-h-[66px] min-w-0 flex-1 resize-none border-4 border-line bg-surface-muted px-3 py-2 text-sm font-bold text-ink outline-none placeholder:text-ink-muted focus:bg-white focus:ring-4 focus:ring-cyan-soft disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || status === "idle" || loading || sending}
                aria-label="Enviar pregunta"
                className="shrink-0 sm:self-end"
              >
                <Send size={13} aria-hidden="true" strokeWidth={3} />
                Enviar
              </Button>
            </form>
          </div>
        </div>
      </div>

      <p className="mt-5 text-center text-[11px] font-semibold leading-relaxed text-ink-muted">
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
