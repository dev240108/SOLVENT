import { NextRequest, NextResponse } from "next/server";
import { CreateOrderRequestSchema } from "@/lib/schema";
import { AuditStore } from "@/lib/store/auditStore";
import { verifyCapabilityToken } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = CreateOrderRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { code: "INVALID_PAYLOAD", message: "Invalid order creation request." },
        { status: 400 }
      );
    }

    const { auditId, accessToken } = validation.data;
    const audit = AuditStore.getById(auditId);

    if (!audit) {
      return NextResponse.json(
        { code: "AUDIT_NOT_FOUND", message: "Audit session not found." },
        { status: 404 }
      );
    }

    // Verify capability token against hash
    if (!verifyCapabilityToken(accessToken, audit.accessTokenHash)) {
      return NextResponse.json(
        { code: "INVALID_AUDIT_TOKEN", message: "Unauthorized or expired capability token." },
        { status: 401 }
      );
    }

    if (audit.isPaid) {
      return NextResponse.json(
        { code: "PAYMENT_STATE_CONFLICT", message: "This audit has already been unlocked." },
        { status: 409 }
      );
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_solvent_sandbox";
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId = `order_${auditId.replace(/-/g, "").slice(0, 16)}`;

    // If real Razorpay keys are provided, call Razorpay API
    if (keySecret && !keyId.includes("sandbox")) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 4900, // ₹49 in paise
            currency: "INR",
            receipt: `rcpt_${auditId.slice(0, 8)}`,
            notes: { auditId },
          }),
        });

        if (res.ok) {
          const rzpOrder = await res.json();
          orderId = rzpOrder.id;
        }
      } catch (err) {
        console.error("Razorpay order API failed, using fallback order reference", err);
      }
    }

    AuditStore.update(auditId, {
      razorpayOrderId: orderId,
      status: "ORDER_CREATED",
    });

    return NextResponse.json({
      orderId,
      amount: 4900,
      currency: "INR",
      keyId,
    });
  } catch (error: any) {
    console.error("Order creation failure:", error);
    return NextResponse.json(
      { code: "PROCESSING_FAILED", message: "Could not create payment order." },
      { status: 500 }
    );
  }
}
