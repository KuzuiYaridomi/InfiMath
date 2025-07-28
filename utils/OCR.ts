// utils/ocr.ts
import TextRecognition from "react-native-text-recognition";

console.log("[DEBUG] OCR module:", TextRecognition);

/**
 * Minimum length of text we consider "usable".
 * If the final extracted string is shorter, we'll still return it,
 * but log a warning so you can decide to fallback or warn the user.
 */
const MIN_EXTRACTED_CHARS = 8;

/** Map of superscripts/subscripts & a few common unicode variants to ASCII-ish forms */
const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "^0",
  "¹": "^1",
  "²": "^2",
  "³": "^3",
  "⁴": "^4",
  "⁵": "^5",
  "⁶": "^6",
  "⁷": "^7",
  "⁸": "^8",
  "⁹": "^9",
};

const SUBSCRIPT_MAP: Record<string, string> = {
  "₀": "_0",
  "₁": "_1",
  "₂": "_2",
  "₃": "_3",
  "₄": "_4",
  "₅": "_5",
  "₆": "_6",
  "₇": "_7",
  "₈": "_8",
  "₉": "_9",
};

// Safely normalize (avoid crashing on undefined/null)
const safeNormalize = (s?: string) => (s ?? "").normalize?.("NFKC") ?? (s ?? "");

/**
 * Clean up common OCR issues and math symbols.
 */
export const cleanExtractedText = (raw: string): string => {
  let text = safeNormalize(raw);

  // Strip zero-width & control chars
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, ""); // zero-widths
  text = text.replace(/\p{C}+/gu, " "); // other control chars

  // Normalize common math & punctuation symbols
  text = text
    .replace(/×/g, "*")
    .replace(/∙|•|·/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-") // unicode minus
    .replace(/∕/g, "/")
    .replace(/∗/g, "*")
    .replace(/—|–/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/√/g, "sqrt")
    .replace(/∞/g, "infinity")
    .replace(/π/g, "pi")
    .replace(/θ/g, "theta")
    .replace(/≈/g, "approximately equal to")
    .replace(/≠/g, "!=")
    .replace(/≤/g, "<=")
    .replace(/≥/g, ">=")
    .replace(/∫/g, "integrate ")
    .replace(/∑/g, "sum ")
    .replace(/∂/g, "partial ")
    .replace(/±/g, "+/-")
    .replace(/°/g, " degrees");

  // Superscripts/Subscripts → ASCII
  text = text.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (m) => SUPERSCRIPT_MAP[m] ?? m);
  text = text.replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (m) => SUBSCRIPT_MAP[m] ?? m);

  // Collapse whitespace/newlines & de-duplicate
  text = text
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ");

  return text.trim();
};

/**
 * Small helper to dedupe consecutive identical chunks.
 */
const dedupeConsecutive = (arr: string[]) => {
  const out: string[] = [];
  for (const s of arr) {
    if (!out.length || out[out.length - 1] !== s) out.push(s);
  }
  return out;
};

/**
 * Extract and clean text from multiple images (kept for backward compat).
 */
export const extractTextFromImages = async (
  imageUris: string[]
): Promise<string> => {
  const cleanedChunks: string[] = [];

  if (!TextRecognition?.recognize) {
  console.warn("[OCR] ❌ TextRecognition module not available.");
  return "";
 }

  for (const uri of imageUris) {
    try {
      const lines = await TextRecognition.recognize(uri);

      if (Array.isArray(lines) && lines.length) {
        const combined = lines.join(" ");
        const cleaned = cleanExtractedText(combined);
        if (cleaned.length) {
          cleanedChunks.push(cleaned);
          console.log("[OCR] ✅ Extracted from image:", cleaned);
        } else {
          console.log("[OCR] ⚠ Cleaned text was empty for image:", uri);
        }
      } else {
        console.log("[OCR] ⚠ No text found in image:", uri);
      }
    } catch (error) {
      console.warn("[OCR] ❌ Error processing image:", uri, error);
    }
  }

  const deduped = dedupeConsecutive(cleanedChunks);
  const finalText = deduped.join("\n\n");

  if (!finalText || finalText.length < MIN_EXTRACTED_CHARS) {
    console.warn(
      `[OCR] ⚠ Final extracted text is very short (${finalText.length} chars).`
    );
  }

  console.log("[OCR] 📦 Final combined extracted text:", finalText);
  return finalText;
};

/**
 * Extracts and cleans text from a single image.
 */
export const extractTextFromImage = async (
  imagePath: string
): Promise<string> => {
  try {
    const result = await TextRecognition.recognize(imagePath);
    const joinedText = result.join("\n");
    const cleaned = cleanExtractedText(joinedText);

    if (!cleaned || cleaned.length < MIN_EXTRACTED_CHARS) {
      console.warn(
        `[OCR] ⚠ Very short extraction from single image (${cleaned.length} chars).`
      );
    }

    return cleaned;
  } catch (error) {
    console.error("OCR failed for image:", imagePath, error);
    return "";
  }
};

/**
 * Handles OCR for multiple images and merges cleaned text.
 * Kept for callers already relying on this exact function name/signature.
 */
export const extractTextFromMultipleImages = async (
  imagePaths: string[]
): Promise<string> => {
  const allTexts: string[] = [];

  for (const path of imagePaths) {
    const extracted = await extractTextFromImage(path);
    if (extracted) {
      allTexts.push(extracted);
    }
  }

  const deduped = dedupeConsecutive(allTexts);
  const finalText = deduped.join("\n\n");

  if (!finalText || finalText.length < MIN_EXTRACTED_CHARS) {
    console.warn(
      `[OCR] ⚠ Final combined text from multiple images is short (${finalText.length} chars).`
    );
  }

  console.log("[OCR] 📦 Final combined extracted text (multi):", finalText);
  return finalText;
};

