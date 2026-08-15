import { NextResponse } from "next/server";
import { generateStudentResponse } from "@/lib/geminiClient";

export async function POST(req: Request) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud debe ser JSON válido." },
      { status: 400 },
    );
  }

  const message =
    body && typeof body === "object" && "message" in body
      ? (body as { message?: unknown }).message
      : undefined;
  const financialData =
    body && typeof body === "object" && "financialData" in body
      ? (body as { financialData?: unknown }).financialData
      : undefined;

  if (financialData !== undefined && (typeof financialData !== "string" || !financialData.trim())) {
    return NextResponse.json(
      { error: "financialData debe ser texto plano con datos financieros." },
      { status: 400 },
    );
  }

  if ((typeof message !== "string" || !message.trim()) && !financialData) {
    return NextResponse.json(
      { error: "Debes enviar una pregunta en message o datos en financialData." },
      { status: 400 },
    );
  }

  try {
    const prompt = typeof message === "string" && message.trim()
      ? message.trim()
      : "Realiza mi evaluación financiera inicial con los datos proporcionados.";
    const response = await generateStudentResponse(
      prompt,
      typeof financialData === "string" ? financialData.trim() : undefined,
    );

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible generar una respuesta en este momento." },
      { status: 502 },
    );
  }
}
