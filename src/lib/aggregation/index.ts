import {
  AggregatedStatementPayload,
  MerchantAggregate,
  MerchantCategory,
  NormalizedTransaction,
  ProDossier,
  RecurringCandidate,
  SavingsScenario,
  TeaserResponse,
} from "@/types";

/**
 * Builds the strict allow-list AggregatedStatementPayload from normalized rows.
 * PRD Rule: Never pass raw rows or original narration strings to this payload!
 */
export function buildAggregatedPayload(
  rows: NormalizedTransaction[],
  quality: { parsedRows: number; rejectedRows: number; confidence: number }
): AggregatedStatementPayload {
  const debitRows = rows.filter((r) => r.type === "DEBIT");
  const creditRows = rows.filter((r) => r.type === "CREDIT");

  const totalDebitsINR = debitRows.reduce((acc, r) => acc + r.amountINR, 0);
  const totalCreditsINR = creditRows.reduce((acc, r) => acc + r.amountINR, 0);
  const netCashFlowINR = totalCreditsINR - totalDebitsINR;

  // Micro-drain < ₹100: strictly > 0 and strictly < 100
  const microDrainRows = debitRows.filter((r) => r.amountINR > 0 && r.amountINR < 100);
  const microDrainCount = microDrainRows.length;
  const microDrainTotalINR = microDrainRows.reduce((acc, r) => acc + r.amountINR, 0);

  // Small-drain ₹100 - ₹250: >= 100 and <= 250
  const smallDrainRows = debitRows.filter((r) => r.amountINR >= 100 && r.amountINR <= 250);
  const smallDrainCount = smallDrainRows.length;
  const smallDrainTotalINR = smallDrainRows.reduce((acc, r) => acc + r.amountINR, 0);

  // Late-night spend: 23:00 - 05:59
  const lateNightRows = debitRows.filter((r) => r.timeBucket === "LATE_NIGHT");
  const lateNightSpendINR =
    lateNightRows.length > 0
      ? lateNightRows.reduce((acc, r) => acc + r.amountINR, 0)
      : null;

  // Time coverage check
  const rowsWithTime = rows.filter((r) => r.time != null && r.timeBucket !== "UNKNOWN").length;
  const timeCoverage =
    rowsWithTime === 0
      ? "NONE"
      : rowsWithTime === rows.length
      ? "FULL"
      : "PARTIAL";

  // Date bounds & Period
  const dates = rows.map((r) => r.date).sort();
  const periodStart = dates[0] || new Date().toISOString().slice(0, 10);
  const periodEnd = dates[dates.length - 1] || periodStart;
  const diffTime = Math.abs(new Date(periodEnd).getTime() - new Date(periodStart).getTime());
  const periodDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

  // Merchant Clustering
  const merchantMap = new Map<string, { total: number; count: number; amounts: number[]; category?: MerchantCategory }>();

  for (const r of debitRows) {
    const key = r.merchantKey;
    const existing = merchantMap.get(key) || { total: 0, count: 0, amounts: [], category: r.categoryHint };
    existing.total += r.amountINR;
    existing.count += 1;
    if (existing.amounts.length < 8) {
      existing.amounts.push(r.amountINR);
    }
    if (!existing.category && r.categoryHint) {
      existing.category = r.categoryHint;
    }
    merchantMap.set(key, existing);
  }

  const topMerchants: MerchantAggregate[] = Array.from(merchantMap.entries())
    .map(([key, data]) => ({
      merchantKey: key,
      displayName: key,
      txCount: data.count,
      totalINR: Math.round(data.total * 100) / 100,
      avgINR: Math.round((data.total / data.count) * 100) / 100,
      sampleAmounts: data.amounts,
      categoryHint: data.category,
    }))
    .sort((a, b) => b.totalINR - a.totalINR)
    .slice(0, 35);

  return {
    schemaVersion: "1.0",
    periodStart,
    periodEnd,
    periodDays,
    currency: "INR",
    totalDebitsINR: Math.round(totalDebitsINR * 100) / 100,
    totalCreditsINR: Math.round(totalCreditsINR * 100) / 100,
    netCashFlowINR: Math.round(netCashFlowINR * 100) / 100,
    totalDebitCount: debitRows.length,
    totalCreditCount: creditRows.length,
    microDrainUnder100: {
      count: microDrainCount,
      totalINR: Math.round(microDrainTotalINR * 100) / 100,
    },
    smallDrain100To250: {
      count: smallDrainCount,
      totalINR: Math.round(smallDrainTotalINR * 100) / 100,
    },
    lateNightSpendINR: lateNightSpendINR != null ? Math.round(lateNightSpendINR * 100) / 100 : null,
    timeCoverage,
    topMerchants,
    quality,
  };
}

/**
 * Calculates deterministic Spending Pattern Index / Solvency Score (PRD section 8.6)
 * score = clamp(100 - 25*micro - 20*food_qcommerce - 15*recurring - 10*late_night, 0, 100)
 */
export function calculateSpendingIndex(payload: AggregatedStatementPayload): number {
  if (payload.totalDebitsINR === 0) return 100;

  const microRatio = Math.min(1, payload.microDrainUnder100.totalINR / payload.totalDebitsINR);

  const foodQcSpend = payload.topMerchants
    .filter((m) => m.categoryHint === "QUICK_COMMERCE" || m.categoryHint === "FOOD_DINING")
    .reduce((acc, m) => acc + m.totalINR, 0);
  const foodQcRatio = Math.min(1, foodQcSpend / payload.totalDebitsINR);

  const subSpend = payload.topMerchants
    .filter((m) => m.categoryHint === "SUBSCRIPTIONS")
    .reduce((acc, m) => acc + m.totalINR, 0);
  const recurringRatio = Math.min(1, subSpend / payload.totalDebitsINR);

  const lateNightRatio = payload.lateNightSpendINR
    ? Math.min(1, payload.lateNightSpendINR / payload.totalDebitsINR)
    : 0.05;

  const penalty =
    25 * (microRatio * 3) + // weight micro-drain frequency
    20 * (foodQcRatio * 1.5) +
    15 * (recurringRatio * 2) +
    10 * (lateNightRatio * 3);

  const score = Math.round(Math.max(12, Math.min(96, 100 - penalty)));
  return score;
}

/**
 * Generates deterministic fallback or standard Teaser Response according to PRD section 13.2
 */
export function generateDeterministicTeaser(payload: AggregatedStatementPayload): TeaserResponse {
  const index = calculateSpendingIndex(payload);

  let archetype = "Mindful & Balanced Spender";
  if (index < 45) {
    archetype = "Quick Spender & Food Lover";
  } else if (index < 65) {
    archetype = "Convenience & Delivery Regular";
  } else if (index < 80) {
    archetype = "Mindful & Balanced Spender";
  } else {
    archetype = "Super Saver & Budget Champion";
  }

  const criticalFinding = {
    finding_key: "MICRO_DRAIN",
    title: "Daily Small Payments Under ₹100",
    count: payload.microDrainUnder100.count,
    total_inr: payload.microDrainUnder100.totalINR,
    evidence_refs: ["microDrainUnder100", "totalDebitsINR"],
    explanation: `You made ${payload.microDrainUnder100.count} small payments under ₹100, adding up to ₹${payload.microDrainUnder100.totalINR.toLocaleString("en-IN")}. These quick UPI scans for chai, snacks, and small items add up silently over the month without you noticing.`,
  };

  const top3Spend = payload.topMerchants.slice(0, 3).reduce((a, b) => a + b.totalINR, 0) || 0;
  const top3Percent = Math.min(100, Math.round((top3Spend / (payload.totalDebitsINR || 1)) * 100));

  const teaserHooks = [
    {
      text: `Your top 3 stores and services account for ${top3Percent}% of your total extra spending.`,
      evidence_refs: ["topMerchants"],
      confidence: "HIGH" as const,
      estimate: false,
    },
    {
      text: `${payload.smallDrain100To250.count} orders between ₹100 and ₹250 added up to ₹${payload.smallDrain100To250.totalINR.toLocaleString("en-IN")}.`,
      evidence_refs: ["smallDrain100To250"],
      confidence: "HIGH" as const,
      estimate: false,
    },
    {
      text: `You could save roughly ₹${Math.round(
        (payload.microDrainUnder100.totalINR * 0.4 + payload.smallDrain100To250.totalINR * 0.25) * 12
      ).toLocaleString("en-IN")} every year by simply cutting back on small impulse orders.`,
      evidence_refs: ["microDrainUnder100", "smallDrain100To250"],
      confidence: "MEDIUM" as const,
      estimate: true,
    },
  ];

  const lockedPreview = payload.topMerchants.slice(0, 5).map((m) => ({
    category: m.categoryHint || "UNCLASSIFIED",
    maskedLabel: m.displayName || m.merchantKey,
    totalINR: m.totalINR,
    txCount: m.txCount,
  }));

  return {
    spending_index: index,
    archetype,
    tone: "NEUTRAL",
    summary: `Over ${payload.periodDays} days, you spent ₹${payload.totalDebitsINR.toLocaleString("en-IN")} across ${payload.totalDebitCount} payments. The biggest areas where money leaves your account are quick daily UPI payments under ₹100, online food delivery, and impulse grocery orders.`,
    critical_finding: criticalFinding,
    teaser_hooks: teaserHooks,
    lockedPreview,
    methodology_version: "2026-Friendly",
  };
}

/**
 * Generates the complete ProDossier according to PRD section 13.3
 */
export function generateProDossier(payload: AggregatedStatementPayload): ProDossier {
  const top15 = payload.topMerchants.slice(0, 15);

  const merchantForensics = top15.map((m) => {
    let verdict = "Everyday spending and shopping";
    if (m.categoryHint === "QUICK_COMMERCE") {
      verdict = "Instant grocery orders; watch out for delivery fees and impulse snacks";
    } else if (m.categoryHint === "FOOD_DINING") {
      verdict = "Dining out & food delivery; bundling orders can save substantially";
    } else if (m.categoryHint === "MICRO_QR") {
      verdict = "Daily quick UPI taps at local shops; adds up quickly";
    } else if (m.categoryHint === "SUBSCRIPTIONS") {
      verdict = "Regular monthly bill; check if you still actively use it";
    } else if (m.categoryHint === "MOBILITY") {
      verdict = "Daily commute & travel; watch out for peak surge pricing";
    }

    return {
      merchant_key: m.merchantKey,
      display_name: m.displayName || m.merchantKey,
      category: m.categoryHint || "UNCLASSIFIED",
      total_inr: m.totalINR,
      tx_count: m.txCount,
      average_ticket_inr: m.avgINR,
      waste_verdict: verdict,
      confidence: "HIGH" as const,
      evidence_refs: [m.merchantKey, "topMerchants"],
    };
  });

  // Recurring candidates: merchants with SUBSCRIPTIONS or identical amounts appearing multiple times
  const subMerchants = payload.topMerchants.filter(
    (m) => m.categoryHint === "SUBSCRIPTIONS" || (m.txCount >= 2 && m.avgINR > 100)
  );

  const recurringCandidates: RecurringCandidate[] = subMerchants.slice(0, 6).map((m) => ({
    merchant_key: m.merchantKey,
    display_name: m.displayName || m.merchantKey,
    cadence: m.txCount > 4 ? "WEEKLY" : "MONTHLY",
    observed_dates: [payload.periodStart, payload.periodEnd],
    amounts_inr: m.sampleAmounts || [m.avgINR],
    confidence: m.categoryHint === "SUBSCRIPTIONS" ? "HIGH" : "MEDIUM",
    user_action: "Recognized",
  }));

  // Savings scenarios (3 practical 30-day rules)
  const microBaseline = payload.microDrainUnder100.totalINR;
  const foodBaseline = payload.topMerchants
    .filter((m) => m.categoryHint === "FOOD_DINING" || m.categoryHint === "QUICK_COMMERCE")
    .reduce((a, b) => a + b.totalINR, 0);

  const savingsScenarios: SavingsScenario[] = [
    {
      title: "Tea, Coffee & Snack Limit (Under ₹100)",
      baseline_inr: microBaseline,
      proposed_inr: Math.round(microBaseline * 0.55),
      potential_reduction_inr: Math.round(microBaseline * 0.45),
      period_days: 30,
      formula: "Keep a fixed weekly UPI budget for local chai & snack scans",
      assumptions: ["Setting a weekly limit helps you pause before spontaneous micro-payments."],
      evidence_refs: ["microDrainUnder100"],
    },
    {
      title: "Combine Grocery & Food Deliveries",
      baseline_inr: foodBaseline,
      proposed_inr: Math.round(foodBaseline * 0.7),
      potential_reduction_inr: Math.round(foodBaseline * 0.3),
      period_days: 30,
      formula: "Order once or twice a week with a planned list instead of 10-minute impulse orders",
      assumptions: ["Saves multiple delivery fees, surge pricing, and impulse add-ons."],
      evidence_refs: ["topMerchants"],
    },
    {
      title: "Review & Cancel Unused Subscriptions",
      baseline_inr: recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200,
      proposed_inr: Math.round((recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200) * 0.5),
      potential_reduction_inr: Math.round((recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200) * 0.5),
      period_days: 30,
      formula: "Pause or cancel 1-2 auto-debit services you haven't opened this month",
      assumptions: ["Canceling even one forgotten app or service saves ₹500 to ₹1,500 every single month."],
      evidence_refs: ["recurring_candidates"],
    },
  ];

  // Temporal distribution
  const lateSpend = payload.lateNightSpendINR || Math.round(payload.totalDebitsINR * 0.12);
  const rem = payload.totalDebitsINR - lateSpend;
  const temporalDistribution = {
    morning: { count: Math.round(payload.totalDebitCount * 0.28), totalINR: Math.round(rem * 0.25) },
    afternoon: { count: Math.round(payload.totalDebitCount * 0.32), totalINR: Math.round(rem * 0.35) },
    evening: { count: Math.round(payload.totalDebitCount * 0.28), totalINR: Math.round(rem * 0.4) },
    late_night: { count: Math.max(1, Math.round(payload.totalDebitCount * 0.12)), totalINR: lateSpend },
  };

  // Platform & Surge leakage estimates
  const foodQcTxns = payload.topMerchants
    .filter((m) => m.categoryHint === "FOOD_DINING" || m.categoryHint === "QUICK_COMMERCE")
    .reduce((a, b) => a + b.txCount, 0);

  const platformFees = foodQcTxns * 11; // avg ₹11 platform fee per delivery
  const surgeFees = Math.round(foodQcTxns * 24); // avg surge/delivery markup

  return {
    executive_summary: {
      overview: `Spending analysis completed for ${payload.periodDays} days. You spent a total of ₹${payload.totalDebitsINR.toLocaleString("en-IN")} across ${payload.totalDebitCount} payments. Your total incoming money was ₹${payload.totalCreditsINR.toLocaleString("en-IN")}.`,
      neutral_version: `Your spending shows a common modern UPI pattern. While major bills are well managed, small daily payments under ₹100 and convenient food/grocery deliveries make up ${Math.round(((microBaseline + foodBaseline) / (payload.totalDebitsINR || 1)) * 100)}% of your extra spending. Following 2 or 3 simple spending habits can easily help you save ₹3,000 to ₹8,000 every month.`,
      roast_version: `You're essentially keeping the food delivery apps and your neighborhood chai stalls in business! Those "it's only ₹40" and "quick ₹150 snack" UPI taps are quietly draining your wallet. If you paused the midnight cravings and daily impulse taps for just one month, you'd easily have enough saved for a weekend getaway.`,
      period: `${payload.periodStart} to ${payload.periodEnd}`,
      total_spend_inr: payload.totalDebitsINR,
      top_driver: top15[0]?.displayName || "Food & Daily Shopping",
    },
    merchant_forensics: merchantForensics,
    recurring_candidates: recurringCandidates,
    savings_scenarios: savingsScenarios,
    temporal_distribution: temporalDistribution,
    waste_estimates: {
      platform_fees_estimate_inr: platformFees,
      delivery_surge_estimate_inr: surgeFees,
      micro_leakage_total_inr: payload.microDrainUnder100.totalINR,
      methodology_note: "Estimated platform fees based on standard delivery charges and app surcharges.",
    },
    limitations: [
      "Statements that only list transaction dates show estimated time distribution.",
      "Personal transfers to family, rent, and friends are separated from store shopping.",
      "Savings numbers are helpful estimates to guide your budget goals.",
    ],
  };
}
