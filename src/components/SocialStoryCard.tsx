"use client";

import { useRef, useState } from "react";
import { Download, Share2, Eye, ShieldCheck, Check, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";

interface SocialStoryCardProps {
  score: number;
  archetype: string;
  periodText: string;
  totalDebits: number;
  microDrainCount: number;
  microDrainINR: number;
  verdict: string;
  isSynthetic?: boolean;
}

export function SocialStoryCard({
  score,
  archetype,
  periodText,
  totalDebits,
  microDrainCount,
  microDrainINR,
  verdict,
  isSynthetic = false,
}: SocialStoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `solvent-spending-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Story image export failed:", err);
      alert("Could not generate image on this device. You can share your diagnosis link instead.");
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 9:16 Card Container (Scaled for responsive preview) */}
      <div className="relative shadow-2xl rounded-3xl overflow-hidden p-1 bg-gradient-to-b from-zinc-800 to-zinc-950">
        <div
          ref={cardRef}
          style={{ width: 340, height: 604 }} // exact 9:16 ratio scaled down from 1080x1920
          className="relative bg-[#09090B] text-white p-7 flex flex-col justify-between overflow-hidden border border-surface-border"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-liquidity/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-tight text-white">
                SOLVENT<span className="text-liquidity">.</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
              <ShieldCheck className="w-3 h-3 text-liquidity" />
              <span>{isSynthetic ? "SYNTHETIC SAMPLE" : "ZERO PII • ANONYMIZED"}</span>
            </div>
          </div>

          {/* Center: Solvency Gauge & Persona */}
          <div className="relative z-10 text-center my-auto space-y-4">
            <div className="inline-block relative">
              <div className="w-32 h-32 rounded-full border-4 border-surface-border flex flex-col items-center justify-center mx-auto bg-zinc-900/60 shadow-inner">
                <span className="font-mono text-5xl font-bold tracking-tight text-white">
                  {score}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
                  INDEX / 100
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-liquidity px-2.5 py-0.5 rounded-full bg-liquidity/10 border border-liquidity/20">
                Archetype
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5 leading-snug">{archetype}</h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">{periodText}</p>
            </div>

            {/* Micro Drain Highlight */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Total Outflow</span>
                <span className="font-mono font-bold text-white">
                  ₹{totalDebits.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Micro-Drains (&lt;₹100)</span>
                <span className="font-mono font-bold text-rose-400">
                  {microDrainCount} taps (₹{microDrainINR.toLocaleString("en-IN")})
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-300 italic px-2 leading-relaxed">
              &ldquo;{verdict.slice(0, 110)}...&rdquo;
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>solvent.money</span>
            <span>No bank login required</span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? "Exporting PNG..." : "Download 9:16 Story"}</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-text-primary bg-surface border border-surface-border hover:bg-surface-muted transition-colors"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-liquidity" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copiedLink ? "Copied Link!" : "Copy Link"}</span>
        </button>
      </div>

      <p className="text-[11px] text-text-dim text-center max-w-xs">
        <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-liquidity" />
        Guaranteed PII-Free: No account numbers, bank names, or individual merchant rows are ever included in the story image.
      </p>
    </div>
  );
}
