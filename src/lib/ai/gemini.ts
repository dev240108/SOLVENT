import { AggregatedStatementPayload, TeaserResponse } from "@/types";
import { generateDeterministicTeaser } from "../aggregation";
import { TeaserResponseSchema } from "../schema";

/**
 * Generates an analytical teaser response with sub-second execution.
 * Uses fast deterministic calculations by default and safe-timeout AI.
 */
export async function generateAITeaser(
  payload: AggregatedStatementPayload
): Promise<TeaserResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Ultra-fast deterministic engine (takes < 2ms)
  const deterministic = generateDeterministicTeaser(payload);

  if (!apiKey) {
    return deterministic;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500); // 1.5s max to eliminate lag

    const prompt = `You are the analytical engine for Solvent, a privacy-first liquidity platform.
Analyze this MINIMIZED aggregate spending payload.
Payload: ${JSON.stringify(payload)}

Produce JSON matching:
{
  "spending_index": ${deterministic.spending_index},
  "archetype": "${deterministic.archetype}",
  "tone": "NEUTRAL",
  "summary": "<sharp forensic summary, max 60 words>",
  "critical_finding": ${JSON.stringify(deterministic.critical_finding)},
  "teaser_hooks": ${JSON.stringify(deterministic.teaser_hooks)},
  "methodology_version": "2026-Fast"
}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      return deterministic;
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return deterministic;
    }

    const parsedJson = JSON.parse(candidateText);
    parsedJson.lockedPreview = deterministic.lockedPreview;

    const validated = TeaserResponseSchema.safeParse(parsedJson);
    if (validated.success) {
      return validated.data;
    }
    return deterministic;
  } catch {
    return deterministic;
  }
}
