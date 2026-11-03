import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — Solvent",
  description: "Terms of service, free access disclosures, and educational indicators.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Governance & Access Terms</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Terms of Service & Disclaimers
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Last updated: November 2026. Please read these terms carefully before utilizing Solvent.
          </p>
        </div>

        {/* 1. Nature of the Product */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            1. Educational Indicator & Not Financial Advice
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Solvent provides automated spending diagnostics, categorization heuristics, and spending pattern analyses for Indian bank and UPI statement exports.
            The <strong>Spending Pattern Index</strong> (0–100) is an educational, behavioral indicator. It is <strong>NOT</strong> a credit score, NOT a creditworthiness appraisal, and NOT financial or investment advice under SEBI or RBI guidelines. You should consult qualified financial planners before making investment decisions.
          </p>
        </div>

        {/* 2. 100% Free Service */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            2. 100% Free & Open-Access Platform
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            - Solvent is provided completely <strong>free of charge</strong> with all forensic capabilities fully unlocked.<br />
            - <strong>No Fees or Subscriptions:</strong> You are never charged, and no payment information or banking credentials are ever requested.<br />
            - All reports, exports (CSV, PDF, 9:16 Social Story), and analytics are provided with zero paywalls.
          </p>
        </div>

        {/* 3. Local-First Processing & Boundaries */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            3. Local Processing & Data Minimization
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            Your original statement file (PDF/CSV) is parsed in your client browser. Solvent does not ask for or store your bank netbanking password.
            You agree to only upload statement records that you are legally authorized to access and analyze.
          </p>
        </div>

        {/* 4. Acceptable Use */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            4. Acceptable Use
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            You agree not to reverse engineer, submit malicious file binaries, scrape the API endpoints, or attempt unauthorized capability token forgery.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
