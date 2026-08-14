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

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Debes enviar una pregunta en el campo message." },
      { status: 400 },
    );
  }

  try {
    const text = await generateStudentResponse(message.trim());

    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible generar una respuesta en este momento." },
      { status: 502 },
    );
  }
}
