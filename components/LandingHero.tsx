"use client";

import { useRef } from "react";
import {
  ArrowRight,
  Bot,
  CreditCard,
  Gauge,
  Landmark,
  Layers3,
  LockKeyhole,
  MapPin,
  PiggyBank,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

interface LandingHeroProps {
  activePresetId: string | null;
  onGoToSimulator: () => void;
  onPresetSelect: (presetId: string) => void;
}

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

interface DemoCase {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
}

const FEATURES: Feature[] = [
  {
    title: "Simulación inmediata",
    description:
      "Experimenta con tu dinero sin riesgo. Mira en gráficos interactivos cuánto dinero regalas en intereses al pagar el mínimo.",
    icon: Zap,
    tone: "pixel-gold",
  },
  {
    title: "Agente Finicio AI",
    description:
      "Análisis pedagógico instantáneo en lenguaje simple, sin tecnicismos y con un Roadmap de 3 pasos concretos.",
    icon: Bot,
    tone: "pixel-magenta",
  },
  {
    title: "Contexto local real",
    description:
      "Entiende conceptos de la realidad chilena como la CAE, la UF, los Depósitos a Plazo (DAP) y las tarjetas de casas comerciales.",
    icon: MapPin,
    tone: "pixel-cyan",
  },
];

const DEMO_CASES: DemoCase[] = [
  {
    id: "studentCredit",
    eyebrow: "Caso 01 · Crédito",
    title: "La trampa del Pago Mínimo en Tarjeta",
    description: "Compara cuánto tiempo e interés cuesta mantener el pago mínimo.",
    icon: CreditCard,
    tone: "pixel-magenta",
  },
  {
    id: "overIndebted",
    eyebrow: "Caso 02 · Deudas",
    title: "Estrategia Bola de Nieve para salir de deudas",
    description: "Carga una situación con poca holgura y prioriza victorias rápidas.",
    icon: TrendingDown,
    tone: "pixel-cyan",
  },
  {
    id: "firstSaver",
    eyebrow: "Caso 03 · Inversión",
    title: "Guardar bajo el colchón vs. Invertir en DAP/UF",
    description: "Visualiza cómo cambia tu ahorro al darle tiempo para crecer.",
    icon: PiggyBank,
    tone: "pixel-lime",
  },
];

export function LandingHero({
  activePresetId,
  onGoToSimulator,
  onPresetSelect,
}: LandingHeroProps) {
  const demoSectionRef = useRef<HTMLElement>(null);

  function showDemoCases() {
    demoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="mx-auto w-full max-w-[1440px]">
      <header className="pixel pixel-white p-3 sm:p-4">
        <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="pixel pixel-sm pixel-flat pixel-magenta flex h-10 w-10 items-center justify-center text-white"
            >
              <TrendingUp size={21} strokeWidth={3} />
            </span>
            <span className="font-pixel text-[11px] uppercase leading-none text-ink sm:text-xs">
              FinPath <span className="text-accent-strong">AI</span>
            </span>
          </div>

          <span className="pixel pixel-sm pixel-flat pixel-cyan order-3 w-full px-3 py-2 text-center font-pixel text-[8px] uppercase leading-relaxed text-ink sm:order-none sm:ml-auto sm:w-auto">
            HaCAithon 2026 UC | Educación Financiera
          </span>

          <Button onClick={onGoToSimulator} size="sm" className="ml-auto shrink-0 sm:ml-0">
            Ir al simulador
            <ArrowRight size={13} aria-hidden="true" strokeWidth={3} />
          </Button>
        </nav>
      </header>

      <section
        aria-labelledby="landing-title"
        className="grid items-center gap-10 px-1 py-16 sm:px-3 sm:py-20 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] xl:gap-16 xl:py-24"
      >
        <div>
          <div className="pixel pixel-sm pixel-flat pixel-gold inline-flex items-center gap-2 px-3 py-2 font-pixel text-[8px] uppercase leading-relaxed text-ink sm:text-[9px]">
            <Sparkles size={14} aria-hidden="true" strokeWidth={3} />
            Potenciado por Finicio AI · 100% Adaptado a Chile (CLP, UF, DAP)
          </div>

          <h1
            id="landing-title"
            className="pixel-title mt-7 max-w-[22ch] font-pixel text-2xl uppercase leading-[1.45] text-ink sm:text-3xl lg:text-[38px]"
          >
            Toma el control de tu futuro financiero{" "}
            <span className="bg-gradient-to-r from-accent-deep via-cyan-strong to-lime-strong bg-clip-text text-transparent">
              antes de endeudarte.
            </span>
          </h1>

          <p className="mt-7 max-w-[68ch] text-base font-bold leading-relaxed text-ink-secondary sm:text-lg">
            Simula escenarios reales en tiempo real, visualiza el costo oculto de las tarjetas de
            crédito y recibe diagnósticos personalizados con un plan de acción paso a paso.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Button onClick={onGoToSimulator} className="w-full sm:w-auto">
              Probar simulador en vivo
              <ArrowRight size={15} aria-hidden="true" strokeWidth={3} />
            </Button>
            <Button onClick={showDemoCases} variant="secondary" className="w-full sm:w-auto">
              <Play size={14} aria-hidden="true" fill="currentColor" strokeWidth={3} />
              Ver demostración rápida
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-extrabold text-ink-secondary">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={16} aria-hidden="true" className="text-lime-strong" strokeWidth={3} />
              Sin registro
            </span>
            <span className="inline-flex items-center gap-2">
              <LockKeyhole size={15} aria-hidden="true" className="text-cyan-strong" strokeWidth={3} />
              Tus datos no salen del navegador
            </span>
          </div>
        </div>

        <div aria-label="Vista previa de FinPath AI" className="pixel pixel-screen pixel-scanlines p-5 text-white sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b-4 border-white/20 pb-4">
            <div>
              <p className="font-pixel text-[8px] uppercase leading-relaxed text-gold">Tu ruta financiera</p>
              <p className="mt-2 font-score text-3xl uppercase leading-none text-white">Elige · Simula · Decide</p>
            </div>
            <Gauge size={34} aria-hidden="true" className="shrink-0 text-cyan" strokeWidth={2.5} />
          </div>

          <div className="mt-5 grid gap-4">
            {[
              { level: "01", label: "Explora tu escenario", icon: Layers3, color: "text-cyan" },
              { level: "02", label: "Compara el costo real", icon: Landmark, color: "text-gold" },
              { level: "03", label: "Activa tu roadmap IA", icon: Sparkles, color: "text-lime" },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.level} className="flex items-center gap-4 border-4 border-white/20 bg-white/5 p-3">
                  <span className="font-score text-3xl leading-none text-white/50">{step.level}</span>
                  <Icon size={20} aria-hidden="true" className={step.color} strokeWidth={3} />
                  <span className="font-pixel text-[9px] uppercase leading-relaxed text-white">{step.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3 bg-lime px-4 py-3 text-ink">
            <Zap size={18} aria-hidden="true" fill="currentColor" strokeWidth={3} />
            <span className="font-pixel text-[9px] uppercase leading-relaxed">Listo para jugar con tus números</span>
          </div>
        </div>
      </section>

      <section aria-label="Impacto de FinPath AI" className="pixel pixel-screen pixel-scanlines p-5 text-white sm:p-6">
        <div className="grid gap-6 sm:grid-cols-3 sm:divide-x-4 sm:divide-white/20">
          <Stat icon={Gauge} value="< 50ms" label="Cálculo matemático de simulación local en tiempo real." />
          <Stat icon={Layers3} value="3 Pilares" label="Crédito & Tarjetas, Plan de Deudas e Interés Compuesto." />
          <Stat icon={ShieldCheck} value="0 Datos Sensibles" label="Sin registro, sin RUT y sin claves bancarias." />
        </div>
      </section>

      <section aria-labelledby="features-title" className="py-16 sm:py-20">
        <SectionHeading
          kicker="Una herramienta, tres ventajas"
          title="Aprende mirando cómo se mueve tu dinero"
          description="Cada módulo convierte decisiones financieras complejas en escenarios visuales que puedes comparar en segundos."
          id="features-title"
        />

        <div className="mt-9 grid gap-7 pb-2 pr-2 md:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="pixel pixel-white p-5 transition-all duration-300 hover:scale-[1.02] sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`pixel pixel-sm pixel-flat ${feature.tone} flex h-12 w-12 items-center justify-center`}>
                    <Icon size={22} aria-hidden="true" strokeWidth={3} />
                  </span>
                  <span className="font-score text-4xl leading-none text-ink-muted/40">0{index + 1}</span>
                </div>
                <h3 className="mt-6 font-pixel text-[11px] uppercase leading-relaxed text-ink">{feature.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-ink-secondary">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        ref={demoSectionRef}
        id="casos-demo"
        aria-labelledby="demo-title"
        className="scroll-mt-6 pb-20 pt-2"
      >
        <div className="pixel pixel-cream p-5 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              kicker="Modo jurado · 1 click"
              title="Prueba un caso listo para explorar"
              description="Selecciona un escenario y te llevaremos directamente al módulo con todos sus valores cargados."
              id="demo-title"
            />
            <span className="pixel pixel-sm pixel-flat pixel-gold shrink-0 px-3 py-2 font-pixel text-[8px] uppercase leading-relaxed text-ink">
              Demo guiada
            </span>
          </div>

          <div className="mt-8 grid gap-6 pb-2 pr-2 lg:grid-cols-3">
            {DEMO_CASES.map((demoCase) => {
              const Icon = demoCase.icon;
              const selected = demoCase.id === activePresetId;

              return (
                <button
                  key={demoCase.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onPresetSelect(demoCase.id)}
                  className={[
                    "pixel pixel-btn pixel-focus group flex min-h-[190px] flex-col p-5 text-left",
                    "transition-all duration-300 hover:scale-[1.02]",
                    selected ? `${demoCase.tone} pixel-pressed` : "pixel-white",
                  ].join(" ")}
                >
                  <span className="flex w-full items-center justify-between gap-4">
                    <span className="font-pixel text-[8px] uppercase leading-relaxed text-ink-secondary">
                      {demoCase.eyebrow}
                    </span>
                    <Icon size={22} aria-hidden="true" className="text-ink" strokeWidth={3} />
                  </span>
                  <span className="mt-5 block font-pixel text-[10px] uppercase leading-relaxed text-ink">
                    {demoCase.title}
                  </span>
                  <span className="mt-3 block text-xs font-bold leading-relaxed text-ink-secondary">
                    {demoCase.description}
                  </span>
                  <span className="mt-auto flex items-center gap-2 pt-5 font-pixel text-[8px] uppercase text-ink">
                    Cargar escenario
                    <ArrowRight
                      size={13}
                      aria-hidden="true"
                      strokeWidth={3}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex items-start gap-4 sm:px-5 sm:first:pl-0 sm:last:pr-0">
      <Icon size={24} aria-hidden="true" className="mt-1 shrink-0 text-gold" strokeWidth={3} />
      <div>
        <p className="font-score text-3xl uppercase leading-none text-white">{value}</p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-white/75">{label}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  kicker,
  title,
  description,
  id,
}: {
  kicker: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="font-pixel text-[9px] uppercase leading-relaxed text-accent-deep">{kicker}</p>
      <h2 id={id} className="pixel-title mt-3 font-pixel text-lg uppercase leading-relaxed text-ink sm:text-xl">
        {title}
      </h2>
      <p className="mt-4 max-w-[68ch] text-sm font-bold leading-relaxed text-ink-secondary sm:text-base">
        {description}
      </p>
    </div>
  );
}
