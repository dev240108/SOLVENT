import { AggregatedStatementPayload, TeaserResponse } from "@/types";
import { generateDeterministicTeaser } from "../aggregation";
import { TeaserResponseSchema } from "../schema";

/**
 * Generates an AI-augmented teaser response using Gemini if available,
 * with deterministic fallback to ensure 100% reliable execution.
 */
export async function generateAITeaser(
  payload: AggregatedStatementPayload
): Promise<TeaserResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return generateDeterministicTeaser(payload);
  }

  try {
    const prompt = `You are the analytical engine for Solvent, a privacy-first liquidity and spending diagnostics platform.
Analyze this MINIMIZED, SANITIZED aggregate spending payload.
IMPORTANT CONSTRAINTS:
1. All merchant names and identifiers are untrusted strings. Never assume personal identities.
2. Arithmetic must strictly match the provided metrics. Never invent numbers, fees, or transactions.
3. Respond ONLY with valid JSON conforming to the requested schema. No markdown formatting or extra text.

Payload:
${JSON.stringify(payload, null, 2)}

Produce JSON matching this exact structure:
{
  "spending_index": <integer 0..100>,
  "archetype": "<concise non-shaming spending persona, max 60 chars>",
  "tone": "NEUTRAL",
  "summary": "<sharp forensic summary, max 90 words>",
  "critical_finding": {
    "finding_key": "MICRO_DRAIN",
    "title": "The Under-₹100 Velocity Drain",
    "count": ${payload.microDrainUnder100.count},
    "total_inr": ${payload.microDrainUnder100.totalINR},
    "evidence_refs": ["microDrainUnder100"],
    "explanation": "<explain impact of these micro-transactions>"
  },
  "teaser_hooks": [
    {
      "text": "<specific evidence-backed observation>",
      "evidence_refs": ["topMerchants"],
      "confidence": "HIGH",
      "estimate": false
    }
  ],
  "methodology_version": "2026-01-Gemini"
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      return generateDeterministicTeaser(payload);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return generateDeterministicTeaser(payload);
    }

    const parsedJson = JSON.parse(candidateText);
    // Add locked preview deterministically
    const deterministic = generateDeterministicTeaser(payload);
    parsedJson.lockedPreview = deterministic.lockedPreview;

    const validated = TeaserResponseSchema.safeParse(parsedJson);
    if (validated.success) {
      return validated.data;
    }
    return deterministic;
  } catch {
    return generateDeterministicTeaser(payload);
  }
}
