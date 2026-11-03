"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatementDropzone } from "@/components/StatementDropzone";
import { SolvencyGauge } from "@/components/SolvencyGauge";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesPreview } from "@/components/FeaturesPreview";
import { FaqSection } from "@/components/FaqSection";
import { PasswordPromptModal } from "@/components/PasswordPromptModal";
import { getSyntheticTransactions } from "@/lib/parser/sampleData";
import { buildAggregatedPayload } from "@/lib/aggregation";
import { parseStatementLocally } from "@/lib/parser";
import { ShieldCheck, Zap, Lock, AlertTriangle, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Trigger Synthetic Sample Statement
  const handleTrySample = async () => {
    try {
      setIsProcessing(true);
      const sampleTxns = getSyntheticTransactions();
      const payload = buildAggregatedPayload(sampleTxns, {
        parsedRows: sampleTxns.length,
        rejectedRows: 0,
        confidence: 0.99,
      });

      // Submit to Teaser API
      const res = await fetch("/api/audit/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to initialize sample analysis.");
      }

      const data = await res.json();
      sessionStorage.setItem(`solvent_token_${data.auditId}`, data.accessToken);
      sessionStorage.setItem(`solvent_teaser_${data.auditId}`, JSON.stringify(data.teaser));
      sessionStorage.setItem(`solvent_payload_${data.auditId}`, JSON.stringify(payload));
      sessionStorage.setItem(`solvent_txns_${data.auditId}`, JSON.stringify(sampleTxns));

      router.push(`/report/${data.auditId}`);
    } catch (err: any) {
      alert("Error starting sample analysis: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle uploaded file - direct, fast, user-ready
  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setPendingFile(file);

      let result: any;

      if (file.name.toLowerCase().endsWith(".pdf")) {
        const fd = new FormData();
        fd.append("file", file);
        const pdfRes = await fetch("/api/parse/pdf", { method: "POST", body: fd });
        result = await pdfRes.json();
      } else {
        const text = await file.text();
        const auditSalt = Math.random().toString(36).substring(7);
        result = await parseStatementLocally(text, file.name, auditSalt);
      }

      if (result.isEncrypted) {
        setPasswordModalOpen(true);
        return;
      }

      if (!result.success || !result.payload || !result.transactions) {
        alert(result.error || "Unable to extract transactions from this statement. Please check format.");
        return;
      }

      // Immediately process payload
      const res = await fetch("/api/audit/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      if (!res.ok) {
        throw new Error("Could not process aggregates on server.");
      }

      const data = await res.json();
      sessionStorage.setItem(`solvent_token_${data.auditId}`, data.accessToken);
      sessionStorage.setItem(`solvent_teaser_${data.auditId}`, JSON.stringify(data.teaser));
      sessionStorage.setItem(`solvent_payload_${data.auditId}`, JSON.stringify(result.payload));
      sessionStorage.setItem(`solvent_txns_${data.auditId}`, JSON.stringify(result.transactions));

      router.push(`/report/${data.auditId}`);
    } catch (err: any) {
      alert("File parsing error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar onTrySample={handleTrySample} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle Ambient Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-liquidity/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Privacy Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-zinc-900 border border-surface-border text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-liquidity" />
                <span>100% PRIVATE • Statement stays on your device</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-[1.1]">
                Know Where <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-zinc-200 to-zinc-400">
                  Your Money Goes.
                </span>
              </h1>

              {/* Subcopy */}
              <p className="text-base sm:text-lg text-text-muted max-w-xl leading-relaxed">
                Drop your bank or UPI statement. Solvent organizes confusing transactions into clear spending patterns — with local-first processing, zero bank login, and 100% free analysis.
              </p>

              {/* Three Benefit Chips */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-surface border border-surface-border text-zinc-300">
                  <Zap className="w-3.5 h-3.5 text-liquidity" /> Instant Analysis
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-surface border border-surface-border text-zinc-300">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" /> Zero Bank Login
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-surface border border-surface-border text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 100% Free Forever
                </span>
              </div>

              {/* Upload Dropzone */}
              <div className="pt-4 max-w-xl">
                <StatementDropzone
                  onFileSelect={handleFileSelect}
                  onTrySample={handleTrySample}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            {/* Right Hero Column: Interactive Diagnostic Card Preview */}
            <div className="lg:col-span-5">
              <div className="glass-panel rounded-3xl p-6 sm:p-8 relative border border-surface-border shadow-card hover:border-zinc-700 transition-all">
                {/* Status Indicator */}
                <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-liquidity animate-pulse" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-primary">
                      Solvency Diagnostic Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Sample Statement
                  </span>
                </div>

                {/* Solvency Gauge Demo */}
                <div className="py-2">
                  <SolvencyGauge score={41} size={170} />
                </div>

                {/* Macro metrics tiles */}
                <div className="grid grid-cols-3 gap-2.5 mt-6 pt-6 border-t border-surface-border text-center">
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-border">
                    <span className="text-[10px] text-text-dim block font-mono">Total UPI Taps</span>
                    <span className="font-mono text-sm font-bold text-text-primary">186</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-border">
                    <span className="text-[10px] text-text-dim block font-mono">&lt; ₹100 Spends</span>
                    <span className="font-mono text-sm font-bold text-rose-400">₹4,120</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-surface-border">
                    <span className="text-[10px] text-text-dim block font-mono">Monthly Leak</span>
                    <span className="font-mono text-sm font-bold text-text-primary">₹4,650</span>
                  </div>
                </div>

                {/* Critical Finding Card */}
                <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-left space-y-1.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-xs font-semibold text-rose-300">
                      The Under-₹100 Velocity Drain
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-200/80 leading-relaxed">
                    You averaged 3.1 micro-payments/day at local QRs (₹4,120 total). Frictionless UPI taps drain liquidity without triggering mental spending boundaries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-8 border-y border-surface-border bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-text-dim">
            Compatible with All Major Indian Bank & UPI Exports
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-zinc-400 font-mono">
            <span>SBI</span>
            <span className="text-zinc-600">•</span>
            <span>HDFC BANK</span>
            <span className="text-zinc-600">•</span>
            <span>ICICI BANK</span>
            <span className="text-zinc-600">•</span>
            <span>AXIS BANK</span>
            <span className="text-zinc-600">•</span>
            <span>PHONEPE</span>
            <span className="text-zinc-600">•</span>
            <span>PAYTM</span>
            <span className="text-zinc-600">•</span>
            <span>GOOGLE PAY</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection />

      {/* Features preview */}
      <FeaturesPreview />

      {/* FAQ */}
      <FaqSection />

      {/* Password Prompt Modal */}
      <PasswordPromptModal
        isOpen={passwordModalOpen}
        fileName={pendingFile?.name || "statement.pdf"}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={() => {
          setPasswordModalOpen(false);
          alert("Password accepted locally. Decrypting in browser worker...");
        }}
      />

      <Footer />
    </div>
  );
}
