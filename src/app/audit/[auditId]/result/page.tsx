"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SolvencyGauge } from "@/components/SolvencyGauge";
import { TeaserResponse, AggregatedStatementPayload } from "@/types";
import {
  AlertTriangle,
  ArrowRight,
  Activity,
  ShieldCheck,
  Flame,
  FileText,
  Building2,
  Sparkles,
  BarChart3,
} from "lucide-react";

export default function TeaserResultPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [teaser, setTeaser] = useState<TeaserResponse | null>(null);
  const [payload, setPayload] = useState<AggregatedStatementPayload | null>(null);
  const [tone, setTone] = useState<"NEUTRAL" | "PLAYFUL">("NEUTRAL");

  useEffect(() => {
    if (!auditId) return;

    const savedTeaser = sessionStorage.getItem(`solvent_teaser_${auditId}`);
    const savedPayload = sessionStorage.getItem(`solvent_payload_${auditId}`);

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
        {/* Banner: Status */}
        <div className="p-3.5 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-liquidity shrink-0" />
            <span className="text-text-muted">
              Audit ID: <span className="font-mono text-text-primary">{auditId.slice(0, 8)}...</span> • 100% Free & Unlocked
            </span>
          </div>
          <button
            onClick={() => router.push(`/report/${auditId}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-liquidity text-canvas font-semibold text-[11px] hover:bg-liquidity-hover transition-colors shadow-emerald-glow self-start sm:self-auto"
          >
            <span>View Full Spending Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Summary Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Solvency Index Gauge */}
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border flex flex-col items-center justify-center text-center shadow-card">
            <SolvencyGauge
              score={teaser.spending_index}
              size={180}
              label="Financial Health Score"
              sublabel="Score based on your spending habits (0–100)"
            />

            <div className="mt-5 w-full pt-4 border-t border-surface-border flex items-center justify-between text-xs">
              <span className="text-text-dim">Spending Style</span>
              <span className="font-mono font-semibold text-text-primary px-2.5 py-0.5 rounded-full bg-zinc-900 border border-surface-border">
                {teaser.archetype}
              </span>
            </div>
          </div>

          {/* Forensic Summary & Tone Selector */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-liquidity px-3 py-1 rounded-full bg-liquidity/10 border border-liquidity/20">
                Summary • 100% Free
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
                  <span>Helpful & Clear</span>
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
                  <span>Fun Reality Check</span>
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

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[11px] text-text-dim font-mono">
                <span>Scan Window: {payload.periodStart} to {payload.periodEnd} ({payload.periodDays} days)</span>
                <span>•</span>
                <span>{payload.quality.parsedRows} rows processed</span>
              </div>
              <button
                onClick={() => router.push(`/report/${auditId}`)}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-liquidity hover:text-liquidity-hover underline underline-offset-4"
              >
                <span>View Full Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
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
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
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

        {/* Unlocked Top Merchant Clusters */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border">
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Building2 className="w-4 h-4 text-liquidity" /> Where You Spend Most (Top Stores)
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Your highest spending destinations from your statement.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-surface-border text-emerald-400">
              100% Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {payload.topMerchants.slice(0, 6).map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900/60 border border-surface-border flex flex-col justify-between space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-text-dim">0{idx + 1}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {item.categoryHint?.replace(/_/g, " ") || "Merchant"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary font-mono">{item.displayName || item.merchantKey}</p>
                  <p className="text-[11px] text-text-dim">{item.txCount} transactions recorded</p>
                </div>
                <div className="pt-2 border-t border-surface-border flex justify-between items-baseline">
                  <span className="text-[10px] text-text-dim font-mono">Total Outflow</span>
                  <span className="font-mono text-sm font-bold text-text-primary">
                    ₹{item.totalINR.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Full Report Action Callout */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-surface to-surface border border-liquidity/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-liquidity flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Complete Spending Report Available
              </span>
              <p className="text-sm text-text-primary font-medium">
                Time-of-day spending, regular monthly bills, simple savings plan & exports are ready.
              </p>
            </div>
            <button
              onClick={() => router.push(`/report/${auditId}`)}
              className="px-6 py-3 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow flex items-center gap-2 shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Open Complete Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
