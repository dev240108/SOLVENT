"use client";

import { useState } from "react";
import { AggregatedStatementPayload } from "@/types";
import { ShieldCheck, Check, Copy, X, Terminal, FileCode2 } from "lucide-react";

interface PayloadInspectorModalProps {
  payload: AggregatedStatementPayload | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSend?: () => void;
  isConfirmStep?: boolean;
}

export function PayloadInspectorModal({
  payload,
  isOpen,
  onClose,
  onConfirmSend,
  isConfirmStep = false,
}: PayloadInspectorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payload) return null;

  const jsonStr = JSON.stringify(payload, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#121215] border border-surface-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                Preflight Payload Inspector
                <span className="text-[10px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-zinc-800 text-text-muted">
                  Strict Allow-List
                </span>
              </h3>
              <p className="text-xs text-text-dim">
                This exact JSON object is the only data sent to Solvent. No original file, raw narration, account numbers, or names leave your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Summary */}
        <div className="px-6 py-3 bg-zinc-900/60 border-b border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-text-dim block">Transactions Parsed</span>
            <span className="font-mono font-semibold text-text-primary">{payload.quality.parsedRows} valid rows</span>
          </div>
          <div>
            <span className="text-text-dim block">Time Horizon</span>
            <span className="font-mono font-semibold text-text-primary">{payload.periodDays} days</span>
          </div>
          <div>
            <span className="text-text-dim block">Micro-Drains (&lt;₹100)</span>
            <span className="font-mono font-semibold text-rose-400">{payload.microDrainUnder100.count} txns</span>
          </div>
          <div>
            <span className="text-text-dim block">PII Scrub Status</span>
            <span className="font-mono font-semibold text-liquidity flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 100% Sanitized
            </span>
          </div>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 flex-1 overflow-auto bg-[#0a0a0c] font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[11px] text-text-dim">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-liquidity" /> payload.json
            </span>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-text-primary transition-colors text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-liquidity" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy Payload"}
            </button>
          </div>
          <pre className="overflow-x-auto p-2 leading-relaxed selection:bg-liquidity/20">
            <code>{jsonStr}</code>
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-surface-border bg-surface flex items-center justify-between">
          <span className="text-xs text-text-dim hidden sm:inline">
            Verify every field locally. Nothing is sent without your explicit action.
          </span>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary border border-surface-border hover:bg-surface-muted transition-colors"
            >
              Close
            </button>
            {isConfirmStep && onConfirmSend && (
              <button
                onClick={onConfirmSend}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
              >
                Proceed & Transmit Aggregate Summary
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
