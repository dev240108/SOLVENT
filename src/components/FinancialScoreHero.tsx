"use client";

import { SolvencyGauge } from "./SolvencyGauge";
import { Flame, FileText, Calendar } from "lucide-react";

interface FinancialScoreHeroProps {
  score: number;
  archetype: string;
  tone: "NEUTRAL" | "ROAST";
  onToneChange: (tone: "NEUTRAL" | "ROAST") => void;
  neutralText: string;
  roastText: string;
  periodText: string;
  periodDays: number;
  totalDebits: number;
  totalCredits: number;
  netCashFlow: number;
  topDriver: string;
  txnCount: number;
}

export function FinancialScoreHero({
  score,
  archetype,
  tone,
  onToneChange,
  neutralText,
  roastText,
  periodText,
  periodDays,
  totalDebits,
  totalCredits,
  netCashFlow,
  topDriver,
  txnCount,
}: FinancialScoreHeroProps) {
  const dailyBurn = periodDays > 0 ? Math.round(totalDebits / periodDays) : totalDebits;
  const savingsRate =
    totalCredits > 0 ? Math.round((netCashFlow / totalCredits) * 100) : 0;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6 shadow-card relative overflow-hidden">
      {/* Background glow subtle effect */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-liquidity/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Bar with Tone Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-liquidity animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-liquidity px-3 py-1 rounded-full bg-liquidity/10 border border-liquidity/20">
            Automated Financial Health Assessment
          </span>
        </div>

        {/* Tone Selector */}
        <div className="no-print inline-flex p-1 rounded-2xl bg-surface border border-surface-border text-xs font-mono self-start sm:self-auto">
          <button
            onClick={() => onToneChange("NEUTRAL")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tone === "NEUTRAL"
                ? "bg-zinc-800 text-text-primary font-semibold shadow-sm"
                : "text-text-dim hover:text-text-muted"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-liquidity" />
            <span>Professional Summary</span>
          </button>
          <button
            onClick={() => onToneChange("ROAST")}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              tone === "ROAST"
                ? "bg-zinc-800 text-rose-400 font-semibold shadow-sm"
                : "text-text-dim hover:text-text-muted"
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Fun Reality Check</span>
          </button>
        </div>
      </div>

      {/* Core Grid: Score Gauge + Text Diagnosis + Executive Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left: Score Gauge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-950/60 border border-surface-border text-center">
          <SolvencyGauge
            score={score}
            size={180}
            label="Financial Health Score"
            sublabel="Based on spending stability & impulse leak ratio"
          />

          <div className="mt-4 w-full pt-3 border-t border-surface-border flex items-center justify-between text-xs font-mono">
            <span className="text-text-dim">Spending Persona</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-surface-border text-text-primary font-semibold">
              {archetype}
            </span>
          </div>
        </div>

        {/* Center: Diagnosis Text */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Your statement, decoded.
          </h2>

          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/80 border border-surface-border text-xs sm:text-sm text-text-muted leading-relaxed">
            {tone === "NEUTRAL" ? (
              <p>{neutralText}</p>
            ) : (
              <p className="text-zinc-200">{roastText}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-dim font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-liquidity" />
              <span>{periodText} ({periodDays} Days)</span>
            </span>
            <span>•</span>
            <span>{txnCount} transactions analyzed</span>
          </div>
        </div>

        {/* Right: Quick Executive Stats */}
        <div className="lg:col-span-3 space-y-3">
          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-surface-border space-y-1 font-mono">
            <span className="text-[10px] text-text-dim block">Average Daily Spend</span>
            <span className="text-base font-bold text-text-primary flex items-center gap-1">
              ₹{dailyBurn.toLocaleString("en-IN")}/day
            </span>
            <span className="text-[10px] text-text-dim">Daily outflow velocity</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-surface-border space-y-1 font-mono">
            <span className="text-[10px] text-text-dim block">Net Savings Margin</span>
            <span
              className={`text-base font-bold flex items-center gap-1 ${
                netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {netCashFlow >= 0 ? "+" : ""}₹{netCashFlow.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-text-dim">
              {totalCredits > 0 ? `${savingsRate}% of inflow retained` : "No credit rows found"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-surface-border space-y-1 font-mono">
            <span className="text-[10px] text-text-dim block">Top Spending Store</span>
            <span className="text-sm font-bold text-rose-300 truncate block">
              {topDriver}
            </span>
            <span className="text-[10px] text-text-dim">Largest lifestyle driver</span>
          </div>
        </div>
      </div>
    </div>
  );
}
