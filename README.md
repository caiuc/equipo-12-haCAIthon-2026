# FinPath AI

MVP de educación financiera para la HaCAIthon 2026. Permitirá explorar crédito, manejo de deuda, ahorro e inversión.

## Estado

El repositorio contiene el esqueleto técnico; aún no incluye lógica financiera, interfaz funcional ni integración con Gemini.

## Requisitos

- Node.js 22+
- npm 10+

## Inicio

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Estructura

```text
app/                    App Router y ruta futura de Gemini
components/             Componentes de interfaz y pestañas
lib/                    Tipos, cálculos, sanitización y fallback futuros
.env.example            Variables de entorno previstas para Gemini
```

## Variables de entorno

`GEMINI_API_KEY` y `GEMINI_MODEL` están declaradas en `.env.example` para la futura integración de Gemini. No se debe subir `.env` al repositorio.

## Dependencias previstas

- Next.js y React
- Tailwind CSS
- Lucide React
- Recharts
- Google Generative AI SDK

Las bases originales del evento se conservan en [README.hackathon.md](README.hackathon.md).
