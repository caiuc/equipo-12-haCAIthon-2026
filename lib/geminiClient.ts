import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "@/lib/constants";
import { GEMINI_FALLBACK_RESPONSE } from "@/lib/fallbackData";

export async function generateStudentResponse(
  message: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return GEMINI_FALLBACK_RESPONSE;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text?.trim() || GEMINI_FALLBACK_RESPONSE;
  } catch {
    return GEMINI_FALLBACK_RESPONSE;
  }
}
