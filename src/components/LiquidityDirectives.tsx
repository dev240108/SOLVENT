"use client";

import { useState } from "react";
import { SavingsScenario } from "@/types";
import { Sliders, Calculator, Check, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface LiquidityDirectivesProps {
  scenarios: SavingsScenario[];
}

export function LiquidityDirectives({ scenarios }: LiquidityDirectivesProps) {
  // Let user tweak the target reduction percentage with dynamic recalculation
  const [customPercents, setCustomPercents] = useState<number[]>([40, 30, 50]);

  const updatePercent = (index: number, val: number) => {
    setCustomPercents((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const totalProjectedSavings = scenarios.reduce((acc, s, i) => {
    const pct = (customPercents[i] ?? 35) / 100;
    return acc + Math.round(s.baseline_inr * pct);
  }, 0);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Calculator className="w-4 h-4 text-liquidity" /> 30-Day Actionable Liquidity Directives
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Practical spending caps derived from your deterministic statement baselines.
          </p>
        </div>

        {/* Dynamic Aggregated Savings Badge */}
        <div className="p-3 rounded-xl bg-liquidity/10 border border-liquidity/20 flex items-center gap-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-liquidity block">
              Combined Monthly Potential
            </span>
            <span className="font-mono text-lg font-bold text-text-primary">
              ₹{totalProjectedSavings.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, idx) => {
          const currentPct = customPercents[idx] ?? 35;
          const dynamicReduction = Math.round(scenario.baseline_inr * (currentPct / 100));
          const dynamicTarget = scenario.baseline_inr - dynamicReduction;

          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between space-y-5 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-surface-border text-liquidity">
                    Directive #{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-text-dim">30 Days</span>
                </div>

                <h4 className="text-sm font-semibold text-text-primary leading-snug">
                  {scenario.title}
                </h4>

                {/* Baselines comparison */}
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-surface-border space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Observed Baseline</span>
                    <span className="font-mono text-text-muted">₹{scenario.baseline_inr.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Target 30-Day Cap</span>
                    <span className="font-mono font-semibold text-text-primary">
                      ₹{dynamicTarget.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-surface-border text-liquidity">
                    <span className="font-medium">Potential Retention</span>
                    <span className="font-mono font-bold">+₹{dynamicReduction.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Interactive Target Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-text-dim flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-text-dim" /> Target Reduction
                    </span>
                    <span className="font-mono font-semibold text-text-primary">{currentPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="75"
                    step="5"
                    value={currentPct}
                    onChange={(e) => updatePercent(idx, parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Assumptions & Formula Footnote */}
              <div className="space-y-1 pt-2 border-t border-surface-border text-[10px] text-text-dim">
                <p className="font-mono text-zinc-400 truncate">
                  Formula: {scenario.formula}
                </p>
                {scenario.assumptions[0] && (
                  <p className="italic text-zinc-500">&bull; {scenario.assumptions[0]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-dim text-center pt-2">
        <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-liquidity" />
        Mathematical simulation: Potential reduction based on the scenario shown; not guaranteed savings.
      </p>
    </div>
  );
}
