import { z } from "zod";

export const MerchantCategorySchema = z.enum([
  "QUICK_COMMERCE",
  "FOOD_DINING",
  "MICRO_QR",
  "SUBSCRIPTIONS",
  "MOBILITY",
  "SHOPPING",
  "P2P_TRANSFER",
  "UNCLASSIFIED",
]);

export const MerchantAggregateSchema = z.object({
  merchantKey: z.string().min(1).max(64),
  txCount: z.number().int().nonnegative(),
  totalINR: z.number().nonnegative(),
  avgINR: z.number().nonnegative(),
  sampleAmounts: z.array(z.number().nonnegative()).optional(),
  categoryHint: MerchantCategorySchema.optional(),
  displayName: z.string().max(80).optional(),
});

export const AggregatedStatementPayloadSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid periodStart ISO date"),
    periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid periodEnd ISO date"),
    periodDays: z.number().int().positive(),
    currency: z.literal("INR"),
    totalDebitsINR: z.number().nonnegative(),
    totalCreditsINR: z.number().nonnegative(),
    netCashFlowINR: z.number(),
    totalDebitCount: z.number().int().nonnegative(),
    totalCreditCount: z.number().int().nonnegative(),
    microDrainUnder100: z.object({
      count: z.number().int().nonnegative(),
      totalINR: z.number().nonnegative(),
    }),
    smallDrain100To250: z.object({
      count: z.number().int().nonnegative(),
      totalINR: z.number().nonnegative(),
    }),
    lateNightSpendINR: z.number().nonnegative().nullable(),
    timeCoverage: z.enum(["FULL", "PARTIAL", "NONE"]),
    topMerchants: z.array(MerchantAggregateSchema).max(35),
    quality: z.object({
      parsedRows: z.number().int().nonnegative(),
      rejectedRows: z.number().int().nonnegative(),
      confidence: z.number().min(0).max(1),
    }),
  })
  .strict();

export const TeaserResponseSchema = z.object({
  spending_index: z.number().int().min(0).max(100),
  archetype: z.string().max(60),
  tone: z.enum(["PLAYFUL", "NEUTRAL"]),
  summary: z.string().max(800),
  critical_finding: z.object({
    finding_key: z.string(),
    title: z.string().max(90),
    count: z.number().int().nonnegative(),
    total_inr: z.number().nonnegative(),
    evidence_refs: z.array(z.string()),
    explanation: z.string().max(500),
  }),
  teaser_hooks: z
    .array(
      z.object({
        text: z.string().max(180),
        evidence_refs: z.array(z.string()),
        confidence: z.enum(["HIGH", "MEDIUM", "LOW"]),
        estimate: z.boolean(),
      })
    )
    .max(4),
  lockedPreview: z.array(
    z.object({
      category: MerchantCategorySchema,
      maskedLabel: z.string(),
      totalINR: z.number().nonnegative(),
      txCount: z.number().int().nonnegative(),
    })
  ),
  methodology_version: z.string().max(32),
});

export const CreateOrderRequestSchema = z.object({
  auditId: z.string().uuid(),
  accessToken: z.string().min(16),
  idempotencyKey: z.string().min(8).optional(),
});

export const VerifyPaymentRequestSchema = z.object({
  auditId: z.string().uuid(),
  accessToken: z.string().min(16),
  razorpay_order_id: z.string().min(6),
  razorpay_payment_id: z.string().min(6),
  razorpay_signature: z.string().min(16),
});
