"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle2, AlertCircle, Loader2, Sparkles, X, CreditCard } from "lucide-react";
import confetti from "canvas-confetti";

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditId: string;
  accessToken: string;
  onSuccess: (reportUrl: string) => void;
}

export function RazorpayModal({
  isOpen,
  onClose,
  auditId,
  accessToken,
  onSuccess,
}: RazorpayModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"READY" | "PROCESSING" | "VERIFIED">("READY");

  if (!isOpen) return null;

  const handlePay = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep("PROCESSING");

      // 1. Create order on server
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          accessToken,
          idempotencyKey: `client_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || "Failed to create order");
      }

      const orderData = await orderRes.json();
      const { orderId, amount, currency, keyId } = orderData;

      // Check if Razorpay script is present on window
      const hasRazorpay = typeof window !== "undefined" && (window as any).Razorpay;

      if (hasRazorpay && !keyId.includes("sandbox")) {
        const options = {
          key: keyId,
          amount,
          currency,
          name: "Solvent",
          description: "One-time forensic spending dossier unlock",
          order_id: orderId,
          handler: async function (response: any) {
            await verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
          },
          prefill: {
            contact: "",
            email: "",
          },
          theme: {
            color: "#10B981",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setLoading(false);
      } else {
        // Test / Sandbox direct simulated verification
        // Simulates verified UPI tap
        await new Promise((r) => setTimeout(r, 1200));

        const dummyPaymentId = `pay_sim_${Date.now()}`;
        const dummySig = `sim_sig_${Date.now()}`;

        await verifyPayment({
          orderId,
          paymentId: dummyPaymentId,
          signature: dummySig,
        });
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "Payment processing failed. Please try again.");
      setStep("READY");
      setLoading(false);
    }
  };

  const verifyPayment = async ({
    orderId,
    paymentId,
    signature,
  }: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => {
    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          accessToken,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.message || "Verification failed");
      }

      const verifyData = await verifyRes.json();
      setStep("VERIFIED");

      // Celebrate
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#6366F1", "#FAFAFA"],
        });
      } catch {}

      setTimeout(() => {
        onSuccess(verifyData.reportUrl);
      }, 1400);
    } catch (err: any) {
      setError(err.message || "Server verification failed.");
      setStep("READY");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#121215] border border-surface-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "VERIFIED" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-liquidity/20 border-2 border-liquidity flex items-center justify-center text-liquidity mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">Payment Confirmed</h3>
              <p className="text-xs text-text-muted mt-1">
                Forensic dossier compiled. Redirecting to your report...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">
                  Unlock Forensic Dossier
                </h3>
                <p className="text-xs text-text-dim">One-time payment • No subscription</p>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-surface-border flex items-baseline justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-text-dim block">
                  Amount Due (INR)
                </span>
                <span className="text-3xl font-mono font-bold text-text-primary">₹49</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-liquidity border border-liquidity/20">
                Single Audit Unlock
              </span>
            </div>

            {/* Inclusions */}
            <div className="space-y-2 text-xs">
              <p className="font-semibold text-text-primary">Everything included in your dossier:</p>
              <ul className="space-y-1.5 text-text-muted text-[11px]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity" />
                  Top 15 normalized merchant clusters & average ticket sizes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity" />
                  Interactive 24x7 day/night temporal heatmap
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity" />
                  Recurring subscriptions & hidden autopay detector
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity" />
                  3 personalized 30-day liquidity rules with customizable caps
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity" />
                  Sanitized CSV export, printable PDF report & 9:16 story card
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment (₹49)...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹49 via UPI / Card (Razorpay)</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-text-dim space-y-1">
              <p className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-liquidity" />
                Razorpay 256-bit encrypted checkout • Server-verified HMAC unlock
              </p>
              <p>Refund policy: Non-refundable once dossier is unlocked.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
