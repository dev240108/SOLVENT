"use client";

import { useState, useMemo } from "react";
import { NormalizedTransaction, MerchantCategory } from "@/types";
import {
  Search,
  ArrowUpDown,
  Download,
  ChevronDown,
  ChevronUp,
  Utensils,
  Zap,
  ShoppingBag,
  Car,
  Tv,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  FileSpreadsheet,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import { downloadSanitizedCsv } from "@/lib/exportUtils";

interface StatementLedgerTableProps {
  transactions: NormalizedTransaction[];
  auditId: string;
}

export function StatementLedgerTable({ transactions, auditId }: StatementLedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [flowFilter, setFlowFilter] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [microOnly, setMicroOnly] = useState(false);
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Category Icon & Label mapping
  const getCategoryMeta = (category?: MerchantCategory) => {
    switch (category) {
      case "FOOD_DINING":
        return { label: "Food & Dining", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Utensils };
      case "QUICK_COMMERCE":
        return { label: "Quick Commerce / Grocery", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Zap };
      case "SHOPPING":
        return { label: "Shopping & Retail", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: ShoppingBag };
      case "MOBILITY":
        return { label: "Cab & Travel", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Car };
      case "SUBSCRIPTIONS":
        return { label: "Subscriptions & Bills", color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20", icon: Tv };
      case "MICRO_QR":
        return { label: "Chai & Small QR (< ₹100)", color: "text-rose-400 bg-rose-400/10 border-rose-400/20", icon: QrCode };
      case "P2P_TRANSFER":
        return { label: "Bank Transfer / Income", color: "text-teal-400 bg-teal-400/10 border-teal-400/20", icon: ArrowDownLeft };
      default:
        return { label: "Everyday Store", color: "text-zinc-400 bg-zinc-800/40 border-zinc-700/50", icon: FileText };
    }
  };

  // Filter & sort
  const filteredTxns = useMemo(() => {
    let result = [...transactions];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.merchantKey.toLowerCase().includes(q) ||
          (t.rawNarrationSnippet && t.rawNarrationSnippet.toLowerCase().includes(q)) ||
          t.date.includes(q) ||
          t.amountINR.toString().includes(q)
      );
    }

    if (flowFilter !== "ALL") {
      result = result.filter((t) => t.type === flowFilter);
    }

    if (categoryFilter !== "ALL") {
      result = result.filter((t) => (t.categoryHint || "UNCLASSIFIED") === categoryFilter);
    }

    if (microOnly) {
      result = result.filter((t) => t.type === "DEBIT" && t.amountINR < 100);
    }

    result.sort((a, b) => {
      if (sortField === "date") {
        const cmp = a.date.localeCompare(b.date);
        return sortOrder === "desc" ? -cmp : cmp;
      } else {
        const cmp = a.amountINR - b.amountINR;
        return sortOrder === "desc" ? -cmp : cmp;
      }
    });

    return result;
  }, [transactions, searchTerm, flowFilter, categoryFilter, microOnly, sortField, sortOrder]);

  // Pagination calculation
  const totalItems = filteredTxns.length;
  const totalPages = pageSize === -1 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedTxns = useMemo(() => {
    if (pageSize === -1) return filteredTxns;
    const start = (safePage - 1) * pageSize;
    return filteredTxns.slice(start, start + pageSize);
  }, [filteredTxns, safePage, pageSize]);

  // Subtotals
  const totalDebits = useMemo(
    () => filteredTxns.filter((t) => t.type === "DEBIT").reduce((acc, t) => acc + t.amountINR, 0),
    [filteredTxns]
  );
  const totalCredits = useMemo(
    () => filteredTxns.filter((t) => t.type === "CREDIT").reduce((acc, t) => acc + t.amountINR, 0),
    [filteredTxns]
  );

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleExportFiltered = () => {
    if (filteredTxns.length > 0) {
      downloadSanitizedCsv(filteredTxns, `solvent-filtered-ledger-${auditId.slice(0, 8)}`);
    }
  };

  const categoriesAvailable = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.categoryHint) set.add(t.categoryHint);
    });
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6 shadow-card">
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-surface-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-liquidity" />
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              Exact Bank & UPI Statement Ledger
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-liquidity/10 text-liquidity border border-liquidity/20">
              {transactions.length} Records Extracted
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Every transaction extracted directly from your PDF statement with clean merchant identification, time of day, and raw bank narration records.
          </p>
        </div>

        {/* Export filtered CSV */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={handleExportFiltered}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 border border-surface-border text-text-muted hover:text-text-primary hover:bg-zinc-800 transition-colors font-mono"
            title="Download CSV of current filtered view"
          >
            <Download className="w-3.5 h-3.5 text-liquidity" />
            <span>Export View ({filteredTxns.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by merchant, narration text, date, amount..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs text-text-primary placeholder:text-zinc-500 focus:outline-none focus:border-liquidity transition-colors font-mono"
            />
          </div>

          {/* Flow Type Pills (All / Debits / Credits) */}
          <div className="md:col-span-4 flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-surface-border text-xs font-mono">
            <button
              onClick={() => {
                setFlowFilter("ALL");
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-colors font-semibold ${
                flowFilter === "ALL"
                  ? "bg-zinc-800 text-text-primary shadow-sm"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => {
                setFlowFilter("DEBIT");
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 font-semibold ${
                flowFilter === "DEBIT"
                  ? "bg-zinc-800 text-rose-400 shadow-sm"
                  : "text-text-dim hover:text-rose-400"
              }`}
            >
              <span>Outflows</span>
            </button>
            <button
              onClick={() => {
                setFlowFilter("CREDIT");
                setCurrentPage(1);
              }}
              className={`flex-1 py-1.5 rounded-xl transition-colors flex items-center justify-center gap-1 font-semibold ${
                flowFilter === "CREDIT"
                  ? "bg-zinc-800 text-emerald-400 shadow-sm"
                  : "text-text-dim hover:text-emerald-400"
              }`}
            >
              <span>Inflows</span>
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-surface border border-surface-border text-xs text-text-primary focus:outline-none focus:border-liquidity transition-colors font-mono cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categoriesAvailable.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryMeta(cat as MerchantCategory).label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Micro-drains quick filter & active indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMicroOnly(!microOnly);
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] transition-colors ${
                microOnly
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold"
                  : "bg-surface border-surface-border text-text-dim hover:text-text-muted"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Chai / Micro-Spends Only (&lt; ₹100)</span>
            </button>

            {(searchTerm || flowFilter !== "ALL" || categoryFilter !== "ALL" || microOnly) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFlowFilter("ALL");
                  setCategoryFilter("ALL");
                  setMicroOnly(false);
                  setCurrentPage(1);
                }}
                className="text-[11px] text-text-dim hover:text-text-primary underline underline-offset-2 ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Subtotals for current filtered set */}
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span>
              Matching: <strong className="text-text-primary">{filteredTxns.length}</strong> txns
            </span>
            {totalDebits > 0 && (
              <span className="text-rose-400">
                Outflow: <strong>₹{totalDebits.toLocaleString("en-IN")}</strong>
              </span>
            )}
            {totalCredits > 0 && (
              <span className="text-emerald-400">
                Inflow: <strong>₹{totalCredits.toLocaleString("en-IN")}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-x-auto rounded-2xl border border-surface-border">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-zinc-950/80 border-b border-surface-border text-text-dim uppercase font-mono tracking-wider text-[10px]">
              <th
                onClick={() => toggleSort("date")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-text-primary transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Date & Time</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Merchant / Beneficiary</th>
              <th className="py-3 px-4 font-semibold">Category</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th
                onClick={() => toggleSort("amount")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-text-primary transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              {transactions.some((t) => t.balanceINR != null) && (
                <th className="py-3 px-4 font-semibold text-right">Balance</th>
              )}
              <th className="py-3 px-4 font-semibold text-center w-12">Raw</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border bg-surface/40">
            {pagedTxns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-dim">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <FileSpreadsheet className="w-8 h-8 text-zinc-600" />
                    <p className="text-xs">No transactions match the selected filters.</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFlowFilter("ALL");
                        setCategoryFilter("ALL");
                        setMicroOnly(false);
                      }}
                      className="text-xs text-liquidity hover:underline"
                    >
                      Clear search & filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              pagedTxns.map((t, idx) => {
                const globalIdx = (safePage - 1) * (pageSize === -1 ? 0 : pageSize) + idx;
                const isExpanded = expandedRow === globalIdx;
                const catMeta = getCategoryMeta(t.categoryHint);
                const IconComponent = catMeta.icon;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isExpanded
                        ? "bg-zinc-900/80"
                        : idx % 2 === 0
                        ? "hover:bg-zinc-900/50"
                        : "bg-surface/20 hover:bg-zinc-900/50"
                    }`}
                  >
                    {/* Date & Time */}
                    <td className="py-3 px-4 font-mono whitespace-nowrap">
                      <div className="text-text-primary font-medium">{t.date}</div>
                      <div className="text-[10px] text-text-dim flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{t.time || t.timeBucket}</span>
                      </div>
                    </td>

                    {/* Merchant / Receiver */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-text-primary font-mono text-xs max-w-xs truncate">
                        {t.merchantKey}
                      </div>
                      {t.rawNarrationSnippet && (
                        <div className="text-[10px] text-text-dim truncate max-w-xs font-mono mt-0.5">
                          {t.rawNarrationSnippet}
                        </div>
                      )}
                    </td>

                    {/* Category Pill */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${catMeta.color}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{catMeta.label}</span>
                      </span>
                    </td>

                    {/* Type (+ / -) */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {t.type === "CREDIT" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <ArrowDownLeft className="w-3 h-3" />
                          <span>Inflow</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-300">
                          <ArrowUpRight className="w-3 h-3 text-rose-400" />
                          <span>Outflow</span>
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          t.type === "CREDIT"
                            ? "text-emerald-400"
                            : t.amountINR < 100
                            ? "text-rose-300"
                            : "text-text-primary"
                        }
                      >
                        {t.type === "CREDIT" ? "+" : "-"}₹
                        {t.amountINR.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Balance */}
                    {transactions.some((item) => item.balanceINR != null) && (
                      <td className="py-3 px-4 text-right font-mono text-text-dim whitespace-nowrap">
                        {t.balanceINR != null
                          ? `₹${t.balanceINR.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "--"}
                      </td>
                    )}

                    {/* Expand raw narration button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : globalIdx)}
                        className="p-1 rounded-lg text-text-dim hover:text-text-primary hover:bg-zinc-800 transition-colors"
                        title="View exact raw narration from statement"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded Row Detail Banner (if active) */}
      {expandedRow != null && pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)] && (
        <div className="p-4 rounded-2xl bg-zinc-900 border border-surface-border space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-liquidity">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exact Statement Narration (Line extracted from PDF)</span>
            </span>
            <button
              onClick={() => setExpandedRow(null)}
              className="text-text-dim hover:text-text-primary text-[10px]"
            >
              Close Details
            </button>
          </div>
          <p className="font-mono text-text-primary bg-zinc-950 p-3 rounded-xl border border-surface-border break-all leading-relaxed select-all">
            {pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)].rawNarrationSnippet ||
              pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)].merchantKey}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[10px] text-text-dim font-mono pt-1">
            <span>Date: {pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)].date}</span>
            <span>Type: {pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)].type}</span>
            <span>
              Amount: ₹{pagedTxns[expandedRow % (pageSize === -1 ? pagedTxns.length : pageSize)].amountINR.toFixed(2)}
            </span>
            <span>Confidence: 100% Deterministic</span>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono text-text-dim">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg bg-surface border border-surface-border text-text-primary text-xs focus:outline-none"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={-1}>All ({filteredTxns.length})</option>
          </select>
          <span className="text-text-muted">
            Showing {filteredTxns.length === 0 ? 0 : (safePage - 1) * (pageSize === -1 ? 0 : pageSize) + 1} -{" "}
            {pageSize === -1 ? filteredTxns.length : Math.min(safePage * pageSize, filteredTxns.length)} of{" "}
            {filteredTxns.length}
          </span>
        </div>

        {pageSize !== -1 && totalPages > 1 && (
          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-1 rounded-xl bg-surface border border-surface-border text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              Prev
            </button>
            <span className="px-2 text-text-muted">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-1 rounded-xl bg-surface border border-surface-border text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
