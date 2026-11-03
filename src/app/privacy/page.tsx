import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, Server, Smartphone } from "lucide-react";

export const metadata = {
  title: "Privacy Architecture & Data Governance — Solvent",
  description: "Learn how Solvent enforces local-first statement parsing with zero raw statement uploads.",
};

export default function PrivacyPage() {
  const dataClassTable = [
    {
      data: "Original PDF / CSV File Bytes",
      class: "Highly Sensitive",
      handling: "Processed strictly in browser memory. Never uploaded to servers.",
    },
    {
      data: "Raw Narration & Account Numbers",
      class: "Highly Sensitive",
      handling: "Discarded after local normalization. Never logged or sent.",
    },
    {
      data: "Statement Passwords",
      class: "Secret Credential",
      handling: "Transient client input only. Cleared immediately from memory after decryption.",
    },
    {
      data: "Normalized Aggregates (Totals, Counts)",
      class: "Derived Aggregate",
      handling: "Sent via encrypted HTTPS after user review in preflight inspector.",
    },
    {
      data: "Counterparty Merchant Identifiers",
      class: "Sensitive Derived",
      handling: "Normalized to known brand labels locally; unknown entities pseudonymized.",
    },
    {
      data: "Payment & Banking Credentials",
      class: "Zero Data Stored",
      handling: "Solvent is 100% free. No cards, payments, bank logins, or Account Aggregator tokens are ever requested.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local-First Data Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Privacy Policy & Data Governance
          </h1>
          <p className="text-base text-text-muted leading-relaxed">
            Solvent is built on an uncompromising local-first design. We believe personal financial analysis should not require handing over bank passwords or uploading unredacted financial histories.
          </p>
        </div>

        {/* Approved Core Promise */}
        <div className="p-6 rounded-3xl bg-zinc-900/60 border border-liquidity/30 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-liquidity block">
            Approved Privacy Promise
          </span>
          <p className="text-sm sm:text-base text-text-primary leading-relaxed font-medium">
            &ldquo;Your original statement is processed in your browser and is not uploaded by Solvent. To generate your report, Solvent sends a minimized, pseudonymized summary of spending categories and totals to its servers and AI provider. You can inspect the outgoing payload before submission.&rdquo;
          </p>
        </div>

        {/* Local vs Server Architecture Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center gap-2.5 text-liquidity">
              <Smartphone className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-text-primary">Stays Inside Your Browser</h3>
            </div>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity shrink-0 mt-0.5" />
                Raw PDF and CSV bytes
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity shrink-0 mt-0.5" />
                Bank account number and customer names
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity shrink-0 mt-0.5" />
                Personal UPI VPAs and phone-linked transfers
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-liquidity shrink-0 mt-0.5" />
                PDF decryption passwords (wiped immediately)
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <Server className="w-5 h-5" />
              <h3 className="text-sm font-semibold text-text-primary">Sent to Server (Sanitized Aggregates)</h3>
            </div>
            <ul className="space-y-2 text-xs text-text-muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                Total debits, credits, and net cash flow numbers
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                Micro-drain count and total (&lt; ₹100 spends)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                Top 35 normalized merchant keys (e.g. &ldquo;SWIGGY&rdquo;, &ldquo;M_#A1F9&rdquo;)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                Statement date window (period start and end)
              </li>
            </ul>
          </div>
        </div>

        {/* Data Classification Table */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Data Classification & Handling Matrix</h2>
          <div className="overflow-x-auto rounded-2xl border border-surface-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface border-b border-surface-border text-text-dim uppercase font-mono tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Data Type</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Handling & Safeguards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-zinc-950/40">
                {dataClassTable.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    <td className="p-4 font-semibold text-text-primary font-mono">{row.data}</td>
                    <td className="p-4 text-text-muted">{row.class}</td>
                    <td className="p-4 text-text-dim leading-relaxed">{row.handling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retention & Deletion Policy */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Data Retention & Deletion Schedule</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            - Free teaser audit summaries automatically expire after <strong>7 days</strong>.<br />
            - Unlocked paid forensic dossiers are retained for <strong>30 days</strong> so you can re-access and export them using your secret capability link.<br />
            - You can request immediate permanent deletion of an audit and revoke all export links at any time by contacting{" "}
            <a href="mailto:privacy@solvent.money" className="text-liquidity underline">
              privacy@solvent.money
            </a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
