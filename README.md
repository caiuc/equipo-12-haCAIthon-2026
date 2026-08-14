# FinPath AI

FinPath AI es un simulador educativo de finanzas personales creado para la **HaCAithon 2026 UC**. Permite experimentar con crédito, planes de pago de múltiples deudas e inversión en pesos chilenos (CLP), comparar escenarios mediante gráficos y solicitar una explicación en lenguaje simple a **Finicio AI**.

> FinPath AI entrega orientación educativa. No constituye asesoría financiera ni una recomendación de inversión; confirma cualquier decisión con una institución o profesional competente.

## Funcionalidades

- **Crédito y tarjetas:** compara un pago mínimo educativo con un pago mensual acelerado y muestra plazo, intereses, total pagado y evolución del saldo.
- **Plan de deudas:** permite ingresar hasta cinco deudas con saldo, tasa mensual y pago mínimo para comparar Bola de Nieve y Avalancha usando los datos reales de cada obligación.
- **Ahorro e inversión:** proyecta aportes mensuales derivados del ingreso para horizontes de 1 a 40 años y escenarios educativos de rentabilidad anual de 0%, 5% y 9%.
- **Visualización accesible:** gráficos interactivos, métricas resumidas y tablas desplegables con los valores exactos.
- **Casos de demostración:** tres presets cargan escenarios de crédito, sobreendeudamiento y primer ahorro en un clic.
- **Finicio AI:** genera un diagnóstico, una ruta de tres pasos y habilita un chat contextual mediante Google Gemini.
- **Demo resiliente:** si Gemini no está configurado, falla o devuelve una respuesta inválida, la aplicación utiliza contenido local de respaldo.

Los cálculos se ejecutan localmente como funciones TypeScript puras y el estado vive en memoria en React. No hay registro de usuarios, autenticación, base de datos ni almacenamiento persistente.

## Tecnologías

- Next.js 16 con App Router, React 19 y TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Google Gen AI SDK (`@google/genai`)
- Node.js Test Runner mediante `tsx`

## Puesta en marcha

### Requisitos

- Node.js 22 o superior
- npm 10 o superior

### Instalación

```bash
git clone <URL_DEL_REPOSITORIO>
cd equipo-12-haCAIthon-2026
npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El simulador funciona sin una clave de Gemini gracias al fallback local.

### Configuración opcional de Gemini

Crea un archivo `.env.local` en la raíz:

```dotenv
GEMINI_API_KEY=tu_clave_de_gemini
GEMINI_MODEL=gemini-2.5-flash
```

`GEMINI_API_KEY` habilita las respuestas remotas y nunca se expone al cliente: solo se lee en el servidor desde `app/api/gemini/route.ts`. `GEMINI_MODEL` es opcional; si no se define, se usa `gemini-2.5-flash`.

No subas archivos `.env*` al repositorio. La regla ya está incluida en `.gitignore`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Genera el build optimizado de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | Ejecuta ESLint sobre el proyecto. |
| `npm test` | Ejecuta las 17 pruebas del motor financiero. |

El primer build necesita acceso a Google Fonts para que `next/font` descargue y autoaloje Nunito, Press Start 2P y VT323.

## Arquitectura

```text
app/
├── page.tsx                 Estado de los simuladores y orquestación de la UI
├── layout.tsx               Metadatos y fuentes
└── api/gemini/route.ts      Validación HTTP e integración server-side con Gemini
components/
├── tabs/                    Formularios de crédito, deudas e inversión
└── ui/                      Controles, métricas, gráficos, tabla de deudas y mascota
lib/
├── financial/               Motores financieros puros, contratos y pruebas
├── mathEngine.ts            Fachada pública de los tres motores
├── calculators.ts           Adaptadores de resultados del motor a la interfaz
├── geminiClient.ts          Cliente Gemini, validación de salida y fallback
└── mockData.ts              Estado inicial, presets y respaldo visual
docs/
├── FINANCIAL_ENGINE.md      Contratos y ejemplos del motor
└── gemini-agent-api.md      Contrato de POST /api/gemini
```

### Flujo de datos

1. Los controles actualizan estado React en el navegador.
2. `lib/mathEngine.ts` ejecuta la simulación sin solicitudes HTTP.
3. `lib/calculators.ts` transforma el resultado en métricas y series para Recharts.
4. Solo al pulsar **Analizar** o usar el chat se envía el contexto financiero a `POST /api/gemini`.
5. La ruta usa Gemini si existe una clave válida; en caso contrario devuelve JSON de respaldo utilizable.

La API rechaza con `400` los cuerpos inválidos. La clave, el prompt de sistema y el SDK de Gemini permanecen en el servidor. Las respuestas del modelo se validan como JSON y se renderizan como texto, nunca como HTML. Consulta el [contrato completo de la API](docs/gemini-agent-api.md).

## Supuestos del motor financiero

- Todos los montos se normalizan a pesos chilenos enteros.
- Las tasas de crédito y deuda ingresadas por la interfaz son porcentajes mensuales.
- El pago mínimo de tarjeta es una aproximación educativa: interés del mes más 5% del capital pendiente; no replica el contrato de una entidad financiera.
- Bola de Nieve prioriza el menor saldo y Avalancha la mayor tasa. Ambas respetan los pagos mínimos y reutilizan inmediatamente la capacidad liberada.
- Las proyecciones de inversión convierten una tasa efectiva anual a su equivalente mensual y agregan el aporte al final de cada mes.
- Crédito y deuda tienen un horizonte máximo de simulación de 600 meses; inversión admite entre 1 y 40 años.
- Las rentabilidades de 0%, 5% y 9% son escenarios comparativos, no promesas de desempeño.

La documentación técnica detallada está en [docs/FINANCIAL_ENGINE.md](docs/FINANCIAL_ENGINE.md).

## Privacidad y uso responsable de IA

- Los cálculos y el estado de la sesión permanecen en el navegador y se pierden al recargar.
- El contexto del simulador y hasta los últimos seis mensajes se envían al backend únicamente cuando se usa Finicio AI.
- Con Gemini habilitado, ese contenido es procesado por la API de Google; no ingreses RUT, claves bancarias, contraseñas ni números completos de tarjetas.
- La aplicación no guarda conversaciones ni resultados en una base de datos.
- El asistente está restringido a educación financiera, responde en español e incluye un descargo educativo.

## Dependencias, APIs y activos de terceros

El proyecto declara sus dependencias reproducibles en `package.json` y `package-lock.json`.

| Recurso | Uso | Licencia o condiciones |
| --- | --- | --- |
| Next.js | Framework web | MIT |
| React y React DOM | Interfaz de usuario | MIT |
| Tailwind CSS | Estilos | MIT |
| Recharts | Gráficos | MIT |
| Lucide React | Iconografía | ISC |
| Google Gen AI SDK | Cliente de Gemini | Apache-2.0 |
| Google Gemini API | Generación de orientación educativa | Servicio externo sujeto a los términos de Google |
| Nunito, Press Start 2P y VT323 | Tipografías cargadas con `next/font` | SIL Open Font License 1.1 |
| TypeScript, ESLint, PostCSS, Autoprefixer y tsx | Desarrollo, validación y build | Licencias open source declaradas por cada paquete |

No se incluyen imágenes de terceros en el repositorio. La interfaz utiliza componentes propios, iconos de Lucide y las fuentes indicadas arriba.

## Verificación

El estado actual fue verificado con:

```bash
npm test
npm run lint
npm run build
```

Resultado: 17 pruebas aprobadas, lint sin errores y build de producción completado correctamente.

## Hackathon y licencia

Las bases originales del evento se conservan en [README.hackathon.md](README.hackathon.md). FinPath AI se distribuye bajo la [licencia MIT](LICENSE).
