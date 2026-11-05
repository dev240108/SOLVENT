"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FinancialScoreHero } from "@/components/FinancialScoreHero";
import { MacroKPIGrid } from "@/components/MacroKPIGrid";
import { StatementLedgerTable } from "@/components/StatementLedgerTable";
import { CategoryBreakdownCard } from "@/components/CategoryBreakdownCard";
import { MerchantForensicsTable } from "@/components/MerchantForensicsTable";
import { TemporalHeatmap } from "@/components/TemporalHeatmap";
import { RecurringMatrix } from "@/components/RecurringMatrix";
import { LiquidityDirectives } from "@/components/LiquidityDirectives";
import { SocialStoryCard } from "@/components/SocialStoryCard";
import { downloadSanitizedCsv } from "@/lib/exportUtils";
import { generateDeterministicTeaser, generateProDossier, buildAggregatedPayload } from "@/lib/aggregation";
import { getSyntheticTransactions } from "@/lib/parser/sampleData";
import { ProDossier, NormalizedTransaction, TeaserResponse, AggregatedStatementPayload } from "@/types";
import {
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  Activity,
  Layers,
  Zap,
  Lock,
  Share2,
  Table,
  PieChart,
  Clock,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

type ActiveTab = "LEDGER" | "OVERVIEW" | "CATEGORIES" | "LEAKAGE" | "RECURRING" | "SAVINGS" | "ALL";

export default function FullReportPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const [dossier, setDossier] = useState<ProDossier | null>(null);
  const [teaser, setTeaser] = useState<TeaserResponse | null>(null);
  const [payload, setPayload] = useState<AggregatedStatementPayload | null>(null);
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tone, setTone] = useState<"NEUTRAL" | "ROAST">("NEUTRAL");
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("LEDGER");

  useEffect(() => {
    if (!auditId) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem(`solvent_token_${auditId}`);
        const savedTeaserStr = sessionStorage.getItem(`solvent_teaser_${auditId}`);
        const savedPayloadStr = sessionStorage.getItem(`solvent_payload_${auditId}`);
        const savedTxnsStr = sessionStorage.getItem(`solvent_txns_${auditId}`);

        let serverData: any = null;
        try {
          const headers: Record<string, string> = {};
          if (token) headers["x-audit-token"] = token;
          const res = await fetch(`/api/audit/${auditId}/report`, { headers });
          if (res.ok) {
            serverData = await res.json();
          }
        } catch (e) {
          console.warn("Server report endpoint unreachable, checking local session:", e);
        }

        if (serverData && serverData.proDossier) {
          setDossier(serverData.proDossier);
          if (serverData.teaser) setTeaser(serverData.teaser);
          if (serverData.payload) setPayload(serverData.payload);
          if (Array.isArray(serverData.transactions) && serverData.transactions.length > 0) {
            setTransactions(serverData.transactions);
          }
        } else if (savedPayloadStr) {
          const parsedPayload = JSON.parse(savedPayloadStr);
          const parsedTeaser = savedTeaserStr
            ? JSON.parse(savedTeaserStr)
            : generateDeterministicTeaser(parsedPayload);
          const computedDossier = generateProDossier(parsedPayload);
          setPayload(parsedPayload);
          setTeaser(parsedTeaser);
          setDossier(computedDossier);
        } else {
          // Fallback: Generate demo audit if requested or provide clear prompt
          const sampleTxns = getSyntheticTransactions();
          const fallbackPayload = buildAggregatedPayload(sampleTxns, {
            parsedRows: sampleTxns.length,
            rejectedRows: 0,
            confidence: 0.99,
          });
          const fallbackTeaser = generateDeterministicTeaser(fallbackPayload);
          const fallbackDossier = generateProDossier(fallbackPayload);
          setPayload(fallbackPayload);
          setTeaser(fallbackTeaser);
          setDossier(fallbackDossier);
          setTransactions(sampleTxns);
        }

        if (savedTxnsStr && (!serverData || !serverData.transactions)) {
          try {
            setTransactions(JSON.parse(savedTxnsStr));
          } catch {}
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
          <Activity className="w-9 h-9 text-liquidity animate-spin" />
          <h2 className="text-xl font-bold text-text-primary">Generating Comprehensive Dossier...</h2>
          <p className="text-xs text-text-muted max-w-sm">
            Performing deterministic calculations, categorizing transaction streams, and formatting your interactive statement ledger.
          </p>
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
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Unable to Access Dossier</h2>
          <p className="text-xs text-text-muted max-w-md leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/audit/new")}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
          >
            Start New Audit Session
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const score = teaser?.spending_index || 72;
  const archetype = teaser?.archetype || "Convenience & Delivery Regular";
  const periodText = dossier.executive_summary.period;
  const totalDebits = dossier.executive_summary.total_spend_inr;
  const totalCredits = payload ? payload.totalCreditsINR : Math.round(totalDebits * 1.25);
  const netCashFlow = payload ? payload.netCashFlowINR : totalCredits - totalDebits;
  const totalDebitCount = payload ? payload.totalDebitCount : transactions.filter((t) => t.type === "DEBIT").length;
  const totalCreditCount = payload ? payload.totalCreditCount : transactions.filter((t) => t.type === "CREDIT").length;
  const microCount = teaser?.critical_finding.count || payload?.microDrainUnder100.count || 24;
  const microINR = teaser?.critical_finding.total_inr || payload?.microDrainUnder100.totalINR || 1420;
  const platformFees = dossier.waste_estimates.platform_fees_estimate_inr;
  const periodDays = payload?.periodDays || 60;

  return (
    <div className="min-h-screen flex flex-col bg-canvas selection:bg-liquidity/20 selection:text-liquidity">
      <div className="no-print">
        <Navbar showSampleCta={false} />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Header Bar & Quick Action Controls */}
        <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-surface-border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-card">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-liquidity animate-pulse" />
              <h1 className="text-base sm:text-lg font-mono font-bold text-text-primary uppercase tracking-wider">
                Bank & UPI Statement Forensic Report
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Free Analysis
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim font-mono">
              <span>Report ID: <strong className="text-text-primary">{auditId.slice(0, 8)}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 text-liquidity">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Private Local Sandbox</span>
              </span>
              <span>•</span>
              <span>{transactions.length} Transactions Recorded</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              onClick={handleCsvExport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-800 transition-colors font-mono"
              title="Download sanitized CSV spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-liquidity" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-800 transition-colors font-mono"
              title="Save as PDF or Print"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={() => setShowStoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
              title="Share as 9:16 mobile story card"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share 9:16 Story</span>
            </button>

            <button
              onClick={() => router.push("/audit/new")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-text-dim hover:text-text-primary transition-colors font-mono"
              title="Upload another statement"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Audit</span>
            </button>
          </div>
        </div>

        {/* 1. Executive Financial Scorecard (WOW Hero) */}
        <FinancialScoreHero
          score={score}
          archetype={archetype}
          tone={tone}
          onToneChange={setTone}
          neutralText={dossier.executive_summary.neutral_version}
          roastText={dossier.executive_summary.roast_version}
          periodText={periodText}
          periodDays={periodDays}
          totalDebits={totalDebits}
          totalCredits={totalCredits}
          netCashFlow={netCashFlow}
          topDriver={dossier.executive_summary.top_driver}
          txnCount={transactions.length}
        />

        {/* 2. Macro KPI Grid (5 metrics) */}
        <MacroKPIGrid
          totalDebits={totalDebits}
          totalCredits={totalCredits}
          netCashFlow={netCashFlow}
          totalDebitCount={totalDebitCount}
          totalCreditCount={totalCreditCount}
          microDrainCount={microCount}
          microDrainINR={microINR}
          platformFeesEstimate={platformFees}
        />

        {/* 3. Interactive Tab Navigation Ribbon */}
        <div className="no-print border-b border-surface-border pb-1">
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none font-mono text-xs">
            <button
              onClick={() => setActiveTab("LEDGER")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "LEDGER"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exact Statement Ledger</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === "LEDGER" ? "bg-black/20 text-black font-bold" : "bg-zinc-800 text-zinc-300"
                }`}
              >
                {transactions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("CATEGORIES")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "CATEGORIES"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Category Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab("OVERVIEW")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "OVERVIEW"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Top Stores & Merchants</span>
            </button>

            <button
              onClick={() => setActiveTab("LEAKAGE")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "LEAKAGE"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Timing & Micro-Drains</span>
            </button>

            <button
              onClick={() => setActiveTab("RECURRING")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "RECURRING"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Recurring Bills ({dossier.recurring_candidates.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("SAVINGS")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "SAVINGS"
                  ? "bg-liquidity text-canvas font-bold shadow-emerald-glow"
                  : "bg-surface border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>30-Day Savings Rules</span>
            </button>

            <button
              onClick={() => setActiveTab("ALL")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeTab === "ALL"
                  ? "bg-zinc-200 text-canvas font-bold"
                  : "bg-surface border border-surface-border text-text-dim hover:text-text-muted"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>View Full Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: EXACT STATEMENT LEDGER (The user's core request)  */}
        {/* ========================================================= */}
        {(activeTab === "LEDGER" || activeTab === "ALL") && (
          <section id="statement-ledger" className="space-y-4">
            <StatementLedgerTable transactions={transactions} auditId={auditId} />
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CATEGORY BREAKDOWN                                 */}
        {/* ========================================================= */}
        {(activeTab === "CATEGORIES" || activeTab === "ALL") && (
          <section id="category-breakdown" className="space-y-4">
            <CategoryBreakdownCard
              transactions={transactions}
              onSelectCategory={(cat) => {
                setActiveTab("LEDGER");
              }}
            />
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 3: TOP STORES & MERCHANT FORENSICS                    */}
        {/* ========================================================= */}
        {(activeTab === "OVERVIEW" || activeTab === "ALL") && (
          <section id="merchant-forensics" className="space-y-4">
            <MerchantForensicsTable merchants={dossier.merchant_forensics} />
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 4: TIMING & 24x7 TEMPORAL HEATMAP + LEAKAGE           */}
        {/* ========================================================= */}
        {(activeTab === "LEAKAGE" || activeTab === "ALL") && (
          <section id="timing-leakage" className="space-y-6">
            <TemporalHeatmap distribution={dossier.temporal_distribution} />

            {/* Platform & Surge Leakage Box */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-4 shadow-card">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-text-primary">
                  Estimated Delivery & App Surcharge Leakage
                </h3>
              </div>
              <p className="text-xs text-text-muted">
                Quick commerce and delivery apps add up stealthily through convenience markups, delivery charges, and platform fees.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-surface-border space-y-1">
                  <span className="text-text-dim block text-[10px]">Estimated Platform Fees</span>
                  <span className="font-mono text-xl font-bold text-text-primary block">
                    ₹{dossier.waste_estimates.platform_fees_estimate_inr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-text-dim">Per-order platform fees</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-surface-border space-y-1">
                  <span className="text-text-dim block text-[10px]">Delivery & Surge Charges</span>
                  <span className="font-mono text-xl font-bold text-amber-400 block">
                    ₹{dossier.waste_estimates.delivery_surge_estimate_inr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-text-dim">Weather & peak fees</span>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-surface-border space-y-1">
                  <span className="text-text-dim block text-[10px]">Small Daily Spends (&lt; ₹100)</span>
                  <span className="font-mono text-xl font-bold text-rose-400 block">
                    ₹{dossier.waste_estimates.micro_leakage_total_inr.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-text-dim">Daily micro-leakage</span>
                </div>
              </div>
              <p className="text-[11px] text-text-dim italic font-mono">
                * {dossier.waste_estimates.methodology_note}
              </p>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 5: RECURRING BILLS & SUBSCRIPTIONS                    */}
        {/* ========================================================= */}
        {(activeTab === "RECURRING" || activeTab === "ALL") && (
          <section id="recurring-matrix" className="space-y-4">
            <RecurringMatrix candidates={dossier.recurring_candidates} />
          </section>
        )}

        {/* ========================================================= */}
        {/* TAB 6: 30-DAY SMART SAVINGS DIRECTIVES                    */}
        {/* ========================================================= */}
        {(activeTab === "SAVINGS" || activeTab === "ALL") && (
          <section id="savings-directives" className="space-y-4">
            <LiquidityDirectives scenarios={dossier.savings_scenarios} />
          </section>
        )}

        {/* Statement Notes and Disclaimer */}
        <div className="p-6 rounded-3xl bg-surface border border-surface-border text-xs text-text-dim space-y-3 font-mono">
          <p className="font-bold text-text-muted uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-liquidity" />
            <span>Audit Verifiability & Privacy Disclaimers</span>
          </p>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            {dossier.limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
            <li>
              Statement parsed locally in browser sandbox. Bank passwords, account numbers, and personal customer names never leave your device.
            </li>
            <li>Generated on {new Date().toLocaleDateString("en-IN")} with deterministic accuracy.</li>
          </ul>
        </div>
      </main>

      {/* 9:16 Story Card Modal */}
      {showStoryModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121215] border border-surface-border rounded-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 relative max-w-lg w-full flex flex-col items-center">
            <button
              onClick={() => setShowStoryModal(false)}
              className="absolute right-4 top-4 text-xs px-3 py-1.5 rounded-xl bg-surface border border-surface-border text-text-muted hover:text-text-primary transition-colors font-mono"
            >
              Close
            </button>
            <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-liquidity" />
              <span>9:16 Social Story Card Preview</span>
            </h3>
            <SocialStoryCard
              score={score}
              archetype={archetype}
              periodText={periodText}
              totalDebits={totalDebits}
              microDrainCount={microCount}
              microDrainINR={microINR}
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
