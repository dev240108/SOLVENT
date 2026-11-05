import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");
import { NormalizedTransaction, TransactionType } from "@/types";
import { getTimeBucket, normalizeDate, parseAmount, cleanMerchantName } from "@/lib/parser/adapters";
import { buildAggregatedPayload } from "@/lib/aggregation";

// Ensure pdfjs fake worker can resolve on Node / Next.js
function configurePdfWorker() {
  try {
    const possiblePaths = [
      path.join(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/cjs/pdf.worker.mjs"),
      path.join(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        const fileUrl = pathToFileURL(p).href;
        PDFParse.setWorker(fileUrl);
        break;
      }
    }
  } catch (err) {
    console.warn("Could not set custom worker path:", err);
  }
}

// ── STRICT date regex: only matches real dates, not random numbers ──
// Matches: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD/MM/YY, YYYY-MM-DD,
//          DD-Mon-YYYY, DD Mon YYYY, DD/Mon/YY
const STRICT_DATE_RE = /(?:^|\s)((\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})|(\d{4})-(\d{2})-(\d{2})|(\d{1,2})[/\-.\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[/\-.\s](\d{2,4}))(?=\s|$)/i;

/**
 * Validates that a matched date string actually represents a plausible date.
 * Returns ISO YYYY-MM-DD or null.
 */
function strictNormalizeDate(raw: string): string | null {
  const iso = normalizeDate(raw);
  if (!iso) return null;

  // Validate the ISO date is a real calendar date
  const [yearStr, monthStr, dayStr] = iso.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 2000 || year > 2030) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  // Check real date validity
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }

  return iso;
}

/**
 * Checks if the PDF text looks like a real bank statement.
 * A genuine bank statement has a high density of transaction-like lines:
 * lines starting with dates and containing monetary amounts.
 */
function isBankStatement(lines: string[]): boolean {
  let dateLineCount = 0;
  let totalMoneyLines = 0;

  for (const line of lines) {
    const hasDate = STRICT_DATE_RE.test(line);
    const hasMoney = /(?:₹|Rs\.?|INR)?\s*\d{1,3}(?:,\d{2,3})*\.\d{2}\b/.test(line);

    if (hasDate) dateLineCount++;
    if (hasMoney) totalMoneyLines++;
  }

  // A real bank statement has at least 3 date lines and 3 money lines
  return dateLineCount >= 3 && totalMoneyLines >= 3;
}

/**
 * Extracts monetary amounts from a text block.
 * STRICT: only matches numbers with exactly 2 decimal places (like 450.00, 1,500.50)
 * or numbers prefixed with ₹/Rs/INR.
 */
function extractMonetaryAmounts(text: string): number[] {
  const amounts: number[] = [];

  // Pattern 1: ₹/Rs/INR prefixed amounts (with or without decimals)
  const prefixedRegex = /(?:₹|Rs\.?\s*|INR\s+)(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)/g;
  let m: RegExpExecArray | null;
  while ((m = prefixedRegex.exec(text)) !== null) {
    const parsed = parseAmount(m[1]);
    if (parsed > 0) amounts.push(parsed);
  }

  // Pattern 2: Numbers with exactly 2 decimal places (standard bank format: 450.00, 1,50,000.00)
  const decimalRegex = /\b(\d{1,3}(?:,\d{2,3})*\.\d{2})\b/g;
  while ((m = decimalRegex.exec(text)) !== null) {
    const parsed = parseAmount(m[1]);
    if (parsed > 0 && !amounts.includes(parsed)) {
      // Filter out years, version numbers, and obviously non-monetary values
      if (parsed >= 2020 && parsed <= 2030) continue; // Years
      if (parsed < 0.01) continue; // Too small
      amounts.push(parsed);
    }
  }

  return amounts;
}

export async function POST(req: NextRequest) {
  let parser: any = null;
  try {
    configurePdfWorker();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = (formData.get("password") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize parser
    parser = new PDFParse({
      data: buffer,
      password: password || undefined,
    });

    try {
      await parser.load();
    } catch (loadErr: any) {
      const errMsg = (loadErr?.message || "").toLowerCase();
      const errName = loadErr?.name || "";
      const isEncrypted =
        errName === "PasswordException" ||
        errMsg.includes("password") ||
        errMsg.includes("encrypted") ||
        loadErr?.code === 1;

      if (isEncrypted) {
        return NextResponse.json({
          isEncrypted: true,
          error: password
            ? "Incorrect statement password. Please try again."
            : "This PDF statement is password-protected. Please enter the password to continue.",
        });
      }

      throw loadErr;
    }

    const textResult = await parser.getText();
    const text: string = textResult?.text || "";

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "This statement appears to be scanned or image-only. Text could not be extracted." },
        { status: 422 }
      );
    }

    const lines: string[] = text
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    // ── STEP 0: Verify this is actually a bank statement ──
    if (!isBankStatement(lines)) {
      return NextResponse.json(
        {
          error: "This PDF does not appear to be a bank or UPI statement. Please upload a statement downloaded from your bank's netbanking portal or your UPI app (PhonePe, GPay, Paytm).",
        },
        { status: 422 }
      );
    }

    const transactions: NormalizedTransaction[] = [];
    let rejectedCount = 0;

    // ── STEP 1: Group lines into transaction blocks starting with valid dates ──
    interface RawTxnBlock {
      dateStr: string;
      isoDate: string;
      rawText: string;
    }
    const blocks: RawTxnBlock[] = [];
    let pendingLines: string[] = [];

    // Header/footer/summary patterns to skip entirely
    const SKIP_LINE_RE = /^(page\s+\d|statement\s+of\s+account|account\s+number|customer\s+id|branch\b|ifsc\b|opening\s+balance|closing\s+balance|total\s+debit|total\s+credit|date\s+particular|date\s+narration|date\s+description|txn\s+date|value\s+date|transaction\s+date|sr\.?\s*no|s\.?\s*no\b)/i;

    for (const line of lines) {
      if (SKIP_LINE_RE.test(line)) continue;

      const dateMatch = line.match(STRICT_DATE_RE);
      if (dateMatch) {
        const dateStr = dateMatch[1].trim();
        const isoDate = strictNormalizeDate(dateStr);

        if (isoDate) {
          // Start a new block
          blocks.push({
            dateStr,
            isoDate,
            rawText: line,
          });
          pendingLines = [];
          continue;
        }
      }

      // Append to last block (continuation lines)
      if (blocks.length > 0) {
        blocks[blocks.length - 1].rawText += " " + line;
      } else {
        pendingLines.push(line);
      }
    }

    // ── STEP 2: Parse each transaction block ──
    for (const block of blocks) {
      const blockText = block.rawText;
      const lower = blockText.toLowerCase();

      // Skip summary/balance rows
      if (
        lower.includes("opening balance") ||
        lower.includes("closing balance") ||
        lower.includes("brought forward") ||
        lower.includes("carried forward") ||
        lower.includes("b/f") ||
        lower.includes("c/f") ||
        lower.includes("total debits") ||
        lower.includes("total credits")
      ) {
        continue;
      }

      // ── Extract time if present ──
      const timeMatch = blockText.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
      const time = timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : null;

      // ── Extract monetary amounts (STRICT: only .XX decimals or ₹-prefixed) ──
      // First remove the date portion to avoid parsing date digits as amounts
      let textWithoutDate = blockText.replace(block.dateStr, " ");
      // Remove time stamps too
      if (time) {
        textWithoutDate = textWithoutDate.replace(/\b[01]?\d|2[0-3]:[0-5]\d(?::[0-5]\d)?\b/, " ");
      }

      const amounts = extractMonetaryAmounts(textWithoutDate);

      if (amounts.length === 0) {
        rejectedCount++;
        continue;
      }

      // ── Determine Debit vs Credit ──
      let type: TransactionType = "DEBIT";
      let txAmount = 0;

      const isExplicitCredit =
        /\b(cr|credit|credited|deposit|deposited|salary|refund|cash\s*deposit|interest\s*paid|int\.?\s*pd|int\s*earned|by\s*transfer|by\s*clg|neft\s*cr|rtgs\s*cr|imps\s*cr)\b/i.test(lower) ||
        /\/cr\b/i.test(lower) ||
        /\bcr\s*$/i.test(lower.trim());

      const isExplicitDebit =
        /\b(dr|debit|debited|withdrawal|wdl|atm\s*wdl|atm\s*cwl|pos\b|purchase|payment|to\s*transfer|paid|neft\s*dr|rtgs\s*dr|imps\s*dr|ach\s*dr|nach\s*dr|emi)\b/i.test(lower) ||
        /\/dr\b/i.test(lower) ||
        /\bdr\s*$/i.test(lower.trim());

      if (amounts.length >= 3) {
        // Tabular layout: typically [Withdrawal, Deposit, Balance] or [Debit, Credit, Balance]
        const col1 = amounts[0]; // Withdrawal/Debit amount
        const col2 = amounts[1]; // Deposit/Credit amount
        // amounts[2] is Balance — we never use it as txAmount

        // In bank statements with separate columns, one column is 0 or absent
        if (isExplicitCredit && !isExplicitDebit) {
          type = "CREDIT";
          // Credit amount is typically in the second column
          txAmount = col2 > 0 ? col2 : col1;
        } else if (isExplicitDebit && !isExplicitCredit) {
          type = "DEBIT";
          txAmount = col1 > 0 ? col1 : col2;
        } else {
          // No explicit marker — use column position heuristic
          // The smaller non-balance amount is the transaction
          type = "DEBIT";
          txAmount = col1;
        }
      } else if (amounts.length === 2) {
        // [Transaction_Amount, Balance] or [Debit, Credit]
        txAmount = amounts[0];
        type = isExplicitCredit && !isExplicitDebit ? "CREDIT" : "DEBIT";
      } else {
        // Single amount
        txAmount = amounts[0];
        type = isExplicitCredit && !isExplicitDebit ? "CREDIT" : "DEBIT";
      }

      if (txAmount <= 0) {
        rejectedCount++;
        continue;
      }

      // ── Clean merchant name ──
      const { name: merchantKey, category: categoryHint } = cleanMerchantName(blockText, txAmount, type);

      transactions.push({
        date: block.isoDate,
        time,
        merchantKey,
        amountINR: Math.round(txAmount * 100) / 100,
        type,
        timeBucket: getTimeBucket(time),
        categoryHint,
        parseConfidence: 0.96,
      });
    }

    // ── STEP 3: Validate results ──
    if (transactions.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not find readable transaction records in this PDF. Please make sure you upload an official bank statement PDF downloaded from your bank's netbanking portal — not a screenshot, scan, or other document.",
        },
        { status: 422 }
      );
    }

    // ── Quality check: calculate actual confidence ──
    const totalBlocks = blocks.length;
    const parsedRatio = totalBlocks > 0 ? transactions.length / totalBlocks : 0;
    const confidence = Math.min(0.99, Math.max(0.5, parsedRatio));

    const payload = buildAggregatedPayload(transactions, {
      parsedRows: transactions.length,
      rejectedRows: rejectedCount,
      confidence: Math.round(confidence * 100) / 100,
    });

    return NextResponse.json({
      success: true,
      transactions,
      payload,
    });
  } catch (err: any) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to parse PDF document." },
      { status: 500 }
    );
  } finally {
    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch {}
    }
  }
}
