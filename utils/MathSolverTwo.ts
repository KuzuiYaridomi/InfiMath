const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
import { GoogleGenerativeAI } from "@google/generative-ai";

// Optional limits
const COOLDOWN_KEY = "practice_cooldown_start";
const COUNT_KEY = "practice_query_count";
const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_QUERIES = 5;

import { getFromStorage, saveToStorage, removeFromStorage } from "./asyncHelpers";

export interface PracticeQuestion {
  question: string;
  answer: number;
  explanation: string;
}

export interface PracticeResult {
  questions: PracticeQuestion[];
  error?: string;
}

export async function generatePracticeQuestions(
  prompt: string,
  grade: string,
  difficulty: string
): Promise<PracticeResult> {
  // 🔓 NEW: read bypass flag
  const bypass = await getFromStorage("bypass_limit");
  if (bypass) {
    console.log("[MathSolverTwo] 🔓 Bypass enabled → skipping limits/cooldowns");
  }

  // ── 0) Cooldown check ───────────────────────────
  if (!bypass) {
    const cooldownStart = await getFromStorage(COOLDOWN_KEY);
    if (cooldownStart) {
      const elapsed = Date.now() - (typeof cooldownStart === "number" ? cooldownStart : 0);
      if (elapsed < COOLDOWN_MS) {
        const minutes = Math.ceil((COOLDOWN_MS - elapsed) / 60000);
        return { questions: [], error: `❌ Cooldown active. Try again in ${minutes} minutes.` };
      } else {
        await saveToStorage(COUNT_KEY, 0);
        await removeFromStorage(COOLDOWN_KEY);
      }
    }
  }

  // ── 1) Query count check ────────────────────────
  const storedCount = !bypass ? await getFromStorage(COUNT_KEY) : 0;
  const count = !bypass && typeof storedCount === "number" ? storedCount : 0;
  if (!bypass && count >= MAX_QUERIES) {
    await saveToStorage(COOLDOWN_KEY, Date.now());
    return { questions: [], error: "❌ Prompt limit reached. Try again in 2 hours." };
  }

  // ── 2) Build AI prompt ──────────────────────────
  const fullPrompt = `
 Generate 2 math questions with integer-only answers for a ${grade} grade student at ${difficulty} level.
 Topic: ${prompt}

 Respond ONLY with valid raw JSON array.

 Use this exact format:
 [
  {
    "question": "What is 4 + 2?",
    "answer": 6,
    "explanation": "4 + 2 equals 6."
  },
  {
    "question": "What is 9 - 5?",
    "answer": 4,
    "explanation": "9 - 5 equals 4."
  }
 ]
  Return ONLY valid JSON (array format) and no extra commas or text. void inconsistencies like saying the answer is X but explanation shows Y

 `;

  // ── 3) Call Gemini API ───────────────────────────
  try {
    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    console.log("[MathSolverTwo] Sending prompt to AI:", fullPrompt);
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log("[MathSolverTwo] raw response from AI:", text);

    let cleaned = text.trim();

    // Remove ```json or ``` markers if present
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/```[a-z]*\n?/, "").replace(/```$/, "");
    }

    // Try parsing
    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse AI response:", cleaned);
      throw new Error("Invalid JSON format from AI.");
    }

    // If it's wrapped as { questions: [...] }
    if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
      parsed = parsed.questions;
    }

    // If not an array of 2 questions, throw error
    if (!Array.isArray(parsed) || parsed.length !== 2) {
      throw new Error("Incomplete or malformed question array.");
    }

    // ✅ Only increment count if not bypassing
    if (!bypass) {
      await saveToStorage(COUNT_KEY, count + 1);
      console.log("[MathSolverTwo] Usage count saved. Returning questions.");
    } else {
      console.log("[MathSolverTwo] Bypass active — not incrementing query count.");
    }

    return { questions: parsed };

  } catch (err) {
    console.error("Practice question generation failed:", err);
    let errorMessage = "⚠ Failed to generate questions. Please try again.";
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as any).message === "string"
    ) {
      if ((err as any).message.includes("503") || err.toString().includes("overloaded")) {
        errorMessage = "🚨 Gemini is temporarily overloaded. Please try again shortly.";
      }
    } else if (typeof err === "string" && err.includes("overloaded")) {
      errorMessage = "🚨 Gemini is temporarily overloaded. Please try again shortly.";
    }

    return {
      questions: [],
      error: errorMessage,
    };
  }
}