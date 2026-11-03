"use client";

import { useState } from "react";
import { RecurringCandidate } from "@/types";
import { RefreshCw, CheckCircle, HelpCircle, XCircle, ShieldAlert } from "lucide-react";

interface RecurringMatrixProps {
  candidates: RecurringCandidate[];
}

export function RecurringMatrix({ candidates }: RecurringMatrixProps) {
  const [items, setItems] = useState<RecurringCandidate[]>(candidates);

  const setStatus = (idx: number, status: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, user_action: status } : item))
    );
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-liquidity" /> Candidate Recurring Debits & Autopay
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Repeated charges detected with predictable billing cadences. Review each candidate to verify ongoing utility.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-surface-border text-text-muted">
          {items.length} Candidates Detected
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-text-dim py-6 text-center">
          No repeated recurring debit patterns identified in this statement period.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border text-text-dim uppercase font-mono tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Service / Recipient</th>
                <th className="pb-3 font-semibold">Cadence</th>
                <th className="pb-3 font-semibold">Billed Amount</th>
                <th className="pb-3 font-semibold">Confidence</th>
                <th className="pb-3 font-semibold text-right">Your Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-muted transition-colors">
                  <td className="py-3.5 pr-4">
                    <span className="font-semibold text-text-primary block font-mono">
                      {item.display_name || item.merchant_key}
                    </span>
                    <span className="text-[10px] text-text-dim">
                      Observed: {item.observed_dates.join(" & ")}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-text-muted">
                      {item.cadence}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono font-semibold text-text-primary">
                    ₹{item.amounts_inr[0]?.toLocaleString("en-IN") || "--"}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono ${
                        item.confidence === "HIGH"
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                          : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                      }`}
                    >
                      {item.confidence}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-1.5">
                    <button
                      onClick={() => setStatus(idx, "Recognized")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        item.user_action === "Recognized"
                          ? "bg-liquidity text-canvas font-semibold"
                          : "bg-surface border border-surface-border text-text-dim hover:text-text-primary"
                      }`}
                    >
                      Keep Active
                    </button>
                    <button
                      onClick={() => setStatus(idx, "Investigate")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        item.user_action === "Investigate"
                          ? "bg-amber-500 text-canvas font-semibold"
                          : "bg-surface border border-surface-border text-text-dim hover:text-text-primary"
                      }`}
                    >
                      Investigate
                    </button>
                    <button
                      onClick={() => setStatus(idx, "Not a subscription")}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        item.user_action === "Not a subscription"
                          ? "bg-rose-500 text-canvas font-semibold"
                          : "bg-surface border border-surface-border text-text-dim hover:text-text-primary"
                      }`}
                    >
                      Not Recurring
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="pt-2 text-[11px] text-text-dim flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-text-dim shrink-0" />
        <span>
          Possible recurring payments — review these directly with your bank or provider. Solvent does not execute autopay modifications or cancellations.
        </span>
      </div>
    </div>
  );
}
