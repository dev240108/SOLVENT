"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, FileText, Sparkles, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface StatementDropzoneProps {
  onFileSelect: (file: File) => void;
  onTrySample: () => void;
  isProcessing?: boolean;
  externalError?: string | null;
}

export function StatementDropzone({
  onFileSelect,
  onTrySample,
  isProcessing = false,
  externalError = null,
}: StatementDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalError) {
      setErrorMessage(externalError);
    }
  }, [externalError]);

  const validateAndHandle = (file: File) => {
    setErrorMessage(null);

    // Limit check: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("File exceeds the 15 MB limit. Please select a shorter date range or smaller export.");
      return;
    }

    const name = file.name.toLowerCase();
    const isCsv = name.endsWith(".csv") || file.type === "text/csv" || file.type === "application/vnd.ms-excel";
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";

    if (!isCsv && !isPdf) {
      setErrorMessage("Unsupported file type. Please upload a standard bank CSV or text-based PDF export.");
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Dropzone container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isProcessing) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isProcessing) fileInputRef.current?.click();
        }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all text-center group ${
          isProcessing
            ? "border-liquidity/40 bg-liquidity/5 cursor-wait"
            : isDragOver
            ? "border-liquidity bg-liquidity/5 scale-[1.01]"
            : "border-surface-border hover:border-liquidity/40 bg-surface/50 hover:bg-surface/80"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          disabled={isProcessing}
          className="hidden"
          onChange={(e) => {
            if (e.target.value && e.target.files?.[0]) {
              validateAndHandle(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className={`w-14 h-14 rounded-2xl bg-surface border border-surface-border flex items-center justify-center text-liquidity shadow-inner transition-all ${
            isProcessing ? "animate-pulse border-liquidity/50" : "group-hover:scale-110 group-hover:border-liquidity/40"
          }`}>
            {isProcessing ? (
              <Loader2 className="w-7 h-7 animate-spin text-liquidity" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm sm:text-base font-semibold text-text-primary">
              {isProcessing ? "Analyzing your statement..." : "Drop your bank or UPI statement here"}
            </p>
            <p className="text-xs text-text-dim">
              {isProcessing
                ? "Checking transactions securely in your browser"
                : <>Supports <span className="text-text-muted font-medium">CSV</span> or <span className="text-text-muted font-medium">PDF</span> (up to 15 MB / ~5,000 transactions)</>}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 border border-surface-border text-text-muted">
              <FileSpreadsheet className="w-3 h-3 text-liquidity" /> CSV Export
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 border border-surface-border text-text-muted">
              <FileText className="w-3 h-3 text-indigo-400" /> Digital PDF
            </span>
          </div>

          <p className="text-[11px] text-text-dim pt-2">
            100% Free • Private Browser Analysis • No Bank Login Required
          </p>
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{errorMessage}</p>
            <p className="text-[11px] text-rose-400/80 mt-0.5">
              Tip: Export directly from your bank netbanking portal (HDFC, SBI, ICICI, Axis) or PhonePe/Paytm UPI passbook.
            </p>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFile && !errorMessage && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-surface-border text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-liquidity/10 border border-liquidity/20 flex items-center justify-center text-liquidity">
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary truncate max-w-[200px] sm:max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-text-dim font-mono flex items-center gap-1.5">
                <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                <span>•</span>
                {isProcessing ? (
                  <span className="text-liquidity animate-pulse font-medium">Analyzing statement...</span>
                ) : (
                  <span>Ready for analysis</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isProcessing && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(selectedFile);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-liquidity text-canvas hover:bg-liquidity-hover transition-all shadow-emerald-glow"
              >
                <Sparkles className="w-3 h-3" />
                <span>Open Dashboard &rarr;</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isProcessing) {
                  setSelectedFile(null);
                  setErrorMessage(null);
                }
              }}
              disabled={isProcessing}
              className="text-[11px] text-text-muted hover:text-text-primary underline px-2 py-1 disabled:opacity-40"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Try sample statement alternative */}
      <div className="pt-1 flex items-center justify-center gap-3">
        <span className="text-xs text-text-dim">Don&apos;t have a statement handy?</span>
        <button
          type="button"
          onClick={onTrySample}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-liquidity hover:text-liquidity-hover underline underline-offset-4 decoration-liquidity/30 hover:decoration-liquidity transition-all disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Realistic 60-Day Sample Statement</span>
        </button>
      </div>
    </div>
  );
}
