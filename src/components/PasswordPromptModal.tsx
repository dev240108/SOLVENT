"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, X } from "lucide-react";

interface PasswordPromptModalProps {
  isOpen: boolean;
  fileName: string;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (password: string) => void;
}

export function PasswordPromptModal({
  isOpen,
  fileName,
  errorMessage,
  onClose,
  onSubmit,
}: PasswordPromptModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      setError(errorMessage);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the document password.");
      return;
    }
    setError(null);
    onSubmit(password.trim());
    setPassword("");
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121215] border border-surface-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                Password Protected Statement
              </h3>
              <p className="text-xs text-text-dim truncate max-w-[240px]">{fileName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-zinc-900/60 border border-surface-border text-xs text-text-muted flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-liquidity shrink-0 mt-0.5" />
          <p>
            Enter your statement password to decrypt it. Solvent never stores, shares, or logs document passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Statement Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. DOB + PAN or Account Number"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-canvas border border-surface-border text-sm text-text-primary placeholder:text-zinc-600 focus:outline-none focus:border-liquidity transition-colors font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-rose-400 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="pt-2 text-[11px] text-text-dim border-t border-surface-border">
            <span className="font-semibold text-text-muted">Common Bank Passwords:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><strong>HDFC</strong>: Customer ID OR First 4 letters of name + DOB (DDMM)</li>
              <li><strong>SBI</strong>: Last 5 digits of registered mobile + DOB (DDMM)</li>
              <li><strong>ICICI</strong>: First 4 letters of name (lowercase) + DOB (DDMM)</li>
              <li><strong>Axis</strong>: First 4 letters of name (UPPERCASE) + Last 4 digits of account</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-text-muted hover:text-text-primary border border-surface-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-colors shadow-emerald-glow"
            >
              Unlock & Analyze
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
