import { NormalizedTransaction, TimeBucket, TransactionType, MerchantCategory } from "@/types";
import { matchBrand } from "./brandDictionary";

export interface StatementAdapter {
  id: string;
  name: string;
  detect: (headers: string[], sampleRows: string[][]) => boolean;
  parseRow: (
    row: Record<string, string>,
    rowIndex: number,
    auditSalt: string
  ) => NormalizedTransaction | null;
}

/**
 * Determine time bucket according to PRD section 8.4
 * MORNING: 06:00 - 11:59
 * AFTERNOON: 12:00 - 17:59
 * EVENING: 18:00 - 22:59
 * LATE_NIGHT: 23:00 - 05:59
 */
export function getTimeBucket(timeStr: string | null | undefined): TimeBucket {
  if (!timeStr) return "UNKNOWN";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return "UNKNOWN";
  const hour = parseInt(match[1], 10);
  if (hour >= 6 && hour < 12) return "MORNING";
  if (hour >= 12 && hour < 18) return "AFTERNOON";
  if (hour >= 18 && hour < 23) return "EVENING";
  if (hour >= 23 || hour < 6) return "LATE_NIGHT";
  return "UNKNOWN";
}

/**
 * Normalizes Indian date formats to ISO YYYY-MM-DD.
 * Supports: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY, YYYY-MM-DD,
 *           DD-Mon-YYYY, DD Mon YY, Mon DD YYYY
 * Returns null for invalid or unparseable dates.
 */
export function normalizeDate(rawDate: string): string | null {
  if (!rawDate) return null;
  // Clean off trailing timestamp like ', 07:45 PM' or 'at 07:45 pm' or '19:30:00'
  const clean = rawDate
    .trim()
    .replace(/(?:,\s*|\s+at\s+|\s+)(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i, "")
    .trim();

  // YYYY-MM-DD (ISO)
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const [, m, d] = clean.split("-").map(Number);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return clean;
    return null;
  }

  // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY, DD-MM-YY, DD.MM.YY
  const dmyMatch = clean.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    let yearStr = dmyMatch[3];
    if (yearStr.length === 2) {
      const yr = parseInt(yearStr, 10);
      yearStr = (yr > 70 ? "19" : "20") + yearStr;
    }
    const year = parseInt(yearStr, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      return `${yearStr}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }

  const MONTH_MAP: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12"
  };

  // DD-Mon-YYYY, DD Mon YYYY, DD/Mon/YYYY (with optional st/nd/rd/th)
  const monMatch = clean.match(/^(\d{1,2})(?:st|nd|rd|th)?[/\-.\s]([A-Za-z]{3,9})[/\-.\s](\d{2,4})$/i);
  if (monMatch) {
    const day = parseInt(monMatch[1], 10);
    const monthStr = monMatch[2].toLowerCase().slice(0, 3);
    let yearStr = monMatch[3];
    if (yearStr.length === 2) {
      const yr = parseInt(yearStr, 10);
      yearStr = (yr > 70 ? "19" : "20") + yearStr;
    }
    const month = MONTH_MAP[monthStr];
    const year = parseInt(yearStr, 10);
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      return `${yearStr}-${month}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }

  // Mon DD, YYYY or Month DD YYYY (e.g. Sep 15, 2024, Oct 02 2024, October 2nd, 2024)
  const usMatch = clean.match(/^([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{2,4})$/i);
  if (usMatch) {
    const monthStr = usMatch[1].toLowerCase().slice(0, 3);
    const day = parseInt(usMatch[2], 10);
    let yearStr = usMatch[3];
    if (yearStr.length === 2) {
      const yr = parseInt(yearStr, 10);
      yearStr = (yr > 70 ? "19" : "20") + yearStr;
    }
    const month = MONTH_MAP[monthStr];
    const year = parseInt(yearStr, 10);
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      return `${yearStr}-${month}-${String(day).padStart(2, "0")}`;
    }
    return null;
  }

  return null;
}

/**
 * Cleans monetary numbers: removes commas, Rs., INR symbols
 */
export function parseAmount(val: string | undefined): number {
  if (!val) return 0;
  const clean = val.replace(/₹|Rs\.?|INR|,|\s/gi, "").trim();
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.abs(num);
}

const BANK_TOKENS = new Set([
  "HDFC", "SBIN", "SBI", "ICIC", "ICICI", "UTIB", "AXIS", "KKBK", "KOTAK", "PUNB", "PNB",
  "BARB", "BOB", "YESB", "YES", "IDFB", "IDFC", "INDB", "INDUSIND", "CNRB", "CANARA",
  "PAYTM", "PYTM", "PHONEPE", "GPAY", "GOOGLEPAY", "BHIM", "UPI", "P2M", "P2P", "P2A",
  "CR", "DR", "DEBIT", "CREDIT", "REV", "RET", "IMPS", "NEFT", "RTGS", "POS", "EAW",
  "BIL", "INB", "ACH", "CMS", "NACH", "INF", "VPS"
]);

/**
 * Intelligently cleans and extracts readable merchant names and categories.
 * Completely eliminates confusing hashes like M_#47EA, and strips # and @ symbols.
 */
export function cleanMerchantName(
  rawNarration: string,
  amount: number,
  type: TransactionType
): { name: string; category: MerchantCategory } {
  if (!rawNarration || rawNarration.trim().length === 0) {
    if (type === "CREDIT") return { name: "Bank Transfer / Deposit", category: "P2P_TRANSFER" };
    return { name: "Local Store Payment", category: "UNCLASSIFIED" };
  }

  // 1. Check known brands first
  const brand = matchBrand(rawNarration);
  if (brand) {
    return { name: brand.canonicalName, category: brand.category };
  }

  // 2. Intelligent UPI & Narration Segment Extractor
  let candidate = "";
  if (rawNarration.includes("/") || rawNarration.includes("-")) {
    const delimiter = rawNarration.includes("/") ? "/" : "-";
    const parts = rawNarration.split(delimiter).map((p) => p.trim()).filter(Boolean);
    for (const part of parts) {
      const upper = part.toUpperCase();
      if (/^\d+$/.test(part)) continue;
      if (BANK_TOKENS.has(upper)) continue;
      if (/^\d{2,}[a-zA-Z\d]+$/.test(part)) continue; // Ref numbers
      if (part.includes("@")) {
        const vpaUser = part.split("@")[0].replace(/[^a-zA-Z\s]/g, " ").trim();
        if (vpaUser.length >= 3 && !BANK_TOKENS.has(vpaUser.toUpperCase())) {
          candidate = vpaUser;
        }
        continue;
      }
      if (part.length >= 3) {
        candidate = part;
        break;
      }
    }
  }

  if (!candidate) {
    candidate = rawNarration;
  }

  // Check for cashback or refund
  if (/cashback/i.test(rawNarration)) {
    return { name: "Cashback Reward", category: "P2P_TRANSFER" };
  }

  // 3. Clean up masked card numbers, boilerplate bank phrases & punctuation
  candidate = candidate.replace(/\b\d*[Xx]+\d*\b/g, " "); // masked cards e.g. 412345XXXXXX
  candidate = candidate.replace(
    /\b(pay to|paid to|transfer to|payment from|transfer from|sent to|received from|to transfer|by transfer|payment from phonepe|payment from gpay|payment from paytm|pos txn|upi txn|imps txn|neft txn|cashback from|refund from|money sent to|money received from|bill payment to|autopay to)\b/gi,
    " "
  );
  candidate = candidate.replace(/\b(rs\.?|inr|debit|credit|dr|cr)\b/gi, " "); // currency & markers
  candidate = candidate.replace(/@[a-zA-Z0-9._-]+/g, " "); // remove @vpa handles
  candidate = candidate.replace(/\b\d{5,}\b/g, " "); // remove long numeric IDs
  candidate = candidate.replace(/[#@/\\_*~^%$&()+={}\[\]|:;\"'<>?,.]/g, " "); // remove special characters
  candidate = candidate.replace(/\s+/g, " ").trim();

const MONTH_TOKENS = new Set([
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
]);

  // Filter out stray bank codes, months, and currencies
  const words = candidate
    .split(" ")
    .filter(
      (w) =>
        !BANK_TOKENS.has(w.toUpperCase()) &&
        !MONTH_TOKENS.has(w.toUpperCase()) &&
        !/^\d+$/.test(w) &&
        !/^(rs|inr|re|dr|cr|debit|credit|upi)$/i.test(w)
    );
  candidate = words.join(" ").trim();

  // Format to Title Case
  if (candidate.length >= 2) {
    candidate = candidate
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  // 4. Clean Fallbacks if empty or numeric
  if (!candidate || candidate.length < 2) {
    if (amount < 100) return { name: "Local Store / Tea & Snacks (UPI)", category: "MICRO_QR" };
    if (type === "CREDIT") return { name: "Bank Deposit / Income", category: "P2P_TRANSFER" };
    return { name: "Local Store Payment (UPI)", category: "MICRO_QR" };
  }

  // 5. Intelligent Category Assignment
  let category: MerchantCategory = "UNCLASSIFIED";
  const lower = candidate.toLowerCase();
  if (/cafe|tea|coffee|restaurant|sweets|bakes|kitchen|biryani|dhaba|bakery|food|burger|pizza|bar|dining|caterer/i.test(lower)) {
    category = "FOOD_DINING";
  } else if (/mart|kirana|supermarket|grocery|provision|store|vegetable|fruits|dairy|milk/i.test(lower)) {
    category = "QUICK_COMMERCE";
  } else if (/fuel|petrol|pump|cabs|auto|taxi|toll|fastag|metro|rail/i.test(lower)) {
    category = "MOBILITY";
  } else if (/recharge|bill|broadband|electricity|utility|insurance|lic|broadband|wifi/i.test(lower)) {
    category = "SUBSCRIPTIONS";
  } else if (/pharmacy|medical|chemist|hospital|clinic|diagnostics/i.test(lower)) {
    category = "SHOPPING";
  } else if (type === "CREDIT") {
    category = "P2P_TRANSFER";
  } else if (amount < 100) {
    category = "MICRO_QR";
  }

  // Add friendly (UPI) indicator if it was a UPI transaction and not already named
  if (/UPI/i.test(rawNarration) && !candidate.toLowerCase().includes("upi")) {
    candidate += " (UPI)";
  }

  candidate = candidate.slice(0, 60).trim();

  return { name: candidate, category };
}

/**
 * Backward compatibility alias for clientPseudonymize.
 * Returns clean human-readable name without hashes.
 */
export function clientPseudonymize(rawNarration: string, _auditSalt?: string): string {
  const result = cleanMerchantName(rawNarration, 100, "DEBIT");
  return result.name;
}

// 1. HDFC Bank Adapter
export const HdfcAdapter: StatementAdapter = {
  id: "hdfc-bank",
  name: "HDFC Bank Statement",
  detect(headers) {
    const h = headers.map((x) => x.toLowerCase());
    return (
      h.some((k) => k.includes("narration")) &&
      h.some((k) => k.includes("withdrawal") || k.includes("debit")) &&
      h.some((k) => k.includes("deposit") || k.includes("credit"))
    );
  },
  parseRow(row, _idx) {
    const dateCol = Object.keys(row).find((k) => /date/i.test(k));
    const narrationCol = Object.keys(row).find((k) => /narration|description|details/i.test(k));
    const withdrawalCol = Object.keys(row).find((k) => /withdrawal|debit/i.test(k));
    const depositCol = Object.keys(row).find((k) => /deposit|credit/i.test(k));

    if (!dateCol || !narrationCol) return null;
    const date = normalizeDate(row[dateCol]);
    if (!date) return null;

    const narration = (row[narrationCol] || "").trim();
    if (!narration) return null;

    const debitAmt = parseAmount(row[withdrawalCol || ""]);
    const creditAmt = parseAmount(row[depositCol || ""]);

    let type: TransactionType = "DEBIT";
    let amount = debitAmt;

    if (debitAmt > 0) {
      type = "DEBIT";
      amount = debitAmt;
    } else if (creditAmt > 0) {
      type = "CREDIT";
      amount = creditAmt;
    } else {
      return null;
    }

    // Try extracting time if present in narration
    const timeMatch = narration.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : null;

    // Clean merchant name & category
    const { name: merchantKey, category: categoryHint } = cleanMerchantName(narration, amount, type);

    return {
      date,
      time,
      merchantKey,
      amountINR: Math.round(amount * 100) / 100,
      type,
      timeBucket: getTimeBucket(time),
      categoryHint,
      parseConfidence: 0.95,
      rawNarrationSnippet: narration.slice(0, 30),
    };
  },
};

// 2. SBI (State Bank of India) Adapter
export const SbiAdapter: StatementAdapter = {
  id: "sbi-bank",
  name: "State Bank of India (SBI)",
  detect(headers) {
    const h = headers.map((x) => x.toLowerCase());
    return (
      h.some((k) => k.includes("txn date")) ||
      (h.some((k) => k.includes("description")) && h.some((k) => k.includes("ref no")))
    );
  },
  parseRow(row, _idx) {
    const dateCol = Object.keys(row).find((k) => /txn\s*date|date/i.test(k));
    const descCol = Object.keys(row).find((k) => /description|particulars/i.test(k));
    const debitCol = Object.keys(row).find((k) => /debit/i.test(k));
    const creditCol = Object.keys(row).find((k) => /credit/i.test(k));

    if (!dateCol || !descCol) return null;
    const date = normalizeDate(row[dateCol]);
    if (!date) return null;

    const narration = (row[descCol] || "").trim();
    if (!narration) return null;

    const debitAmt = parseAmount(row[debitCol || ""]);
    const creditAmt = parseAmount(row[creditCol || ""]);

    let type: TransactionType = "DEBIT";
    let amount = debitAmt;
    if (debitAmt > 0) {
      type = "DEBIT";
      amount = debitAmt;
    } else if (creditAmt > 0) {
      type = "CREDIT";
      amount = creditAmt;
    } else {
      return null;
    }

    const timeMatch = narration.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : null;

    const { name: merchantKey, category: categoryHint } = cleanMerchantName(narration, amount, type);

    return {
      date,
      time,
      merchantKey,
      amountINR: Math.round(amount * 100) / 100,
      type,
      timeBucket: getTimeBucket(time),
      categoryHint,
      parseConfidence: 0.94,
      rawNarrationSnippet: narration.slice(0, 30),
    };
  },
};

// 3. PhonePe / Paytm / UPI Statement Adapter
export const UpiStatementAdapter: StatementAdapter = {
  id: "upi-apps",
  name: "PhonePe / Paytm / Google Pay UPI",
  detect(headers) {
    const h = headers.map((x) => x.toLowerCase());
    return (
      h.some((k) => k.includes("paid to") || k.includes("activity") || k.includes("upi transaction id"))
    );
  },
  parseRow(row, _idx) {
    const dateCol = Object.keys(row).find((k) => /date/i.test(k));
    const descCol = Object.keys(row).find((k) => /paid to|activity|description|details|recipient/i.test(k));
    const typeCol = Object.keys(row).find((k) => /type|money in|money out|status/i.test(k));
    const amtCol = Object.keys(row).find((k) => /amount|money out|paid/i.test(k));

    if (!dateCol || !descCol) return null;
    const date = normalizeDate(row[dateCol]);
    if (!date) return null;

    const narration = (row[descCol] || "").trim();
    const typeVal = (row[typeCol || ""] || "").toLowerCase();
    const amount = parseAmount(row[amtCol || ""]);

    if (amount <= 0) return null;

    const isCredit = typeVal.includes("received") || typeVal.includes("credit") || typeVal.includes("in");
    const type: TransactionType = isCredit ? "CREDIT" : "DEBIT";

    const timeMatch = (row[dateCol] + " " + narration).match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : null;

    const { name: merchantKey, category: categoryHint } = cleanMerchantName(narration, amount, type);

    return {
      date,
      time,
      merchantKey,
      amountINR: Math.round(amount * 100) / 100,
      type,
      timeBucket: getTimeBucket(time),
      categoryHint,
      parseConfidence: 0.96,
      rawNarrationSnippet: narration.slice(0, 30),
    };
  },
};

// 4. Generic Bank CSV Adapter (Intelligent fallback)
export const GenericBankCsvAdapter: StatementAdapter = {
  id: "generic-csv",
  name: "Generic Indian Bank CSV",
  detect: () => true, // Fallback when others don't match
  parseRow(row, _idx) {
    const keys = Object.keys(row);
    const dateKey = keys.find((k) => /date|dt/i.test(k));
    const narrationKey = keys.find((k) => /narration|desc|detail|particular|payee/i.test(k));
    const debitKey = keys.find((k) => /debit|withdrawal|dr|spent|outflow/i.test(k));
    const creditKey = keys.find((k) => /credit|deposit|cr|inflow/i.test(k));
    const amountKey = keys.find((k) => /amount|amt/i.test(k));

    if (!dateKey || !narrationKey) return null;

    const date = normalizeDate(row[dateKey]);
    if (!date) return null;

    const narration = (row[narrationKey] || "").trim();
    if (!narration) return null;

    let type: TransactionType = "DEBIT";
    let amount = 0;

    if (debitKey && parseAmount(row[debitKey]) > 0) {
      type = "DEBIT";
      amount = parseAmount(row[debitKey]);
    } else if (creditKey && parseAmount(row[creditKey]) > 0) {
      type = "CREDIT";
      amount = parseAmount(row[creditKey]);
    } else if (amountKey && parseAmount(row[amountKey]) > 0) {
      amount = parseAmount(row[amountKey]);
      const rawText = JSON.stringify(row).toLowerCase();
      if (rawText.includes("cr") || rawText.includes("credit") || rawText.includes("refund")) {
        type = "CREDIT";
      } else {
        type = "DEBIT";
      }
    } else {
      return null;
    }

    const timeMatch = (row[dateKey] + " " + narration).match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : null;

    const { name: merchantKey, category: categoryHint } = cleanMerchantName(narration, amount, type);

    return {
      date,
      time,
      merchantKey,
      amountINR: Math.round(amount * 100) / 100,
      type,
      timeBucket: getTimeBucket(time),
      categoryHint,
      parseConfidence: 0.90,
      rawNarrationSnippet: narration.slice(0, 30),
    };
  },
};

export const ALL_ADAPTERS: StatementAdapter[] = [
  HdfcAdapter,
  SbiAdapter,
  UpiStatementAdapter,
  GenericBankCsvAdapter,
];
