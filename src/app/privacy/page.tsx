import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShieldCheck, Lock, Smartphone, HeartHandshake, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy — Simple & Transparent — Solvent",
  description: "Learn how Solvent keeps your bank statements completely private and processed directly on your device.",
};

export default function PrivacyPage() {
  const pillars = [
    {
      icon: Smartphone,
      title: "1. Stays On Your Device",
      desc: "When you select a statement file (PDF or CSV), it is read directly in your phone or computer's web browser. The original file is never uploaded or saved to our servers.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Lock,
      title: "2. No Bank Logins or Passwords",
      desc: "Solvent never asks for your netbanking user ID, password, OTP, or debit card PIN. You simply download your own statement and drop it in.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
    {
      icon: EyeOff,
      title: "3. No Personal Tracking or Ads",
      desc: "We never sell your spending habits or financial profile to lenders, advertisers, credit agencies, or third parties. We don't run trackers on your financial data.",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      icon: HeartHandshake,
      title: "4. 100% Free & Open Access",
      desc: "There are no hidden subscriptions, paywalls, or fees. You get the complete analysis, rankings, and actionable savings rules completely free.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <Navbar showSampleCta={true} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy First • No Jargon</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Our Simple Privacy Promise
          </h1>
          <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
            Financial clarity shouldn&apos;t come at the cost of your privacy. Here is how Solvent protects you in simple, plain language.
          </p>
        </div>

        {/* 4 Friendly Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 sm:p-7 border border-surface-border space-y-3.5 hover:border-zinc-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${pillar.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Plain English Summary Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-surface-border space-y-4">
          <h2 className="text-base sm:text-lg font-semibold text-text-primary">
            What Happens When You Upload a Statement?
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-text-muted">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-liquidity shrink-0 mt-0.5" />
              <span>
                <strong>Step 1 (Local):</strong> Your statement is read inside your browser. Names, bank account numbers, and personal UPI IDs are scrubbed out immediately.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-liquidity shrink-0 mt-0.5" />
              <span>
                <strong>Step 2 (Local):</strong> Numbers and merchant categories (like Swiggy, Zomato, Blinkit) are grouped to calculate your Spending Pattern Index.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-liquidity shrink-0 mt-0.5" />
              <span>
                <strong>Step 3 (Instant):</strong> You receive your interactive forensic report with full merchant rankings and 30-day savings scenarios.
              </span>
            </div>
          </div>
        </div>

        {/* Action Callout */}
        <div className="text-center pt-2">
          <Link
            href="/audit/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
          >
            <span>Try It With Your Statement — 100% Free</span>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
