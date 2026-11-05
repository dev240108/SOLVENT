"use client";

import { useMemo } from "react";
import { NormalizedTransaction, MerchantCategory } from "@/types";
import {
  Utensils,
  Zap,
  ShoppingBag,
  Car,
  Tv,
  QrCode,
  ArrowDownLeft,
  PieChart,
  FileText,
} from "lucide-react";

interface CategoryBreakdownCardProps {
  transactions: NormalizedTransaction[];
  onSelectCategory?: (category: string) => void;
}

export function CategoryBreakdownCard({
  transactions,
  onSelectCategory,
}: CategoryBreakdownCardProps) {
  const debits = useMemo(
    () => transactions.filter((t) => t.type === "DEBIT"),
    [transactions]
  );

  const totalDebitSpend = useMemo(
    () => debits.reduce((acc, t) => acc + t.amountINR, 0),
    [debits]
  );

  const categoryStats = useMemo(() => {
    const map = new Map<
      MerchantCategory | "UNCLASSIFIED",
      { totalINR: number; count: number; merchants: Set<string> }
    >();

    for (const t of debits) {
      const cat = t.categoryHint || "UNCLASSIFIED";
      const existing = map.get(cat) || { totalINR: 0, count: 0, merchants: new Set() };
      existing.totalINR += t.amountINR;
      existing.count += 1;
      existing.merchants.add(t.merchantKey);
      map.set(cat, existing);
    }

    const items = Array.from(map.entries()).map(([cat, data]) => {
      const percentage =
        totalDebitSpend > 0 ? (data.totalINR / totalDebitSpend) * 100 : 0;
      return {
        category: cat,
        totalINR: Math.round(data.totalINR * 100) / 100,
        count: data.count,
        merchantCount: data.merchants.size,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return items.sort((a, b) => b.totalINR - a.totalINR);
  }, [debits, totalDebitSpend]);

  const getMeta = (cat: string) => {
    switch (cat) {
      case "FOOD_DINING":
        return {
          name: "Food & Dining",
          sub: "Swiggy, Zomato, Cafes & Restaurants",
          barColor: "bg-amber-400",
          textColor: "text-amber-400",
          icon: Utensils,
        };
      case "QUICK_COMMERCE":
        return {
          name: "Quick Commerce & Groceries",
          sub: "Blinkit, Zepto, Instamart, Kirana",
          barColor: "bg-emerald-400",
          textColor: "text-emerald-400",
          icon: Zap,
        };
      case "SHOPPING":
        return {
          name: "Shopping & E-Commerce",
          sub: "Amazon, Flipkart, Retail Stores, Apparel",
          barColor: "bg-blue-400",
          textColor: "text-blue-400",
          icon: ShoppingBag,
        };
      case "MOBILITY":
        return {
          name: "Travel, Cabs & Fuel",
          sub: "Uber, Ola, Rapido, Petrol Pumps, Metro",
          barColor: "bg-purple-400",
          textColor: "text-purple-400",
          icon: Car,
        };
      case "SUBSCRIPTIONS":
        return {
          name: "Subscriptions & Recurring Bills",
          sub: "OTT Apps, Broadband, Utilities, Autopay",
          barColor: "bg-indigo-400",
          textColor: "text-indigo-400",
          icon: Tv,
        };
      case "MICRO_QR":
        return {
          name: "Daily Small Spends (< ₹100)",
          sub: "Chai, Snacks, Quick Local UPI QR Taps",
          barColor: "bg-rose-400",
          textColor: "text-rose-400",
          icon: QrCode,
        };
      case "P2P_TRANSFER":
        return {
          name: "Transfers to People / Family",
          sub: "Rent, UPI payments to friends & family",
          barColor: "bg-teal-400",
          textColor: "text-teal-400",
          icon: ArrowDownLeft,
        };
      default:
        return {
          name: "Other Everyday Spends",
          sub: "Unclassified payments and local stores",
          barColor: "bg-zinc-400",
          textColor: "text-zinc-400",
          icon: FileText,
        };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-surface-border space-y-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <PieChart className="w-4 h-4 text-liquidity" />
            <span>Category Spending Breakdown (Wallet Share)</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Where your total ₹{totalDebitSpend.toLocaleString("en-IN")} went across distinct lifestyle areas.
          </p>
        </div>
        <span className="text-xs font-mono text-text-dim">
          {categoryStats.length} Spending Buckets
        </span>
      </div>

      {/* Visual Proportional Multi-Segment Bar */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-zinc-900 overflow-hidden flex gap-0.5 p-0.5 border border-surface-border">
          {categoryStats.map((item, idx) => {
            const meta = getMeta(item.category);
            return (
              <div
                key={idx}
                style={{ width: `${Math.max(item.percentage, 2)}%` }}
                className={`h-full rounded-sm ${meta.barColor} transition-all duration-500`}
                title={`${meta.name}: ${item.percentage}% (₹${item.totalINR.toLocaleString("en-IN")})`}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] text-text-dim font-mono">
          <span>0%</span>
          <span>Wallet Share Distribution</span>
          <span>100%</span>
        </div>
      </div>

      {/* Category Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categoryStats.map((item, idx) => {
          const meta = getMeta(item.category);
          const IconComponent = meta.icon;

          return (
            <div
              key={idx}
              onClick={() => onSelectCategory?.(item.category)}
              className="p-4 rounded-2xl bg-zinc-950/60 border border-surface-border hover:border-zinc-700/80 transition-all cursor-pointer group space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl bg-zinc-900 border border-surface-border ${meta.textColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-primary group-hover:text-liquidity transition-colors">
                      {meta.name}
                    </h4>
                    <p className="text-[10px] text-text-dim truncate max-w-[200px]">
                      {meta.sub}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-text-primary block">
                    ₹{item.totalINR.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-text-dim font-semibold">
                    {item.percentage}% share
                  </span>
                </div>
              </div>

              {/* Progress bar per item */}
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${meta.barColor}`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-text-dim pt-0.5">
                <span>{item.count} transactions</span>
                <span className="group-hover:text-text-primary text-text-dim transition-colors">
                  View in ledger &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
