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
    <section
      aria-label="Análisis con IA"
      className="rounded-card border border-line bg-surface-muted p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        {/* Character column: the section's visual anchor and its one action. */}
        <div className="flex shrink-0 flex-row items-center gap-4 lg:w-[170px] lg:flex-col lg:justify-center lg:gap-3">
          {mascot ?? <Mascot status={status} />}

          <Button onClick={handleAnalyze} disabled={loading} size="sm" className="lg:w-full">
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

        <div className="grid min-w-0 flex-1 gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]">
          <div className="min-w-0">
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

          <div className="flex min-h-[280px] min-w-0 flex-col rounded-card border border-line bg-surface p-4 shadow-card">
            <div>
              <h3 className="text-sm font-semibold text-ink">Conversa sobre tu análisis</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                Haz una pregunta sobre tu escenario y la ruta sugerida.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-end gap-3 py-4" aria-live="polite">
              {status === "idle" ? (
                <p className="my-auto text-center text-sm leading-relaxed text-ink-muted">
                  Analiza tu escenario para habilitar el chat.
                </p>
              ) : loading ? (
                <p className="my-auto text-center text-sm leading-relaxed text-ink-muted">
                  El chat estará disponible cuando termine el análisis.
                </p>
              ) : sentMessage ? (
                <>
                  <p className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-accent-strong px-3 py-2 text-sm leading-relaxed text-white">
                    {sentMessage}
                  </p>
                  {sending ? (
                    <div className="mr-auto flex items-center gap-2 rounded-xl rounded-bl-sm bg-surface-muted px-3 py-2 text-sm text-ink-secondary">
                      <span className="flex gap-1" aria-hidden="true">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
                      </span>
                      Escribiendo respuesta...
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="my-auto text-center text-sm leading-relaxed text-ink-muted">
                  Puedes preguntar, por ejemplo, cuál paso priorizar o cómo cambia tu escenario.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-line pt-3">
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
                className="min-h-[64px] min-w-0 flex-1 resize-none rounded-lg border border-line bg-surface-muted px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent-soft disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || status === "idle" || loading || sending}
                aria-label="Enviar pregunta"
                className="shrink-0"
              >
                <Send size={14} aria-hidden="true" />
                Enviar
              </Button>
            </form>
          </div>
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
