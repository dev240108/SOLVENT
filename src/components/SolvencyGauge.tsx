"use client";

import { useMemo } from "react";

interface SolvencyGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export function SolvencyGauge({
  score,
  size = 180,
  strokeWidth = 14,
  label = "Financial Health Score",
  sublabel = "Based on your spending habits",
}: SolvencyGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Determine dynamic ring color based on liquidity & leak score
  const { strokeColor, glowClass, statusText, statusBadgeColor } = useMemo(() => {
    if (safeScore >= 75) {
      return {
        strokeColor: "#10B981", // Emerald
        glowClass: "drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]",
        statusText: "Great Financial Health",
        statusBadgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    } else if (safeScore >= 55) {
      return {
        strokeColor: "#F59E0B", // Warning / Amber
        glowClass: "drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]",
        statusText: "Room for Improvement",
        statusBadgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    } else {
      return {
        strokeColor: "#F43F5E", // Rose / Danger
        glowClass: "drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]",
        statusText: "High Extra Spending",
        statusBadgeColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    }
  }, [safeScore]);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${glowClass}`}
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-text-primary">
            {safeScore}
          </span>
          <span className="text-[11px] font-mono text-text-dim uppercase tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {/* Label and Badge */}
      <div className="mt-3 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-wide" style={{}} >
          <span className={`px-2 py-0.5 rounded-full text-[11px] border ${statusBadgeColor}`}>
            {statusText}
          </span>
        </div>
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className="text-[10px] text-text-dim">{sublabel}</p>
      </div>
    </div>
  );
}
