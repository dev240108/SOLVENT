import { NextRequest, NextResponse } from "next/server";
import { VerifyPaymentRequestSchema } from "@/lib/schema";
import { AuditStore } from "@/lib/store/auditStore";
import { verifyCapabilityToken, verifyRazorpaySignature } from "@/lib/crypto";
import { generateProDossier } from "@/lib/aggregation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = VerifyPaymentRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { code: "INVALID_PAYLOAD", message: "Invalid payment verification parameters." },
        { status: 400 }
      );
    }

    const { auditId, accessToken, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      validation.data;

    const audit = AuditStore.getById(auditId);
    if (!audit) {
      return NextResponse.json(
        { code: "AUDIT_NOT_FOUND", message: "Audit session not found." },
        { status: 404 }
      );
    }

    // Verify capability token
    if (!verifyCapabilityToken(accessToken, audit.accessTokenHash)) {
      return NextResponse.json(
        { code: "INVALID_AUDIT_TOKEN", message: "Unauthorized capability token." },
        { status: 401 }
      );
    }

    // Confirm stored order ID matches
    if (audit.razorpayOrderId && audit.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { code: "PAYMENT_STATE_CONFLICT", message: "Order ID mismatch." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check HMAC signature if secret configured
    if (keySecret) {
      const isValid = verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        keySecret
      );
      if (!isValid) {
        return NextResponse.json(
          { code: "PAYMENT_STATE_CONFLICT", message: "Invalid payment cryptographic signature." },
          { status: 400 }
        );
      }
    }

    // Generate Pro Dossier if not already generated
    const dossier = audit.proDossier || generateProDossier(audit.aggregatedPayload);
    const now = new Date().toISOString();

    AuditStore.update(auditId, {
      isPaid: true,
      status: "DOSSIER_READY",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      paidAt: now,
      dossierGeneratedAt: now,
      proDossier: dossier,
    });

    return NextResponse.json({
      status: "DOSSIER_READY",
      reportUrl: `/report/${auditId}`,
    });
  } catch (error: any) {
    console.error("Payment verification failure:", error);
    return NextResponse.json(
      { code: "PROCESSING_FAILED", message: "Failed to verify payment." },
      { status: 500 }
    );
  }
}
