import { NextRequest, NextResponse } from "next/server";
import { AuditStore } from "@/lib/store/auditStore";
import { verifyCapabilityToken } from "@/lib/crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: { auditId: string } }
) {
  try {
    const { auditId } = params;
    const token =
      req.headers.get("x-audit-token") ||
      req.nextUrl.searchParams.get("token");

    const audit = await AuditStore.getById(auditId);
    if (!audit) {
      return NextResponse.json(
        { code: "AUDIT_NOT_FOUND", message: "Audit not found." },
        { status: 404 }
      );
    }

    // Verify token if provided
    if (token && !verifyCapabilityToken(token, audit.accessTokenHash)) {
      return NextResponse.json(
        { code: "INVALID_AUDIT_TOKEN", message: "Invalid or expired capability token." },
        { status: 401 }
      );
    }

    // Return safe report fields immediately (100% Free)
    return NextResponse.json({
      auditId: audit.id,
      isPaid: true,
      periodStart: audit.periodStart,
      periodEnd: audit.periodEnd,
      periodDays: audit.periodDays,
      totalDebitsINR: audit.totalDebitsINR,
      totalCreditsINR: audit.totalCreditsINR,
      netCashFlowINR: audit.netCashFlowINR,
      totalDebitCount: audit.totalDebitCount,
      microDrainCount: audit.microDrainCount,
      microDrainINR: audit.microDrainINR,
      proDossier: audit.proDossier,
      teaser: audit.teaserResult,
      payload: audit.aggregatedPayload,
      transactions: audit.transactions || [],
    });
  } catch (error: any) {
    console.error("Report retrieval error:", error);
    return NextResponse.json(
      { code: "PROCESSING_FAILED", message: "Could not retrieve dossier." },
      { status: 500 }
    );
  }
}
