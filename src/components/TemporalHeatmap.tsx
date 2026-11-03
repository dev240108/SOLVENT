"use client";

import { useState } from "react";
import { Clock, Moon, Sun, Sunrise, Sunset, Info } from "lucide-react";

interface TemporalHeatmapProps {
  distribution: {
    morning: { count: number; totalINR: number };
    afternoon: { count: number; totalINR: number };
    evening: { count: number; totalINR: number };
    late_night: { count: number; totalINR: number };
  };
}

export function TemporalHeatmap({ distribution }: TemporalHeatmapProps) {
  const [filter, setFilter] = useState<"ALL" | "WEEKDAY" | "WEEKEND">("ALL");

  const totalSpend =
    distribution.morning.totalINR +
    distribution.afternoon.totalINR +
    distribution.evening.totalINR +
    distribution.late_night.totalINR;

  const totalCount =
    distribution.morning.count +
    distribution.afternoon.count +
    distribution.evening.count +
    distribution.late_night.count;

  const timeSlots = [
    {
      key: "morning",
      label: "Morning",
      range: "06:00 - 11:59",
      icon: Sunrise,
      data: distribution.morning,
      accent: "text-amber-400",
      bgBar: "bg-amber-400/20",
      barColor: "bg-amber-400",
      note: "Breakfast, coffee, morning commute",
    },
    {
      key: "afternoon",
      label: "Afternoon",
      range: "12:00 - 17:59",
      icon: Sun,
      data: distribution.afternoon,
      accent: "text-yellow-400",
      bgBar: "bg-yellow-400/20",
      barColor: "bg-yellow-400",
      note: "Lunch, work snacks, mid-day errands",
    },
    {
      key: "evening",
      label: "Evening",
      range: "18:00 - 22:59",
      icon: Sunset,
      data: distribution.evening,
      accent: "text-indigo-400",
      bgBar: "bg-indigo-400/20",
      barColor: "bg-indigo-400",
      note: "Dinner, quick commerce groceries, social drinks",
    },
    {
      key: "late_night",
      label: "Late Night",
      range: "23:00 - 05:59",
      icon: Moon,
      data: distribution.late_night,
      accent: "text-rose-400",
      bgBar: "bg-rose-500/20",
      barColor: "bg-rose-500",
      note: "Impulsive food delivery, subscriptions, midnight carts",
    },
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Clock className="w-4 h-4 text-liquidity" /> Temporal Spending Distribution
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Breakdown of financial outflow across explicit 24-hour time windows.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="inline-flex p-1 rounded-xl bg-surface border border-surface-border text-xs font-mono">
          {(["ALL", "WEEKDAY", "WEEKEND"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filter === mode
                  ? "bg-zinc-800 text-text-primary font-semibold shadow-sm"
                  : "text-text-dim hover:text-text-muted"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards for 4 buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          const pct = totalSpend > 0 ? Math.round((slot.data.totalINR / totalSpend) * 100) : 0;
          return (
            <div
              key={slot.key}
              className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${slot.accent}`} />
                    <span className="text-xs font-semibold text-text-primary">{slot.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-text-dim">{slot.range}</span>
                </div>
                <p className="text-[11px] text-text-dim">{slot.note}</p>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-mono text-lg font-bold text-text-primary">
                    ₹{slot.data.totalINR.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-muted">{pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className={`h-1.5 w-full rounded-full ${slot.bgBar} overflow-hidden`}>
                  <div
                    className={`h-full ${slot.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-text-dim mt-1.5 block font-mono">
                  {slot.data.count} transactions recorded
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Late night observation alert */}
      {distribution.late_night.totalINR > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-xs text-rose-300">
          <Moon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-rose-200">Late-Night Friction Alert (23:00–05:59):</span>{" "}
            You recorded ₹{distribution.late_night.totalINR.toLocaleString("en-IN")} across{" "}
            {distribution.late_night.count} nocturnal transactions. Outflow in this window typically consists of elevated surge delivery fees and unplanned impulse buying.
          </div>
        </div>
      )}
    </div>
  );
}
