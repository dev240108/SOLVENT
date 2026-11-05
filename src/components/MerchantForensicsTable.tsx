"use client";

import { useState, useMemo } from "react";
import { MerchantForensicItem } from "@/types";
import { Search, ArrowUpDown, Filter, Building2, ShoppingBag, Utensils, Zap, Car } from "lucide-react";

interface MerchantForensicsTableProps {
  merchants: MerchantForensicItem[];
}

export function MerchantForensicsTable({ merchants }: MerchantForensicsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<"total" | "count" | "avg">("total");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: "total" | "count" | "avg") => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const formatCategoryName = (category: string) => {
    switch (category) {
      case "FOOD_DINING":
        return "Food & Dining";
      case "QUICK_COMMERCE":
        return "Groceries & Instant Needs";
      case "SHOPPING":
        return "Shopping & Retail";
      case "MOBILITY":
        return "Travel & Fuel";
      case "SUBSCRIPTIONS":
        return "Bills & Subscriptions";
      case "MICRO_QR":
        return "Daily Small UPI (< ₹100)";
      case "P2P_TRANSFER":
        return "Personal Transfer / Bank";
      default:
        return "General Store / Payment";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "FOOD_DINING":
        return <Utensils className="w-3.5 h-3.5 text-orange-400" />;
      case "QUICK_COMMERCE":
        return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case "SHOPPING":
        return <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />;
      case "MOBILITY":
        return <Car className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Building2 className="w-3.5 h-3.5 text-text-dim" />;
    }
  };

  const filtered = useMemo(() => {
    const list = merchants.filter((m) =>
      m.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortKey === "total") {
        valA = a.total_inr;
        valB = b.total_inr;
      } else if (sortKey === "count") {
        valA = a.tx_count;
        valB = b.tx_count;
      } else if (sortKey === "avg") {
        valA = a.average_ticket_inr || 0;
        valB = b.average_ticket_inr || 0;
      }
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [merchants, searchTerm, sortKey, sortAsc]);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Filter className="w-4 h-4 text-liquidity" /> Where You Spend Most (Top Stores & Payments)
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Ranked breakdown of where your money went, from highest to lowest.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search store or category..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-surface-border text-xs text-text-primary placeholder:text-zinc-600 focus:outline-none focus:border-liquidity transition-colors font-mono"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-surface-border text-text-dim uppercase font-mono tracking-wider text-[10px]">
              <th className="pb-3 font-semibold">Store / Receiver</th>
              <th className="pb-3 font-semibold">Category</th>
              <th
                onClick={() => handleSort("total")}
                className="pb-3 font-semibold cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Total Spent</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("count")}
                className="pb-3 font-semibold cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Payments</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("avg")}
                className="pb-3 font-semibold cursor-pointer hover:text-text-primary transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Avg Per Spend</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="pb-3 font-semibold">Spending Pattern & Tip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filtered.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface-muted transition-colors">
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-text-dim w-4">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-text-primary block font-mono text-xs">
                      {item.display_name}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-zinc-900 border border-surface-border text-text-muted">
                    {getCategoryIcon(item.category)}
                    <span>{formatCategoryName(item.category)}</span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-mono font-bold text-text-primary">
                  ₹{item.total_inr.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 pr-4 font-mono text-text-muted">
                  {item.tx_count}
                </td>
                <td className="py-3.5 pr-4 font-mono text-text-muted">
                  ₹{item.average_ticket_inr ? item.average_ticket_inr.toLocaleString("en-IN") : "--"}
                </td>
                <td className="py-3.5 text-text-dim text-[11px] max-w-xs leading-snug">
                  {item.waste_verdict}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
