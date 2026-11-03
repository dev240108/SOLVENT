"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Activity, ShieldCheck, CheckCircle2, Terminal } from "lucide-react";

export default function ProcessingPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;

  const stages = [
    { label: "Reading statement layout", sub: "Detecting bank / UPI schema adapter" },
    { label: "Normalizing transaction records", sub: "Standardizing ISO dates & Indian rupee formats" },
    { label: "Scrubbing sensitive identifiers", sub: "Purging account numbers, names, and VPAs" },
    { label: "Grouping merchant clusters", sub: "Deterministic frequency & ticket size clustering" },
    { label: "Preparing diagnostic teaser", sub: "Computing Spending Pattern Index & micro-drains" },
  ];

  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/audit/${auditId}/result`);
          }, 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [auditId, router, stages.length]);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={false} />

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto w-full">
        <div className="glass-panel rounded-3xl p-8 border border-surface-border w-full space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity mx-auto animate-pulse">
            <Activity className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Processing Statement Locally
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Deterministic parsing in browser sandbox. Original file is not uploaded.
            </p>
          </div>

          {/* Progress Stages */}
          <div className="space-y-3 text-left pt-2">
            {stages.map((stage, idx) => {
              const isDone = idx < currentStage;
              const isCurrent = idx === currentStage;

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-zinc-900 border-liquidity/40 text-text-primary"
                      : isDone
                      ? "bg-zinc-950/60 border-surface-border text-text-muted opacity-80"
                      : "border-transparent text-text-dim opacity-40"
                  }`}
                >
                  <div className="mt-0.5">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-liquidity" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 rounded-full border-2 border-liquidity border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-zinc-700" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{stage.label}</p>
                    <p className="text-[10px] text-text-dim">{stage.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-text-dim flex items-center justify-center gap-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-liquidity" />
            <span>Capability Token Protected</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
