import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `Eres FinPath AI, un asistente educativo de finanzas personales para estudiantes en Chile. Responde siempre en español, con lenguaje simple y pasos prácticos. No solicites información sensible, no prometas resultados financieros y aclara cuando falten datos. FinPath AI entrega orientación educativa y no reemplaza asesoría financiera profesional.`;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 },
    );
  }
}
