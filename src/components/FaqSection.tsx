"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Does Solvent ever upload my original bank statement file?",
    a: "No. Your PDF or CSV statement is processed entirely in your web browser using client-side JavaScript. Only an allow-listed, minimized summary of aggregate category totals (such as total spend, transaction counts, and pseudonymized merchant clusters) is transmitted for report generation. You can inspect the exact payload before anything is sent.",
  },
  {
    q: "Do I need to enter my bank netbanking credentials?",
    a: "Never. Solvent requires zero bank logins, zero netbanking passwords, and zero Account Aggregator permissions. You simply download your statement from your bank or UPI app and drop it into Solvent.",
  },
  {
    q: "What bank and UPI statement formats are supported?",
    a: "Solvent supports CSV and text-based digital PDF exports from major Indian financial institutions including HDFC Bank, State Bank of India (SBI), ICICI Bank, Axis Bank, Kotak Mahindra Bank, as well as UPI transaction history CSV/PDF exports from PhonePe, Paytm, and Google Pay. Scanned/photocopied image-only PDFs are not supported in MVP.",
  },
  {
    q: "What is the Spending Pattern Index?",
    a: "The Spending Pattern Index (0–100) is an educational heuristic developed by Solvent to diagnose spending friction, micro-drains (<₹100), and late-night convenience habits. It is NOT a credit score, NOT an underwriting metric, and NOT official financial advice.",
  },
  {
    q: "How does the ₹49 unlock work?",
    a: "The initial Spending Pattern Index, macro totals, and critical leak finding are 100% free. If you want the complete forensic dossier (full 15-merchant ranking, temporal day/night heatmap, recurring subscription matrix, and 3 personalized 30-day savings rules), you can unlock it for a one-time payment of ₹49 via Razorpay UPI or card. It is never a recurring subscription.",
  },
  {
    q: "What happens to my password if my PDF is password protected?",
    a: "If your bank PDF is encrypted with a password (e.g. date of birth or account number), you are prompted to enter it into a secure local prompt. The password is used strictly inside your browser memory to decrypt the file and is immediately wiped. It is NEVER sent to our servers or logged.",
  },
  {
    q: "How long is my audit data retained?",
    a: "Free teaser audits expire automatically after 7 days. Paid report summaries are retained for 30 days so you can return to view or export them using your capability token link. You can also request instant deletion at any time.",
  },
];

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 border-t border-surface-border bg-canvas relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-liquidity bg-liquidity/10 border border-liquidity/20">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Transparency & Clarity</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-text-muted">
            Everything you need to know about Solvent’s local-first privacy model and forensic reports.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl overflow-hidden border border-surface-border transition-colors hover:border-zinc-700"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-1 focus-visible:ring-liquidity"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-semibold text-text-primary">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? "transform rotate-180 text-liquidity" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-surface-border/50 bg-surface/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
