"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RazorpayModal } from "@/components/RazorpayModal";
import { ShieldCheck, Lock, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [token, setToken] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!auditId) return;
    const savedToken = sessionStorage.getItem(`solvent_token_${auditId}`);
    if (savedToken) {
      setToken(savedToken);
      setModalOpen(true);
    }
  }, [auditId]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={false} />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col justify-center">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-border">
            <div className="w-10 h-10 rounded-xl bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                Unlock Complete Forensic Dossier
              </h2>
              <p className="text-xs text-text-muted">
                Audit ID: <span className="font-mono">{auditId?.slice(0, 8)}...</span>
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-surface-border flex items-baseline justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-text-dim block">
                Total Due
              </span>
              <span className="text-3xl font-mono font-bold text-text-primary">₹49</span>
            </div>
            <span className="text-xs font-mono text-liquidity">One-Time Unlock</span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="font-semibold text-text-primary">Includes:</p>
            <ul className="space-y-1.5 text-text-muted text-[11px]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity" />
                Unmask top 15 merchant cluster identities & ticket sizes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity" />
                Temporal 24x7 day/night spending heatmap
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity" />
                Recurring candidate subscriptions & autopay detector
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity" />
                3 customized 30-day liquidity rules with interactive sliders
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity" />
                Sanitized CSV export, printable PDF report & 9:16 story card
              </li>
            </ul>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow flex items-center justify-center gap-2"
          >
            <span>Proceed to Razorpay Checkout (₹49)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-text-dim text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-liquidity" />
            256-bit encrypted • Server-verified HMAC unlock
          </p>
        </div>
      </main>

      <RazorpayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        auditId={auditId}
        accessToken={token}
        onSuccess={(url) => {
          setModalOpen(false);
          router.push(url);
        }}
      />

      <Footer />
    </div>
  );
}
