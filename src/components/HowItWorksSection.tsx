import { FileUp, Cpu, Eye, Unlock } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Select Statement",
      desc: "Drop your standard PDF or CSV export from SBI, HDFC, ICICI, Axis, or PhonePe/Paytm.",
      icon: FileUp,
      badge: "Local File",
      highlight: "No credentials or bank login requested.",
    },
    {
      num: "02",
      title: "In-Browser Normalization",
      desc: "Our client parser strips account numbers, names, and VPAs. Clusters merchants deterministically on your machine.",
      icon: Cpu,
      badge: "Local Process",
      highlight: "Original file never leaves your device memory.",
    },
    {
      num: "03",
      title: "Free Spending Diagnosis",
      desc: "Instantly inspect your Spending Pattern Index, micro-drain totals, and critical cash leaks for free.",
      icon: Eye,
      badge: "Free Teaser",
      highlight: "Inspect exact outgoing payload before any submit.",
    },
    {
      num: "04",
      title: "Forensic Dossier Unlock",
      desc: "Unlock the full 15-merchant ranking, temporal heatmap, recurring matrix, and 30-day savings rules for ₹49.",
      icon: Unlock,
      badge: "₹49 One-Time",
      highlight: "Never a subscription. Server-verified unlock.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 border-t border-surface-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs uppercase tracking-widest font-mono text-liquidity px-3 py-1 rounded-full bg-liquidity/10 border border-liquidity/20">
            Simple • Powerful • Private
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            How Solvent Works
          </h2>
          <p className="text-sm text-text-muted">
            Engineered to analyze Indian UPI and banking habits without compromising your privacy boundaries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="glass-panel rounded-2xl p-6 relative flex flex-col justify-between hover:border-liquidity/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-2xl font-bold text-zinc-700 group-hover:text-liquidity/50 transition-colors">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-surface-border text-text-muted">
                      {step.badge}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-liquidity mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-surface-border text-[11px] text-text-dim flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-liquidity shrink-0" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
