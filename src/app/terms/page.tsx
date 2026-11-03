import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldAlert, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions — Solvent",
  description: "Terms of service, pricing disclosures, refund policy, and educational indicators.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Governance & Commercial Terms</span>
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

        {/* 2. Commercial Pricing & One-Time Payment */}
        <div className="p-6 rounded-2xl bg-surface border border-surface-border space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            2. ₹49 One-Time Payment & Refund Policy
          </h2>
          <p className="text-xs text-text-muted leading-relaxed">
            - Solvent provides a free diagnostic teaser showing macro cash flow totals and the critical spending leak finding.<br />
            - The complete forensic dossier (full 15-merchant ranking, temporal heatmap, recurring matrix, and 30-day savings scenarios) is unlocked for a one-time purchase of <strong>₹49 (inclusive of applicable taxes)</strong> per individual audit session.<br />
            - <strong>No Subscription:</strong> You are not enrolled in recurring billing or autopay.<br />
            - <strong>Refund Policy:</strong> Because full report generation occurs immediately upon server payment verification and all derived data is delivered digitally to your browser, purchases are generally non-refundable once the dossier has been generated. If a verified technical error prevented your report from generating after successful charge, contact <a href="mailto:support@solvent.money" className="text-liquidity underline">support@solvent.money</a> within 48 hours with your Razorpay payment ID for an immediate refund.
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
            You agree not to reverse engineer, submit malicious file binaries, scrape the API endpoints, replay cryptographic signatures, or attempt unauthorized capability token forgery. Violations will result in immediate IP banning and access revocation.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
