import Link from "next/link";
import { ShieldCheck, Lock, Smartphone } from "lucide-react";

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
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-liquidity/10 text-liquidity border border-liquidity/20">
                100% On-Device Processing
              </span>
            </div>
            <p className="text-sm text-text-dim max-w-md leading-relaxed">
              Understand where your money goes without sharing your bank login. Your statement stays on your phone or computer, giving you immediate clarity on your spending habits.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-text-dim">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-liquidity" /> No Bank Login
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-liquidity" /> Stays On Your Device
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-liquidity" /> 100% Free
              </span>
            </div>
          </div>

          {/* Links 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/audit/new" className="hover:text-text-primary transition-colors">
                  Analyze Statement
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-text-primary transition-colors">
                  Key Features
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-text-primary transition-colors">
                  Supported Banks
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Trust & Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-text-primary transition-colors">
                  Frequently Asked Questions
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
          <p>© {new Date().getFullYear()} Solvent. Built for fast, private Indian UPI & banking insights.</p>
          <p className="max-w-md sm:text-right">
            Spending Pattern Index is an educational spending habit indicator.
          </p>
        </div>
      </div>
    </footer>
  );
}
