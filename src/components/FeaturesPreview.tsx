"use client";

import { Check, ArrowUpRight, Zap, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export function FeaturesPreview() {
  return (
    <section id="features" className="py-20 border-t border-surface-border bg-canvas relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy & Benefits */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Detailed Insights • 100% Free</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
              Get the Full Forensic Dossier.
            </h2>

            <p className="text-sm text-text-muted leading-relaxed">
              Explore deep forensic insights including complete merchant breakdowns, hidden subscription leaks, and 3 actionable 30-day liquidity rules computed deterministically in seconds.
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                { title: "Complete 15-Merchant Leaderboard", desc: "Category mapping, total outflow, and average ticket size." },
                { title: "Recurring Subscriptions Matrix", desc: "Identifies monthly auto-debits and hidden recurring charges." },
                { title: "3 Personalized 30-Day Liquidity Rules", desc: "Interactive caps with exact formulas to optimize cash retention." },
                { title: "Temporal Day/Night Spending Heatmap", desc: "Pinpoint peak outflow hours and midnight impulsive cart checkout." },
                { title: "9:16 Anonymized Social Story Card", desc: "Share your spending diagnosis without revealing account details or balances." },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">{item.title}</h4>
                    <p className="text-[11px] text-text-dim">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/audit/new"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
              >
                <span>Analyze Your Statement Free</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-text-dim flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-liquidity" /> 100% Free • No Sign-up Required
              </span>
            </div>
          </div>

          {/* Right: Interactive Mockup Card */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 relative border border-surface-border shadow-card">
              <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-liquidity" />
                  <span className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">
                    Solvent Forensic Dossier Preview
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  Illustrative Sample Data
                </span>
              </div>

              {/* Sample Merchant Leaderboard Preview */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-medium text-text-muted flex justify-between">
                  <span>Merchant Cluster</span>
                  <span>Total Outflow</span>
                </div>

                {[
                  { rank: "1", name: "ZOMATO", cat: "Food Delivery", amount: "₹5,420", count: "19 orders", pct: "38%" },
                  { rank: "2", name: "BLINKIT", cat: "Quick Commerce", amount: "₹4,890", count: "27 orders", pct: "34%" },
                  { rank: "3", name: "TAPRI / CHAI MICRO-QR", cat: "Micro-Drains", amount: "₹2,150", count: "64 scans", pct: "15%" },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-surface-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-text-dim w-4">{row.rank}</span>
                      <div>
                        <p className="text-xs font-semibold text-text-primary font-mono">{row.name}</p>
                        <p className="text-[10px] text-text-dim">{row.cat} • {row.count}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-bold text-text-primary">{row.amount}</p>
                      <span className="text-[10px] text-rose-400 font-mono">{row.pct} of discretionary</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Potential Monthly Savings Highlight */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-surface to-surface border border-liquidity/20 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-liquidity flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> 30-Day Liquidity Potential
                  </span>
                  <p className="text-2xl font-mono font-bold text-text-primary">
                    ₹4,650 <span className="text-xs font-sans font-normal text-text-muted">/ month recoverable</span>
                  </p>
                  <p className="text-[11px] text-text-dim">
                    By bundling quick commerce carts and capping micro-drains below ₹100.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
