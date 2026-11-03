"use client";

import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PayloadInspectorModal } from "@/components/PayloadInspectorModal";
import { getSyntheticTransactions } from "@/lib/parser/sampleData";
import { buildAggregatedPayload } from "@/lib/aggregation";
import { AggregatedStatementPayload } from "@/types";
import { ShieldCheck, Lock, Key, Terminal, Code2, AlertCircle, CheckCircle2, Eye } from "lucide-react";

export default function SecurityPage() {
  const [showInspector, setShowInspector] = useState(false);
  const sampleTxns = getSyntheticTransactions();
  const samplePayload: AggregatedStatementPayload = buildAggregatedPayload(sampleTxns, {
    parsedRows: sampleTxns.length,
    rejectedRows: 0,
    confidence: 0.99,
  });

  const threatModel = [
    {
      threat: "Accidental PII Upload",
      mitigation: "Strict allow-list schema, pseudonymization of unknown entities, preflight inspector modal.",
      status: "Guarded",
    },
    {
      threat: "Audit Link Guessing",
      mitigation: "High-entropy 256-bit capability tokens stored as SHA-256 hashes at rest. UUID alone is never authorization.",
      status: "Guarded",
    },
    {
      threat: "Financial Credential Leakage",
      mitigation: "Zero payment details, bank logins, or netbanking credentials are requested or accepted. 100% free.",
      status: "Guarded",
    },
    {
      threat: "CSV Formula Injection (DDE)",
      mitigation: "All exported fields escaped and prefixed against dangerous spreadsheet triggers (=, +, -, @).",
      status: "Guarded",
    },
    {
      threat: "Scanned / Malicious PDF Exploits",
      mitigation: "Client-side sandboxed parsing. Image-only PDFs rejected safely without server upload.",
      status: "Guarded",
    },
    {
      threat: "Prompt Injection via Merchant Text",
      mitigation: "Merchant names treated as untrusted strings. Arithmetic calculated strictly in deterministic TypeScript.",
      status: "Guarded",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Cryptographic & Threat Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Security Architecture & Verification
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Solvent treats financial privacy and payment integrity with bank-grade defense-in-depth principles. Every stage of data flow is designed to minimize risk.
          </p>
        </div>

        {/* Live Payload Inspector Demo Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-surface-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <Terminal className="w-4 h-4 text-liquidity" />
                Live Preflight Payload Inspector Demo
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Inspect the exact, strict allow-list JSON object transmitted to the server. Notice the absence of account numbers, names, or raw narration strings.
              </p>
            </div>
            <button
              onClick={() => setShowInspector(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow self-start sm:self-auto"
            >
              <Eye className="w-4 h-4" />
              <span>Launch Live Inspector</span>
            </button>
          </div>
        </div>

        {/* Threat Model Matrix */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Threat Model & Defense Matrix</h2>
          <div className="overflow-x-auto rounded-2xl border border-surface-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-surface-border text-text-dim uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Threat Scenario</th>
                  <th className="p-4">Engineered Mitigation</th>
                  <th className="p-4">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-zinc-950/40">
                {threatModel.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    <td className="p-4 font-semibold text-text-primary font-mono">{item.threat}</td>
                    <td className="p-4 text-text-muted leading-relaxed">{item.mitigation}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Integrity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="flex items-center gap-2 text-liquidity">
              <Key className="w-4 h-4" />
              <h3 className="text-sm font-semibold text-text-primary">Capability-Based Authorization</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              When an audit is generated, the client receives a 256-bit cryptographically random capability token. The server only stores the SHA-256 hash. Knowledge of the audit UUID alone is never sufficient to view or download a dossier.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <h3 className="text-sm font-semibold text-text-primary">100% Free Open Platform</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Solvent does not require payment processing, card numbers, or checkout steps. All forensic reporting, temporal analysis, and directives are completely open and instantaneous.
            </p>
          </div>
        </div>
      </main>

      <PayloadInspectorModal
        payload={samplePayload}
        isOpen={showInspector}
        onClose={() => setShowInspector(false)}
      />

      <Footer />
    </div>
  );
}

