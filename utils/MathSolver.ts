// utils/MathSolver.ts

import { GOOGLE_AI_API_KEY, GOOGLE_API_KEY } from "@env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFromStorage, saveToStorage } from "./asyncHelpers";
import { extractTextFromImages } from "./OCR";

// AsyncStorage key
const CAMERA_HISTORY_KEY = "camera_history";
console.log("[MathSolver] Using API Key:", GOOGLE_AI_API_KEY?.slice(0, 10));


// ── MAIN FUNCTION ─────────────────────────────────────────
export async function solveMathProblem(
  images: string[],
  question?: string
): Promise<string> {
  console.log("[MathSolver] 🔍 Starting solveMathProblem");

  // ── 1) Extract OCR text if images are provided ──────────
  let extractedText = "";
  if (images.length > 0) {
    try {
      extractedText = await extractTextFromImages(images);
      console.log("[MathSolver] 📷 OCR Text Extracted:", extractedText);
    } catch (e) {
      console.warn("[MathSolver] ⚠ OCR failed:", e);
    }
  }

  // ── 2) Validate input ───────────────────────────────────
  if (!question?.trim() && !extractedText) {
    return "⚠ Please provide a question or upload a valid image.";
  }

  // ── 3) Construct full prompt ────────────────────────────
  const promptParts: string[] = [];
  if (extractedText) {
    promptParts.push(`Extracted problem from image:\n${extractedText}`);
  }
  if (question?.trim()) {
    promptParts.push(`User prompt:\n${question.trim()}`);
  }
  promptParts.push("Please solve the problem step-by-step and explain clearly.");

  const fullPrompt = promptParts.join("\n\n");
  console.log("[MathSolver] 📤 Final Prompt to Gemini:\n", fullPrompt);

  // ── 4) Gemini with fallback ─────────────────────────
  const apiKeys = [GOOGLE_AI_API_KEY, GOOGLE_API_KEY];
  const models = ["gemini-1.5-flash-latest", "gemini-pro"];

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      const genAI = new GoogleGenerativeAI(apiKeys[i]);
      const model = genAI.getGenerativeModel({ model: models[i] });
      const result = await model.generateContent(fullPrompt);
      const text = (await result.response.text()).trim();

      console.log(`[MathSolver] 🤖 AI Response from model ${models[i]}:`, text);

      // ── 5) Save to AsyncStorage ─────────────────────────
      const qna = {
        question: question || extractedText,
        explanation: text,
        timestamp: Date.now(),
      };
      const existing = (await getFromStorage(CAMERA_HISTORY_KEY)) || [];
      const updated = [qna, ...existing];
      await saveToStorage(CAMERA_HISTORY_KEY, updated);
      console.log("[MathSolver] 💾 Saved to AsyncStorage:", qna);

      return text || "⚠ No response from AI.";
    } catch (err) {
      console.error(`[MathSolver] ❌ Model ${models[i]} failed:`, JSON.stringify(err, null, 2));

    }
  }

  return "🚨 Gemini is temporarily overloaded. Please try again shortly.";
}
