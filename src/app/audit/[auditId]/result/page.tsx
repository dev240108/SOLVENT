"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SolvencyGauge } from "@/components/SolvencyGauge";
import { RazorpayModal } from "@/components/RazorpayModal";
import { PayloadInspectorModal } from "@/components/PayloadInspectorModal";
import { TeaserResponse, AggregatedStatementPayload } from "@/types";
import {
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Activity,
  ShieldCheck,
  Eye,
  SlidersHorizontal,
  Flame,
  FileText,
} from "lucide-react";

export default function TeaserResultPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [teaser, setTeaser] = useState<TeaserResponse | null>(null);
  const [payload, setPayload] = useState<AggregatedStatementPayload | null>(null);
  const [token, setToken] = useState<string>("");
  const [tone, setTone] = useState<"NEUTRAL" | "PLAYFUL">("NEUTRAL");
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

  useEffect(() => {
    if (!auditId) return;

    // Load session data
    const savedToken = sessionStorage.getItem(`solvent_token_${auditId}`);
    const savedTeaser = sessionStorage.getItem(`solvent_teaser_${auditId}`);
    const savedPayload = sessionStorage.getItem(`solvent_payload_${auditId}`);

    if (savedToken) setToken(savedToken);
    if (savedTeaser) setTeaser(JSON.parse(savedTeaser));
    if (savedPayload) setPayload(JSON.parse(savedPayload));
  }, [auditId]);

  if (!teaser || !payload) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar showSampleCta={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <Activity className="w-8 h-8 text-liquidity animate-spin" />
          <h2 className="text-lg font-semibold text-text-primary">Loading spending diagnosis...</h2>
          <p className="text-xs text-text-muted">If you reloaded, please start an audit session.</p>
          <button
            onClick={() => router.push("/audit/new")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-liquidity text-canvas"
          >
            Start New Audit
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={false} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Banner: Local-First Status & Inspector */}
        <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-liquidity shrink-0" />
            <span className="text-text-muted">
              Audit ID: <span className="font-mono text-text-primary">{auditId.slice(0, 8)}...</span> • Minimized Aggregate Mode
            </span>
          </div>
          <button
            onClick={() => setInspectorOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-text-primary border border-surface-border transition-colors text-[11px] font-mono self-start sm:self-auto"
          >
            <Eye className="w-3.5 h-3.5 text-liquidity" />
            <span>Inspect Transmitted Payload</span>
          </button>
        </div>

        {/* Top Summary Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Solvency Index Gauge */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border flex flex-col items-center justify-center text-center shadow-card">
            <SolvencyGauge
              score={teaser.spending_index}
              size={180}
              label="Spending Pattern Index"
              sublabel="Deterministic behavioral metric (0–100)"
            />

            <div className="mt-5 w-full pt-4 border-t border-surface-border flex items-center justify-between text-xs">
              <span className="text-text-dim">Archetype Classification</span>
              <span className="font-mono font-semibold text-text-primary px-2.5 py-0.5 rounded-full bg-zinc-900 border border-surface-border">
                {teaser.archetype}
              </span>
            </div>
          </div>

          {/* Forensic Summary & Tone Selector */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-liquidity px-3 py-1 rounded-full bg-liquidity/10 border border-liquidity/20">
                Diagnostic Teaser
              </span>

              {/* Tone Switcher */}
              <div className="inline-flex p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono">
                <button
                  onClick={() => setTone("NEUTRAL")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    tone === "NEUTRAL"
                      ? "bg-zinc-800 text-text-primary font-semibold"
                      : "text-text-dim hover:text-text-muted"
                  }`}
                >
                  <FileText className="w-3 h-3 text-liquidity" />
                  <span>Auditor Tone</span>
                </button>
                <button
                  onClick={() => setTone("PLAYFUL")}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                    tone === "PLAYFUL"
                      ? "bg-zinc-800 text-text-primary font-semibold"
                      : "text-text-dim hover:text-text-muted"
                  }`}
                >
                  <Flame className="w-3 h-3 text-rose-400" />
                  <span>Roast Tone</span>
                </button>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Your spending, decoded.
            </h2>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-surface-border text-xs sm:text-sm text-text-muted leading-relaxed">
              {tone === "NEUTRAL" ? (
                <p>{teaser.summary}</p>
              ) : (
                <p>
                  You are essentially underwriting the delivery ecosystem and funding convenient chai runs across your city. Those &ldquo;just ₹40&rdquo; and &ldquo;just ₹85&rdquo; scans are draining your capital while keeping you convinced you didn&apos;t spend anything.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-text-dim font-mono">
              <span>Scan Window: {payload.periodStart} to {payload.periodEnd} ({payload.periodDays} days)</span>
              <span>•</span>
              <span>{payload.quality.parsedRows} rows processed</span>
            </div>
          </div>
        </div>

        {/* Macro Metrics 5-Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-surface border border-surface-border">
            <span className="text-[10px] text-text-dim block font-mono">Total Outflow</span>
            <span className="font-mono text-lg font-bold text-text-primary flex items-center gap-1 mt-1">
              ₹{payload.totalDebitsINR.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim block mt-0.5 font-mono">{payload.totalDebitCount} debits</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-surface-border">
            <span className="text-[10px] text-text-dim block font-mono">Total Inflow</span>
            <span className="font-mono text-lg font-bold text-emerald-400 flex items-center gap-1 mt-1">
              ₹{payload.totalCreditsINR.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim block mt-0.5 font-mono">{payload.totalCreditCount} credits</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-surface-border">
            <span className="text-[10px] text-text-dim block font-mono">Net Balance Flow</span>
            <span
              className={`font-mono text-lg font-bold flex items-center gap-1 mt-1 ${
                payload.netCashFlowINR >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {payload.netCashFlowINR >= 0 ? "+" : ""}₹{payload.netCashFlowINR.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim block mt-0.5 font-mono">Net liquidity</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-surface-border">
            <span className="text-[10px] text-text-dim block font-mono">Micro-Drains (&lt; ₹100)</span>
            <span className="font-mono text-lg font-bold text-rose-400 flex items-center gap-1 mt-1">
              ₹{payload.microDrainUnder100.totalINR.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim block mt-0.5 font-mono">{payload.microDrainUnder100.count} micro-scans</span>
          </div>

          <div className="p-4 rounded-2xl bg-surface border border-surface-border col-span-2 sm:col-span-1">
            <span className="text-[10px] text-text-dim block font-mono">Small Drains (₹100–₹250)</span>
            <span className="font-mono text-lg font-bold text-amber-400 flex items-center gap-1 mt-1">
              ₹{payload.smallDrain100To250.totalINR.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim block mt-0.5 font-mono">{payload.smallDrain100To250.count} transactions</span>
          </div>
        </div>

        {/* Critical Finding Highlight Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-semibold text-rose-200">
              {teaser.critical_finding.title}
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed">
            {teaser.critical_finding.explanation}
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-rose-300">
            <span>Impacted Transactions: <strong>{teaser.critical_finding.count}</strong></span>
            <span>Total Capital Drained: <strong>₹{teaser.critical_finding.total_inr.toLocaleString("en-IN")}</strong></span>
          </div>
        </div>

        {/* Teaser Hooks List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {teaser.teaser_hooks.map((hook, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-surface-border text-text-dim">
                  Signal #{idx + 1}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {hook.confidence} CONFIDENCE
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">{hook.text}</p>
            </div>
          ))}
        </div>

        {/* Masked Merchant Preview with Transparent Paywall */}
        <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" /> Top Discretionary Outflow Destinations (Preview)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Exact merchant identities are revealed in the complete forensic dossier.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-surface-border text-amber-400">
              5 of 15 Clusters
            </span>
          </div>

          {/* Masked Rows */}
          <div className="space-y-3 filter blur-[1.5px] select-none pointer-events-none opacity-60">
            {teaser.lockedPreview.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/60 border border-surface-border"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-text-dim">0{idx + 1}</span>
                  <div>
                    <p className="text-xs font-semibold text-text-primary font-mono">{item.maskedLabel}</p>
                    <p className="text-[10px] text-text-dim">{item.category} • {item.txCount} transactions</p>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-text-primary">
                  ₹{item.totalINR.toLocaleString("en-IN")}
                </div>
              </div>
            ))}
          </div>

          {/* Paywall Overlay Panel */}
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-gradient-to-t from-black/95 via-black/80 to-black/40">
            <div className="max-w-md w-full p-6 rounded-2xl bg-surface border border-liquidity/30 shadow-2xl text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity mx-auto shadow-emerald-glow">
                <Unlock className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-text-primary">
                  Unlock Your Complete Forensic Dossier
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Reveal unmasked merchant identities, temporal 24x7 heatmap, recurring subscription matrix, and 3 custom 30-day savings rules.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-surface-border flex items-baseline justify-center gap-2">
                <span className="text-2xl font-mono font-bold text-text-primary">₹49</span>
                <span className="text-xs text-text-dim">one-time payment for this audit</span>
              </div>

              <button
                onClick={() => setPayModalOpen(true)}
                className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow flex items-center justify-center gap-2"
              >
                <span>Unlock Full Report (₹49)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-text-dim flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-liquidity" />
                Payment is confirmed securely by our server before your report unlocks.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Razorpay Checkout Modal */}
      <RazorpayModal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        auditId={auditId}
        accessToken={token}
        onSuccess={(url) => {
          setPayModalOpen(false);
          router.push(url);
        }}
      />

      {/* Payload Inspector Modal */}
      <PayloadInspectorModal
        payload={payload}
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />

      <Footer />
    </div>
  );
}
