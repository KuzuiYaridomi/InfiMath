// utils/ocr.ts
// ocr-mlkit.ts
import * as MLKitOcr from "expo-mlkit-ocr";

console.log("[DEBUG] OCR module (expo-mlkit-ocr):", MLKitOcr);

/**
 * Minimum length of text we consider "usable".
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

// ---- Internal Types (loose to tolerate lib changes) ----
type MLKitElement = { text?: string };
type MLKitLine = { text?: string; elements?: MLKitElement[]; frame?: any };
type MLKitBlock = { text?: string; lines?: MLKitLine[]; frame?: any };

// The result shape from expo-mlkit-ocr differs by version;
// sometimes it's an array of blocks, sometimes { blocks: Block[] }.
// We'll accept both.
type MLKitResult = MLKitBlock[] | { blocks?: MLKitBlock[] };

// ---- Small safe helpers ----
const safeNormalize = (s?: string) =>
  (s ?? "").normalize?.("NFKC") ?? (s ?? "");

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
const dedupeConsecutive = <T>(arr: T[]): T[] => {
  const out: T[] = [];
  for (const s of arr) {
    if (!out.length || out[out.length - 1] !== s) out.push(s);
  }
  return out;
};


// --- MLKit result flattening ----

/**
 * Try to produce a single flat list of strings from the MLKit result.
 * We prefer `block.text`, then `line.text`, then `element.text`.
 */
const flattenMLKitResultToStrings = (res: MLKitResult): string[] => {
  const blocksArray: MLKitBlock[] = Array.isArray(res)
    ? res
    : Array.isArray((res as any)?.blocks)
    ? (res as any).blocks
    : [];

  const chunks: string[] = [];

  for (const block of blocksArray) {
    if (block?.text && block.text.trim()) {
      chunks.push(block.text.trim());
      continue;
    }
    if (Array.isArray(block?.lines)) {
      for (const line of block.lines) {
        if (line?.text && line.text.trim()) {
          chunks.push(line.text.trim());
          continue;
        }
        if (Array.isArray(line?.elements)) {
          const elText = line.elements
            .map((e) => e?.text?.trim())
            .filter(Boolean)
            .join(" ");
          if (elText) chunks.push(elText);
        }
      }
    }
  }

  return chunks;
};

/**
 * Uses expo-mlkit-ocr to scan a URI, supporting API name variations across versions.
 */
const scanWithMLKit = async (uri: string): Promise<string[]> => {
  const scanFn =
    // newer versions
    (MLKitOcr as any).scanFromURLAsync ??
    // some versions use URI
    (MLKitOcr as any).scanFromURIAsync ??
    // fallback (throw if nothing)
    null;

  if (!scanFn) {
    console.warn(
      "[OCR] ❌ No scan function (scanFromURLAsync/scanFromURIAsync) found in expo-mlkit-ocr."
    );
    return [];
  }

  try {
    const result: MLKitResult = await scanFn(uri, {
      // optional future-proof options, uncomment if needed
      // languages: ['en'],
      // orientation: ...
    });
    const chunks = flattenMLKitResultToStrings(result);
    return chunks;
  } catch (e) {
    console.warn("[OCR] ❌ MLKit scan failed:", e);
    return [];
  }
};

// ---- Public API (kept identical) ----

/**
 * Extract and clean text from multiple images (kept for backward compat).
 */
export const extractTextFromImages = async (
  imageUris: string[]
): Promise<string> => {
  const cleanedChunks: string[] = [];

  for (const uri of imageUris) {
    try {
      const rawChunks = await scanWithMLKit(uri);
      if (rawChunks.length) {
        const combined = rawChunks.join(" ");
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
    const rawChunks = await scanWithMLKit(imagePath);
    const joinedText = rawChunks.join("\n");
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


