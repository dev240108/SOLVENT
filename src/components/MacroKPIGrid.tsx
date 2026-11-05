"use client";

import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, QrCode, Zap } from "lucide-react";

interface MacroKPIGridProps {
  totalDebits: number;
  totalCredits: number;
  netCashFlow: number;
  totalDebitCount: number;
  totalCreditCount: number;
  microDrainCount: number;
  microDrainINR: number;
  platformFeesEstimate: number;
}

export function MacroKPIGrid({
  totalDebits,
  totalCredits,
  netCashFlow,
  totalDebitCount,
  totalCreditCount,
  microDrainCount,
  microDrainINR,
  platformFeesEstimate,
}: MacroKPIGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Outflow */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-text-dim text-[11px] font-mono">
          <span>Total Outflow</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="font-mono text-xl font-bold text-text-primary tracking-tight">
          ₹{totalDebits.toLocaleString("en-IN")}
        </div>
        <div className="text-[10px] text-text-dim font-mono">
          {totalDebitCount} debit payments
        </div>
      </div>

      {/* 2. Total Inflow */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-text-dim text-[11px] font-mono">
          <span>Total Inflow</span>
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="font-mono text-xl font-bold text-emerald-400 tracking-tight">
          ₹{totalCredits.toLocaleString("en-IN")}
        </div>
        <div className="text-[10px] text-text-dim font-mono">
          {totalCreditCount} credits / deposits
        </div>
      </div>

      {/* 3. Net Cashflow */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-text-dim text-[11px] font-mono">
          <span>Net Balance Flow</span>
          {netCashFlow >= 0 ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>
        <div
          className={`font-mono text-xl font-bold tracking-tight ${
            netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {netCashFlow >= 0 ? "+" : ""}₹{netCashFlow.toLocaleString("en-IN")}
        </div>
        <div className="text-[10px] text-text-dim font-mono">
          {netCashFlow >= 0 ? "Net surplus retained" : "Net deficit drawdown"}
        </div>
      </div>

      {/* 4. Micro-Drains (< ₹100) */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1 hover:border-zinc-700 transition-colors">
        <div className="flex items-center justify-between text-text-dim text-[11px] font-mono">
          <span>Micro-Drains (&lt; ₹100)</span>
          <QrCode className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="font-mono text-xl font-bold text-rose-400 tracking-tight">
          ₹{microDrainINR.toLocaleString("en-IN")}
        </div>
        <div className="text-[10px] text-text-dim font-mono">
          {microDrainCount} quick UPI scans
        </div>
      </div>

      {/* 5. App & Convenience Fees */}
      <div className="p-4 rounded-2xl bg-surface border border-surface-border space-y-1 hover:border-zinc-700 transition-colors col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between text-text-dim text-[11px] font-mono">
          <span>Delivery & App Fees</span>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="font-mono text-xl font-bold text-amber-400 tracking-tight">
          ₹{platformFeesEstimate.toLocaleString("en-IN")}
        </div>
        <div className="text-[10px] text-text-dim font-mono">
          Estimated surge & platform fees
        </div>
      </div>
    </div>
  );
}
