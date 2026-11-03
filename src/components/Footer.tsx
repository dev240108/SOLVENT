import Link from "next/link";
import { ShieldCheck, Lock, Cpu, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-surface-border bg-canvas text-text-muted mt-auto pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-border">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold tracking-tight text-text-primary">
                SOLVENT<span className="text-liquidity">.</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-liquidity/10 text-liquidity border border-liquidity/20">
                Local-First Ingestion
              </span>
            </div>
            <p className="text-sm text-text-dim max-w-md leading-relaxed">
              Your original statement file is parsed locally in your browser and is never stored on our servers.
              Solvent sends only a minimized, pseudonymized summary of spending categories and totals to generate your forensic diagnosis.
            </p>
            <div className="flex items-center gap-4 text-xs text-text-dim">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-liquidity" /> No Bank Login
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-liquidity" /> Zero Raw PII Transmitted
              </span>
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-liquidity" /> Client-Side Parsing
              </span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/audit/new" className="hover:text-text-primary transition-colors">
                  Upload Statement
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-text-primary transition-colors">
                  Payload Inspector
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-text-primary transition-colors">
                  Supported Bank Formats
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-text-primary transition-colors">
                  Liquidity Directives
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Governance & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-text-primary transition-colors">
                  Privacy Policy & Data Boundary
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-text-primary transition-colors">
                  Terms & Disclaimers
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-text-primary transition-colors">
                  Threat Model & Audit Safety
                </Link>
              </li>
              <li>
                <a href="mailto:support@solvent.money" className="hover:text-text-primary transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-dim gap-4">
          <p>© {new Date().getFullYear()} Solvent (solvent.money). Built for privacy-first Indian UPI & bank forensics.</p>
          <p className="max-w-md sm:text-right">
            Spending Pattern Index is an educational heuristic, not a credit score or financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
