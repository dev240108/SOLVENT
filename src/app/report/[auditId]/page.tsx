"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MerchantForensicsTable } from "@/components/MerchantForensicsTable";
import { TemporalHeatmap } from "@/components/TemporalHeatmap";
import { RecurringMatrix } from "@/components/RecurringMatrix";
import { LiquidityDirectives } from "@/components/LiquidityDirectives";
import { SocialStoryCard } from "@/components/SocialStoryCard";
import { downloadSanitizedCsv } from "@/lib/exportUtils";
import { ProDossier, NormalizedTransaction, TeaserResponse } from "@/types";
import {
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  Flame,
  FileText,
  Activity,
  Layers,
  Zap,
  TrendingDown,
  Lock,
  Share2,
} from "lucide-react";

export default function FullReportPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [dossier, setDossier] = useState<ProDossier | null>(null);
  const [teaser, setTeaser] = useState<TeaserResponse | null>(null);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<"NEUTRAL" | "ROAST">("NEUTRAL");
  const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    if (!auditId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem(`solvent_token_${auditId}`);

        if (!token) {
          throw new Error("Missing audit capability token. Please start an audit session.");
        }

        const res = await fetch(`/api/audit/${auditId}/report`, {
          headers: {
            "x-audit-token": token,
          },
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to load paid dossier.");
        }

        const data = await res.json();
        setDossier(data.proDossier);
        if (data.teaser) setTeaser(data.teaser);

        const savedTxns = sessionStorage.getItem(`solvent_txns_${auditId}`);
        if (savedTxns) {
          setTransactions(JSON.parse(savedTxns));
        }
      } catch (err: any) {
        setError(err.message || "Error fetching report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [auditId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCsvExport = () => {
    if (transactions.length > 0) {
      downloadSanitizedCsv(transactions, `solvent-dossier-${auditId.slice(0, 8)}`);
    } else {
      alert("No transaction records found in browser session for CSV export.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar showSampleCta={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <Activity className="w-8 h-8 text-liquidity animate-spin" />
          <h2 className="text-lg font-semibold text-text-primary">Loading full forensic dossier...</h2>
          <p className="text-xs text-text-muted">Verifying capability token and decrypting report data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas">
        <Navbar showSampleCta={false} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Unable to Access Dossier</h2>
          <p className="text-xs text-text-muted max-w-md">{error}</p>
          <button
            onClick={() => router.push(`/audit/${auditId}/result`)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-liquidity text-canvas"
          >
            Return to Teaser & Checkout
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <div className="no-print">
        <Navbar showSampleCta={false} />
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Bar with Export Options */}
        <div className="p-4 rounded-2xl bg-surface border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-liquidity" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                Unlocked Forensic Dossier
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Paid Access
              </span>
            </div>
            <p className="text-xs text-text-dim">
              Audit ID: <span className="font-mono text-text-primary">{auditId}</span> • Retained for 30 days
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCsvExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-800 transition-colors font-mono"
            >
              <Download className="w-3.5 h-3.5 text-liquidity" />
              <span>Sanitized CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-800 transition-colors font-mono"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Save as PDF / Print</span>
            </button>

            <button
              onClick={() => setShowStoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>9:16 Social Story</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-widest text-liquidity px-3 py-1 rounded-full bg-liquidity/10 border border-liquidity/20">
                Executive Synthesis
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                Forensic Spending Diagnosis
              </h2>
            </div>

            {/* Tone Toggle */}
            <div className="no-print inline-flex p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono self-start sm:self-auto">
              <button
                onClick={() => setTone("NEUTRAL")}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  tone === "NEUTRAL"
                    ? "bg-zinc-800 text-text-primary font-semibold"
                    : "text-text-dim hover:text-text-muted"
                }`}
              >
                <FileText className="w-3 h-3 text-liquidity" />
                <span>Auditor Mode</span>
              </button>
              <button
                onClick={() => setTone("ROAST")}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                  tone === "ROAST"
                    ? "bg-zinc-800 text-text-primary font-semibold"
                    : "text-text-dim hover:text-text-muted"
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                <span>Roast Mode</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Audit Horizon</span>
              <span className="font-semibold text-text-primary mt-1 block">
                {dossier.executive_summary.period}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Gross Discretionary Outflow</span>
              <span className="font-semibold text-text-primary mt-1 block">
                ₹{dossier.executive_summary.total_spend_inr.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Top Cash Driver</span>
              <span className="font-semibold text-rose-400 mt-1 block">
                {dossier.executive_summary.top_driver}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/40 border border-surface-border text-xs sm:text-sm text-text-muted leading-relaxed">
            {tone === "NEUTRAL" ? (
              <p>{dossier.executive_summary.neutral_version}</p>
            ) : (
              <p>{dossier.executive_summary.roast_version}</p>
            )}
          </div>
        </div>

        {/* 1. Merchant Forensics Leaderboard */}
        <MerchantForensicsTable merchants={dossier.merchant_forensics} />

        {/* 2. Temporal 24x7 Spending Heatmap */}
        <TemporalHeatmap distribution={dossier.temporal_distribution} />

        {/* 3. Recurring Subscriptions Matrix */}
        <RecurringMatrix candidates={dossier.recurring_candidates} />

        {/* 4. Actionable 30-Day Liquidity Directives */}
        <LiquidityDirectives scenarios={dossier.savings_scenarios} />

        {/* Leakage & Platform Fee Assumptions Box */}
        <div className="glass-panel rounded-2xl p-6 border border-surface-border space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-text-primary">
              Estimated Delivery & Platform Markup Surcharges
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Estimated Platform Fees</span>
              <span className="font-mono text-base font-bold text-text-primary mt-1 block">
                ₹{dossier.waste_estimates.platform_fees_estimate_inr.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Delivery & Surge Markups</span>
              <span className="font-mono text-base font-bold text-text-primary mt-1 block">
                ₹{dossier.waste_estimates.delivery_surge_estimate_inr.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border">
              <span className="text-text-dim block">Micro-Drain Friction (&lt; ₹100)</span>
              <span className="font-mono text-base font-bold text-rose-400 mt-1 block">
                ₹{dossier.waste_estimates.micro_leakage_total_inr.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-text-dim italic">
            * {dossier.waste_estimates.methodology_note}
          </p>
        </div>

        {/* Report Disclaimers and Limitations */}
        <div className="p-5 rounded-2xl bg-surface border border-surface-border text-[11px] text-text-dim space-y-2">
          <p className="font-semibold text-text-muted uppercase tracking-wider font-mono">
            Audit Disclaimers & Methodology Notes
          </p>
          <ul className="list-disc list-inside space-y-1">
            {dossier.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
            <li>Prepared by Solvent (solvent.money) on {new Date().toLocaleDateString("en-IN")}.</li>
          </ul>
        </div>
      </main>

      {/* 9:16 Story Card Modal */}
      {showStoryModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121215] border border-surface-border rounded-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative max-w-lg w-full flex flex-col items-center">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute right-4 top-4 text-xs px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-text-muted hover:text-text-primary"
            >
              Close
            </button>
            <h3 className="text-base font-semibold text-text-primary mb-4">
              9:16 Social Story Card Preview
            </h3>
            <SocialStoryCard
              score={teaser?.spending_index || 72}
              archetype={teaser?.archetype || "Frequent Convenience Buyer"}
              periodText={dossier.executive_summary.period}
              totalDebits={dossier.executive_summary.total_spend_inr}
              microDrainCount={teaser?.critical_finding.count || 94}
              microDrainINR={teaser?.critical_finding.total_inr || 4120}
              verdict={dossier.executive_summary.neutral_version}
            />
          </div>
        </div>
      )}

      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
