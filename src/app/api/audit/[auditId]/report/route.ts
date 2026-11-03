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

    if (!token) {
      return NextResponse.json(
        { code: "INVALID_AUDIT_TOKEN", message: "Capability token required." },
        { status: 401 }
      );
    }

    const audit = AuditStore.getById(auditId);
    if (!audit) {
      return NextResponse.json(
        { code: "AUDIT_NOT_FOUND", message: "Audit not found." },
        { status: 404 }
      );
    }

    // Verify token against hash
    if (!verifyCapabilityToken(token, audit.accessTokenHash)) {
      return NextResponse.json(
        { code: "INVALID_AUDIT_TOKEN", message: "Invalid or expired capability token." },
        { status: 401 }
      );
    }

    if (!audit.isPaid || !audit.proDossier) {
      return NextResponse.json(
        { code: "PAYMENT_STATE_CONFLICT", message: "Full dossier is locked. Payment required." },
        { status: 403 }
      );
    }

    // Return safe report fields only (never expose tokens or internal hashes)
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
    });
  } catch (error: any) {
    console.error("Report retrieval error:", error);
    return NextResponse.json(
      { code: "PROCESSING_FAILED", message: "Could not retrieve dossier." },
      { status: 500 }
    );
  }
}
