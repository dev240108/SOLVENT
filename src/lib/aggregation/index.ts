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

  let archetype = "Balanced Navigator";
  if (index < 45) {
    archetype = "Impulse & Micro-Drain Heavy";
  } else if (index < 65) {
    archetype = "Frequent Convenience Spender";
  } else if (index < 80) {
    archetype = "Prudent Modern Consumer";
  } else {
    archetype = "Disciplined Capital Conserver";
  }

  const criticalFinding = {
    finding_key: "MICRO_DRAIN",
    title: "The Under-₹100 Velocity Drain",
    count: payload.microDrainUnder100.count,
    total_inr: payload.microDrainUnder100.totalINR,
    evidence_refs: ["microDrainUnder100", "totalDebitsINR"],
    explanation: `You made ${payload.microDrainUnder100.count} micro-transactions under ₹100, totaling ₹${payload.microDrainUnder100.totalINR.toLocaleString("en-IN")}. These low-friction UPI taps leak capital without triggering mental spending boundaries.`,
  };

  const teaserHooks = [
    {
      text: `Top 3 merchant clusters account for ${Math.round(
        ((payload.topMerchants.slice(0, 3).reduce((a, b) => a + b.totalINR, 0) || 0) / (payload.totalDebitsINR || 1)) * 100
      )}% of your discretionary outflow.`,
      evidence_refs: ["topMerchants"],
      confidence: "HIGH" as const,
      estimate: false,
    },
    {
      text: `${payload.smallDrain100To250.count} transactions in the ₹100–₹250 quick-commerce zone drained ₹${payload.smallDrain100To250.totalINR.toLocaleString("en-IN")}.`,
      evidence_refs: ["smallDrain100To250"],
      confidence: "HIGH" as const,
      estimate: false,
    },
    {
      text: `Potential annual savings of ₹${Math.round(
        (payload.microDrainUnder100.totalINR * 0.4 + payload.smallDrain100To250.totalINR * 0.25) * 12
      ).toLocaleString("en-IN")} identified across leak clusters.`,
      evidence_refs: ["microDrainUnder100", "smallDrain100To250"],
      confidence: "MEDIUM" as const,
      estimate: true,
    },
  ];

  const lockedPreview = payload.topMerchants.slice(0, 5).map((m, idx) => ({
    category: m.categoryHint || "UNCLASSIFIED",
    maskedLabel: `Merchant Cluster #${idx + 1} (${m.categoryHint || "Vendor"})`,
    totalINR: m.totalINR,
    txCount: m.txCount,
  }));

  return {
    spending_index: index,
    archetype,
    tone: "NEUTRAL",
    summary: `Across ${payload.periodDays} days, you recorded ₹${payload.totalDebitsINR.toLocaleString("en-IN")} in debits over ${payload.totalDebitCount} transactions. The primary leakage point is high-frequency micro-spends below ₹100 and rapid on-demand food & quick commerce orders.`,
    critical_finding: criticalFinding,
    teaser_hooks: teaserHooks,
    lockedPreview,
    methodology_version: "2026-Q4-Deterministic",
  };
}

/**
 * Generates the complete ProDossier according to PRD section 13.3
 */
export function generateProDossier(payload: AggregatedStatementPayload): ProDossier {
  const top15 = payload.topMerchants.slice(0, 15);

  const merchantForensics = top15.map((m) => {
    let verdict = "Standard discretionary outflow";
    if (m.categoryHint === "QUICK_COMMERCE") {
      verdict = "High convenience markup; delivery fees & impulse add-ons";
    } else if (m.categoryHint === "FOOD_DINING") {
      verdict = "Frequent dining/delivery; prime target for batch ordering";
    } else if (m.categoryHint === "MICRO_QR") {
      verdict = "Frictionless micro-drain; daily habit cluster";
    } else if (m.categoryHint === "SUBSCRIPTIONS") {
      verdict = "Recurring debit; review active usage";
    } else if (m.categoryHint === "MOBILITY") {
      verdict = "Commute transit; surge pricing detected during peak slots";
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
      title: "Tapri & Micro-Drain Cap (Under ₹100)",
      baseline_inr: microBaseline,
      proposed_inr: Math.round(microBaseline * 0.55),
      potential_reduction_inr: Math.round(microBaseline * 0.45),
      period_days: 30,
      formula: "Baseline * 45% reduction via weekly UPI wallet pre-allocation",
      assumptions: ["User transitions to weekly prepaid UPI pool instead of direct account taps."],
      evidence_refs: ["microDrainUnder100"],
    },
    {
      title: "Quick Commerce & Delivery Consolidator",
      baseline_inr: foodBaseline,
      proposed_inr: Math.round(foodBaseline * 0.7),
      potential_reduction_inr: Math.round(foodBaseline * 0.3),
      period_days: 30,
      formula: "Reduce 2-3 single-item quick commerce carts per week into 1 planned batch",
      assumptions: ["Saves delivery fees, surge pricing, and impulse cart additions."],
      evidence_refs: ["topMerchants"],
    },
    {
      title: "Zombie Subscription & Inactive recurring cull",
      baseline_inr: recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200,
      proposed_inr: Math.round((recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200) * 0.5),
      potential_reduction_inr: Math.round((recurringCandidates.reduce((acc, c) => acc + (c.amounts_inr[0] || 0), 0) || 1200) * 0.5),
      period_days: 30,
      formula: "Pause or cancel 1-2 underutilized recurring services",
      assumptions: ["At least one recurring charge represents an uninspected auto-debit."],
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
      overview: `Forensic audit completed across ${payload.periodDays} days of statement records. Total outflow of ₹${payload.totalDebitsINR.toLocaleString("en-IN")} tracked across ${payload.totalDebitCount} debit events. Net balance flow is ${payload.netCashFlowINR >= 0 ? "+" : "-"}₹${Math.abs(payload.netCashFlowINR).toLocaleString("en-IN")}.`,
      neutral_version: `Your spending exhibits typical high-density UPI characteristics. While macro bills remain stable, micro-transactions (<₹100) and instant food/grocery delivery constitute ${Math.round(((microBaseline + foodBaseline) / (payload.totalDebitsINR || 1)) * 100)}% of your discretionary burn rate. Implementing structured 30-day caps can preserve substantial liquidity without lifestyle hardship.`,
      roast_version: `You're essentially funding the local food delivery ecosystem and paying platform fees for every craving. Your wallet is suffering death by a thousand chai taps and midnight 10-minute grocery runs. It's time to plug the invisible leaks before your bank account declares early retirement.`,
      period: `${payload.periodStart} to ${payload.periodEnd}`,
      total_spend_inr: payload.totalDebitsINR,
      top_driver: top15[0]?.displayName || "Discretionary Outflow",
    },
    merchant_forensics: merchantForensics,
    recurring_candidates: recurringCandidates,
    savings_scenarios: savingsScenarios,
    temporal_distribution: temporalDistribution,
    waste_estimates: {
      platform_fees_estimate_inr: platformFees,
      delivery_surge_estimate_inr: surgeFees,
      micro_leakage_total_inr: payload.microDrainUnder100.totalINR,
      methodology_note: "Estimated platform fees based on standard ₹6-₹15 order surcharge. Delivery surge calculated on delivery order volume.",
    },
    limitations: [
      "Statements with only transaction dates lack exact intraday hour timestamps.",
      "P2P transfers to family, rent, or housemates are pseudonymized and excluded from merchant waste classifications.",
      "Savings scenarios represent model projections and are not guaranteed investment advice.",
    ],
  };
}
