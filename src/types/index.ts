export type TransactionType = "DEBIT" | "CREDIT";

export type TimeBucket = "MORNING" | "AFTERNOON" | "EVENING" | "LATE_NIGHT" | "UNKNOWN";

export type MerchantCategory =
  | "QUICK_COMMERCE"
  | "FOOD_DINING"
  | "MICRO_QR"
  | "SUBSCRIPTIONS"
  | "MOBILITY"
  | "SHOPPING"
  | "P2P_TRANSFER"
  | "UNCLASSIFIED";

export interface NormalizedTransaction {
  date: string; // ISO date YYYY-MM-DD
  time?: string | null; // local HH:mm only when available
  merchantKey: string; // local normalized key or audit pseudonym
  amountINR: number; // positive finite number
  type: TransactionType;
  timeBucket: TimeBucket;
  categoryHint?: MerchantCategory;
  parseConfidence: number; // 0..1
  rawNarrationSnippet?: string; // used locally only, NEVER transmitted
  balanceINR?: number | null;
}

export interface MerchantAggregate {
  merchantKey: string; // pseudonymized before transmission if unclassified
  txCount: number;
  totalINR: number;
  avgINR: number;
  sampleAmounts?: number[]; // bounded, optional
  categoryHint?: MerchantCategory;
  displayName?: string; // friendly display label
}

export interface AggregatedStatementPayload {
  schemaVersion: "1.0";
  periodStart: string; // ISO date
  periodEnd: string; // ISO date
  periodDays: number;
  currency: "INR";
  totalDebitsINR: number;
  totalCreditsINR: number;
  netCashFlowINR: number;
  totalDebitCount: number;
  totalCreditCount: number;
  microDrainUnder100: { count: number; totalINR: number };
  smallDrain100To250: { count: number; totalINR: number };
  lateNightSpendINR: number | null;
  timeCoverage: "FULL" | "PARTIAL" | "NONE";
  topMerchants: MerchantAggregate[]; // max 35
  quality: {
    parsedRows: number;
    rejectedRows: number;
    confidence: number;
  };
}

export interface CriticalFinding {
  finding_key: string;
  title: string;
  count: number;
  total_inr: number;
  evidence_refs: string[];
  explanation: string;
}

export interface TeaserHook {
  text: string;
  evidence_refs: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  estimate: boolean;
}

export interface TeaserResponse {
  spending_index: number; // integer 0..100
  archetype: string;
  tone: "PLAYFUL" | "NEUTRAL";
  summary: string;
  critical_finding: CriticalFinding;
  teaser_hooks: TeaserHook[];
  lockedPreview: Array<{
    category: MerchantCategory;
    maskedLabel: string;
    totalINR: number;
    txCount: number;
  }>;
  methodology_version: string;
}

export interface MerchantForensicItem {
  merchant_key: string;
  display_name: string;
  category: MerchantCategory;
  total_inr: number;
  tx_count: number;
  average_ticket_inr: number | null;
  waste_verdict: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  evidence_refs: string[];
}

export interface RecurringCandidate {
  merchant_key: string;
  display_name?: string;
  cadence: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "UNKNOWN";
  observed_dates: string[];
  amounts_inr: number[];
  confidence: "HIGH" | "MEDIUM" | "LOW";
  user_action: string; // "Recognized" | "Investigate" | "Not a subscription"
}

export interface SavingsScenario {
  title: string;
  baseline_inr: number;
  proposed_inr: number;
  potential_reduction_inr: number;
  period_days: number;
  formula: string;
  assumptions: string[];
  evidence_refs: string[];
}

export interface ProDossier {
  executive_summary: {
    overview: string;
    roast_version: string;
    neutral_version: string;
    period: string;
    total_spend_inr: number;
    top_driver: string;
  };
  merchant_forensics: MerchantForensicItem[];
  recurring_candidates: RecurringCandidate[];
  savings_scenarios: SavingsScenario[];
  temporal_distribution: {
    morning: { count: number; totalINR: number };
    afternoon: { count: number; totalINR: number };
    evening: { count: number; totalINR: number };
    late_night: { count: number; totalINR: number };
  };
  waste_estimates: {
    platform_fees_estimate_inr: number;
    delivery_surge_estimate_inr: number;
    micro_leakage_total_inr: number;
    methodology_note: string;
  };
  limitations: string[];
}

export type AuditStatus =
  | "CREATED"
  | "FILE_SELECTED"
  | "PARSED"
  | "AGGREGATED"
  | "TEASER_PENDING"
  | "TEASER_READY"
  | "ORDER_CREATED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFIED"
  | "DOSSIER_READY"
  | "PARSE_FAILED"
  | "TEASER_FAILED"
  | "PAYMENT_FAILED"
  | "PAYMENT_EXPIRED"
  | "DOSSIER_FAILED";

export interface SolventAuditRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  status: AuditStatus;
  accessTokenHash: string;
  schemaVersion: "1.0";
  periodStart: string;
  periodEnd: string;
  periodDays: number;
  totalDebitsINR: number;
  totalCreditsINR: number;
  netCashFlowINR: number;
  totalDebitCount: number;
  totalCreditCount: number;
  microDrainCount: number;
  microDrainINR: number;
  aggregatedPayload: AggregatedStatementPayload;
  teaserResult?: TeaserResponse;
  proDossier?: ProDossier;
  isPaid: boolean;
  tierAmountPaise: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  dossierGeneratedAt?: string;
  isSynthetic?: boolean;
  transactions?: NormalizedTransaction[];
}
