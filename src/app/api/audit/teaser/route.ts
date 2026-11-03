import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AggregatedStatementPayloadSchema } from "@/lib/schema";
import { generateAITeaser } from "@/lib/ai/gemini";
import { generateProDossier } from "@/lib/aggregation";
import { AuditStore } from "@/lib/store/auditStore";
import { generateCapabilityToken, hashCapabilityToken } from "@/lib/crypto";
import { SolventAuditRecord } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Strict payload validation
    const validation = AggregatedStatementPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          code: "INVALID_PAYLOAD",
          message: "Submitted spending aggregates did not match the required schema.",
          issues: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const payload = validation.data;

    // 2. Generate random capability token & hash
    const auditId = crypto.randomUUID();
    const capabilityToken = generateCapabilityToken();
    const tokenHash = hashCapabilityToken(capabilityToken);

    // 3. Generate both Teaser and Full Pro Dossier immediately (100% Free)
    const [teaser, proDossier] = await Promise.all([
      generateAITeaser(payload),
      Promise.resolve(generateProDossier(payload)),
    ]);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const auditRecord: SolventAuditRecord = {
      id: auditId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt,
      status: "DOSSIER_READY",
      accessTokenHash: tokenHash,
      schemaVersion: "1.0",
      periodStart: payload.periodStart,
      periodEnd: payload.periodEnd,
      periodDays: payload.periodDays,
      totalDebitsINR: payload.totalDebitsINR,
      totalCreditsINR: payload.totalCreditsINR,
      netCashFlowINR: payload.netCashFlowINR,
      totalDebitCount: payload.totalDebitCount,
      totalCreditCount: payload.totalCreditCount,
      microDrainCount: payload.microDrainUnder100.count,
      microDrainINR: payload.microDrainUnder100.totalINR,
      aggregatedPayload: payload,
      teaserResult: teaser,
      proDossier,
      isPaid: true, // 100% Free & fully unlocked
      tierAmountPaise: 0,
      currency: "INR",
      paidAt: now.toISOString(),
      dossierGeneratedAt: now.toISOString(),
      isSynthetic: false,
    };

    AuditStore.save(auditRecord);

    return NextResponse.json({
      auditId,
      accessToken: capabilityToken,
      status: "DOSSIER_READY",
      teaser,
      proDossier,
      reportUrl: `/report/${auditId}`,
      expiresAt,
    });
  } catch (error: any) {
    console.error("Analysis generation error:", error);
    return NextResponse.json(
      {
        code: "PROCESSING_FAILED",
        message: "We could not complete the analysis. Your original file was not uploaded.",
      },
      { status: 500 }
    );
  }
}
