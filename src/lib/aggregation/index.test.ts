import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAggregatedPayload,
  calculateSpendingIndex,
  generateDeterministicTeaser,
  generateProDossier,
} from "./index";
import { cleanMerchantName, normalizeDate, parseAmount, getTimeBucket } from "../parser/adapters";
import { NormalizedTransaction } from "@/types";

test("normalizeDate parses diverse Indian and UPI date formats", () => {
  assert.equal(normalizeDate("15/08/2024"), "2024-08-15");
  assert.equal(normalizeDate("01-Jan-2024"), "2024-01-01");
  assert.equal(normalizeDate("2024-05-20"), "2024-05-20");
  assert.equal(normalizeDate("29.02.2024"), "2024-02-29");
  // PhonePe & UPI month-first formats
  assert.equal(normalizeDate("Oct 02, 2024"), "2024-10-02");
  assert.equal(normalizeDate("Oct 2, 2024, 07:45 PM"), "2024-10-02");
  assert.equal(normalizeDate("October 5th, 2024"), "2024-10-05");
  assert.equal(normalizeDate("02-Oct-2024"), "2024-10-02");
  assert.equal(normalizeDate("invalid"), null);
});

test("parseAmount strips symbols and commas and handles large numbers", () => {
  assert.equal(parseAmount("₹ 1,250.50"), 1250.5);
  assert.equal(parseAmount("Rs. 450"), 450);
  assert.equal(parseAmount("Rs. 1500.00"), 1500);
  assert.equal(parseAmount("Rs. 5000.00"), 5000);
  assert.equal(parseAmount("INR 10,00,000.00"), 1000000);
});

test("getTimeBucket classifies 24h ranges accurately", () => {
  assert.equal(getTimeBucket("08:30"), "MORNING");
  assert.equal(getTimeBucket("14:15"), "AFTERNOON");
  assert.equal(getTimeBucket("20:45"), "EVENING");
  assert.equal(getTimeBucket("01:20"), "LATE_NIGHT");
  assert.equal(getTimeBucket(""), "UNKNOWN");
});

test("cleanMerchantName cleans brands, UPI and PhonePe text", () => {
  const brand = cleanMerchantName("UPI/428394829348/Swiggy/swiggy@icici", 450, "DEBIT");
  assert.equal(brand.name, "Swiggy");
  assert.equal(brand.category, "FOOD_DINING");

  const phonepeSwiggy = cleanMerchantName("Paid to Swiggy UPI DEBIT Rs. 340.00", 340, "DEBIT");
  assert.equal(phonepeSwiggy.name, "Swiggy");
  assert.equal(phonepeSwiggy.category, "FOOD_DINING");

  const phonepeTransfer = cleanMerchantName("Transfer to Amit Kumar DEBIT Rs. 1500.00", 1500, "DEBIT");
  assert.equal(phonepeTransfer.name, "Personal UPI Transfer");
  assert.equal(phonepeTransfer.category, "P2P_TRANSFER");

  const phonepeCredit = cleanMerchantName("Received from Dad CREDIT Rs. 5000.00", 5000, "CREDIT");
  assert.equal(phonepeCredit.name, "Dad");
  assert.equal(phonepeCredit.category, "P2P_TRANSFER");

  const cashback = cleanMerchantName("Cashback from PhonePe CREDIT Rs. 50.00", 50, "CREDIT");
  assert.equal(cashback.name, "Cashback Reward");
  assert.equal(cashback.category, "P2P_TRANSFER");

  const quickComm = cleanMerchantName("BLINKIT GURGAON IN", 240, "DEBIT");
  assert.equal(quickComm.name, "Blinkit");
  assert.equal(quickComm.category, "QUICK_COMMERCE");

  const microChai = cleanMerchantName("UPI/123/Ramesh Tea Stall", 30, "DEBIT");
  assert.equal(microChai.category, "FOOD_DINING");
});

test("buildAggregatedPayload calculates financial totals accurately", () => {
  const sampleRows: NormalizedTransaction[] = [
    {
      date: "2024-04-01",
      time: "10:00",
      merchantKey: "Salary Credit",
      amountINR: 50000,
      type: "CREDIT",
      timeBucket: "MORNING",
      categoryHint: "UNCLASSIFIED",
      parseConfidence: 0.99,
    },
    {
      date: "2024-04-02",
      time: "13:00",
      merchantKey: "Swiggy",
      amountINR: 350,
      type: "DEBIT",
      timeBucket: "AFTERNOON",
      categoryHint: "FOOD_DINING",
      parseConfidence: 0.99,
    },
    {
      date: "2024-04-03",
      time: "16:00",
      merchantKey: "Chai Point",
      amountINR: 40,
      type: "DEBIT",
      timeBucket: "AFTERNOON",
      categoryHint: "MICRO_QR",
      parseConfidence: 0.99,
    },
    {
      date: "2024-04-04",
      time: "23:45",
      merchantKey: "Zepto",
      amountINR: 180,
      type: "DEBIT",
      timeBucket: "LATE_NIGHT",
      categoryHint: "QUICK_COMMERCE",
      parseConfidence: 0.99,
    },
  ];

  const payload = buildAggregatedPayload(sampleRows, {
    parsedRows: 4,
    rejectedRows: 0,
    confidence: 0.98,
  });

  assert.equal(payload.totalCreditsINR, 50000);
  assert.equal(payload.totalDebitsINR, 570);
  assert.equal(payload.netCashFlowINR, 49430);
  assert.equal(payload.microDrainUnder100.count, 1);
  assert.equal(payload.microDrainUnder100.totalINR, 40);
  assert.equal(payload.lateNightSpendINR, 180);

  const index = calculateSpendingIndex(payload);
  assert.ok(index >= 0 && index <= 100);

  const teaser = generateDeterministicTeaser(payload);
  assert.ok(teaser.spending_index >= 0 && teaser.spending_index <= 100);
  assert.ok(teaser.summary.length > 10);

  const dossier = generateProDossier(payload);
  assert.ok(dossier.merchant_forensics.length > 0);
  assert.ok(dossier.savings_scenarios.length === 3);
});
