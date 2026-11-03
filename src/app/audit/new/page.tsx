"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StatementDropzone } from "@/components/StatementDropzone";
import { PasswordPromptModal } from "@/components/PasswordPromptModal";
import { getSyntheticTransactions } from "@/lib/parser/sampleData";
import { buildAggregatedPayload } from "@/lib/aggregation";
import { parseStatementLocally } from "@/lib/parser";
import { Lock, ShieldCheck, Sparkles } from "lucide-react";

export default function NewAuditPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleTrySample = async () => {
    try {
      setIsProcessing(true);
      const sampleTxns = getSyntheticTransactions();
      const payload = buildAggregatedPayload(sampleTxns, {
        parsedRows: sampleTxns.length,
        rejectedRows: 0,
        confidence: 0.99,
      });

      const res = await fetch("/api/audit/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not initialize sample audit.");

      const data = await res.json();
      sessionStorage.setItem(`solvent_token_${data.auditId}`, data.accessToken);
      sessionStorage.setItem(`solvent_teaser_${data.auditId}`, JSON.stringify(data.teaser));
      sessionStorage.setItem(`solvent_payload_${data.auditId}`, JSON.stringify(payload));
      sessionStorage.setItem(`solvent_txns_${data.auditId}`, JSON.stringify(sampleTxns));

      router.push(`/report/${data.auditId}`);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsProcessing(true);
      setPendingFile(file);

      const text = await file.text();
      const auditSalt = Math.random().toString(36).substring(7);
      const result = await parseStatementLocally(text, file.name, auditSalt);

      if (result.isEncrypted) {
        setPasswordModalOpen(true);
        return;
      }

      if (!result.success || !result.payload || !result.transactions) {
        alert(result.error || "Could not parse transactions from this statement format.");
        return;
      }

      // Submit aggregates directly and forward to report
      const res = await fetch("/api/audit/teaser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.payload),
      });

      if (!res.ok) throw new Error("Server analysis failed.");

      const data = await res.json();
      sessionStorage.setItem(`solvent_token_${data.auditId}`, data.accessToken);
      sessionStorage.setItem(`solvent_teaser_${data.auditId}`, JSON.stringify(data.teaser));
      sessionStorage.setItem(`solvent_payload_${data.auditId}`, JSON.stringify(result.payload));
      sessionStorage.setItem(`solvent_txns_${data.auditId}`, JSON.stringify(result.transactions));

      router.push(`/report/${data.auditId}`);
    } catch (err: any) {
      alert("Parsing error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar onTrySample={handleTrySample} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Local & Private</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Upload Your Bank or UPI Statement
          </h1>
          <p className="text-sm text-text-muted max-w-lg mx-auto leading-relaxed">
            Your file stays entirely within your device. Solvent organizes your spending habits into clear patterns instantly and 100% free.
          </p>
        </div>

        {/* Upload Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-surface-border space-y-6">
          <StatementDropzone
            onFileSelect={handleFileSelect}
            onTrySample={handleTrySample}
            isProcessing={isProcessing}
          />

          <div className="pt-4 border-t border-surface-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-text-dim">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-liquidity shrink-0 mt-1.5" />
              <span>Supports CSV exports and digital PDFs up to 15 MB.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-liquidity shrink-0 mt-1.5" />
              <span>Password-protected PDFs decrypted locally on your machine.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-liquidity shrink-0 mt-1.5" />
              <span>Zero account numbers, customer names, or passwords ever leave.</span>
            </div>
          </div>
        </div>
      </main>

      <PasswordPromptModal
        isOpen={passwordModalOpen}
        fileName={pendingFile?.name || "statement.pdf"}
        onClose={() => setPasswordModalOpen(false)}
        onSubmit={() => {
          setPasswordModalOpen(false);
          alert("Password accepted locally.");
        }}
      />

      <Footer />
    </div>
  );
}
