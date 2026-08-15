# Gemini Agent API

`POST /api/gemini` entrega orientación financiera educativa en JSON.

## Entrada

Enviar `Content-Type: application/json`.

### Pregunta normal

```json
{
  "message": "¿Qué es el interés compuesto?"
}
```

### Evaluación inicial

`financialData` acepta texto plano. `message` es opcional en este modo; si se omite, el agente realiza una evaluación inicial automáticamente.

```json
{
  "financialData": "Ingreso mensual: $600.000 CLP. Deuda tarjeta: $250.000 CLP. Tasa mensual: 3,2%. Ahorro mensual: $50.000 CLP."
}
```

También se pueden enviar ambos campos para hacer una pregunta específica con contexto financiero.

```json
{
  "message": "¿Qué deuda debería priorizar?",
  "financialData": "Ingreso mensual: $600.000 CLP. Tarjeta: $250.000 al 3,2% mensual. Crédito de consumo: $400.000 al 1,5% mensual."
}
```

## Respuesta

La ruta siempre responde con este contrato cuando la solicitud es válida:

```json
{
  "text": "Respuesta educativa para el estudiante.",
  "diagnostico": "Resumen de la evaluación inicial o null.",
  "consejoClave": "Acción inmediata o null.",
  "roadmap": [
    {
      "paso": 1,
      "titulo": "Primer paso",
      "descripcion": "Qué hacer."
    }
  ],
  "recursos": [
    {
      "titulo": "CMF Educa",
      "url": "https://www.cmfchile.cl",
      "descripcion": "Recurso web recomendado."
    }
  ]
}
```

Para preguntas normales, `diagnostico` y `consejoClave` son `null`; `roadmap` y `recursos` son listas vacías.

## Errores y Fallback

- `400`: JSON inválido, `message` vacío o `financialData` no es texto plano.
- `502`: error inesperado en la ruta.
- Si falta `GEMINI_API_KEY`, Gemini falla, responde vacío o devuelve JSON inválido, la ruta devuelve `200` con una respuesta educativa local y los campos de evaluación vacíos.

La API es educativa y no reemplaza asesoría financiera profesional.
