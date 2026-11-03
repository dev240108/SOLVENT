import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { AuditStore } from "@/lib/store/auditStore";
import { generateProDossier } from "@/lib/aggregation";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      const expected = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (expected !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured" || event === "order.paid") {
      const orderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      const paymentId = payload.payload?.payment?.entity?.id;
      const auditId = payload.payload?.payment?.entity?.notes?.auditId;

      if (auditId) {
        const audit = AuditStore.getById(auditId);
        if (audit && !audit.isPaid) {
          const dossier = audit.proDossier || generateProDossier(audit.aggregatedPayload);
          const now = new Date().toISOString();
          AuditStore.update(auditId, {
            isPaid: true,
            status: "DOSSIER_READY",
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            paidAt: now,
            proDossier: dossier,
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
