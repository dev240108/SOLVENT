"use client";

import Link from "next/link";
import { Shield, Sparkles, ArrowRight, Activity } from "lucide-react";

interface NavbarProps {
  onTrySample?: () => void;
  showSampleCta?: boolean;
}

export function Navbar({ onTrySample, showSampleCta = true }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-canvas/80 border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-surface-border group-hover:border-liquidity/40 transition-colors">
            <Activity className="w-4 h-4 text-liquidity" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold tracking-tight text-text-primary">
              SOLVENT<span className="text-liquidity">.</span>
            </span>
          </div>
        </Link>

        {/* User-Friendly Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-text-muted">
          <Link href="/#features" className="hover:text-text-primary transition-colors">
            Features
          </Link>
          <Link href="/#how-it-works" className="hover:text-text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/privacy" className="hover:text-text-primary transition-colors flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-liquidity/80" />
            Privacy
          </Link>
          <Link href="/faq" className="hover:text-text-primary transition-colors">
            FAQ
          </Link>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {showSampleCta && (
            <button
              onClick={onTrySample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-surface text-text-primary border border-surface-border hover:border-liquidity/40 hover:bg-surface-muted transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-liquidity" />
              <span>Try Sample Statement</span>
            </button>
          )}

          <Link
            href="/audit/new"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
          >
            <span>Analyze Statement</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
