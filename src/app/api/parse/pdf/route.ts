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

    const transactions: NormalizedTransaction[] = [];
    let rejectedCount = 0;

    // 1. Group lines into distinct transaction blocks starting with dates
    const dateRegex = /\b([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}|\d{1,2}[/\-.][A-Za-z]{3,9}[/\-.]\d{2,4}|\d{1,2}[/\-. ]\d{1,2}[/\-. ]\d{2,4}|\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]{3,9},?\s+\d{2,4})\b/i;
    
    interface RawTxnBlock {
      dateStr: string;
      rawText: string;
    }
    const blocks: RawTxnBlock[] = [];
    let lineBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Ignore header/footer boilerplate
      if (/^(page\s+\d+|statement\s+of\s+account|account\s+number|customer\s+id|branch|ifsc|opening\s+balance|closing\s+balance|total\s+debits|total\s+credits)/i.test(line)) {
        continue;
      }

      const match = line.match(dateRegex);
      if (match) {
        const prevText = lineBuffer.join(" ").trim();
        lineBuffer = [];
        blocks.push({
          dateStr: match[1],
          rawText: (prevText ? prevText + " " : "") + line,
        });
      } else {
        if (blocks.length > 0) {
          blocks[blocks.length - 1].rawText += " " + line;
        } else {
          lineBuffer.push(line);
        }
      }
    }

    // Helper to extract amounts from text
    const extractAmountsFromText = (text: string, dateStr?: string): number[] => {
      let cleaned = text;
      if (dateStr) {
        cleaned = cleaned.replace(dateStr, " ");
      }
      // Remove time stamps (HH:MM:SS or HH:MM)
      cleaned = cleaned.replace(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/g, " ");

      const amountRegex = /(?:(?:INR|Rs\.?|₹)\s*)?\b([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{1,2})?|[0-9]+\.[0-9]{1,2}|[0-9]+)\b/g;
      const matches = Array.from(cleaned.matchAll(amountRegex));
      const amounts: number[] = [];

      for (const m of matches) {
        const rawNum = m[1];
        if (!rawNum) continue;

        // Skip obvious account numbers or reference IDs (9+ digits without decimal point)
        if (!rawNum.includes(".") && rawNum.replace(/,/g, "").length >= 9) {
          continue;
        }

        const parsed = parseAmount(rawNum);
        // Filter out years and 0
        if (parsed > 0 && parsed !== 2023 && parsed !== 2024 && parsed !== 2025 && parsed !== 2026 && parsed !== 2027) {
          amounts.push(parsed);
        }
      }
      return amounts;
    };

    // 2. Parse each transaction block thoroughly
    for (const block of blocks) {
      const isoDate = normalizeDate(block.dateStr);
      if (!isoDate) {
        rejectedCount++;
        continue;
      }

      const blockText = block.rawText;
      const lower = blockText.toLowerCase();

      // Skip summary / opening balance rows
      if (lower.includes("opening balance") || lower.includes("brought forward") || lower.includes("b/f")) {
        continue;
      }

      // Extract time if present (HH:MM or HH:MM:SS)
      const timeMatch = blockText.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
      const time = timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : null;

      const amounts = extractAmountsFromText(blockText, block.dateStr);

      if (amounts.length === 0) {
        rejectedCount++;
        continue;
      }

      // Determine Debit vs Credit and transaction amount
      let type: TransactionType = "DEBIT";
      let txAmount = 0;

      const isExplicitCredit =
        /\b(cr|credit|deposit|salary|refund|cash deposit|interest paid|int\.pd|int earned|by transfer)\b/i.test(lower) ||
        lower.includes("/cr") ||
        lower.endsWith("cr");

      const isExplicitDebit =
        /\b(dr|debit|withdrawal|wdl|atm|pos|to transfer|payment to|purchase)\b/i.test(lower) ||
        lower.includes("/dr") ||
        lower.endsWith("dr");

      if (amounts.length >= 3) {
        // Table layout: [Withdrawal, Deposit, Balance]
        const wdl = amounts[0];
        const dep = amounts[1];
        if (wdl > 0 && dep === 0) {
          type = "DEBIT";
          txAmount = wdl;
        } else if (dep > 0 && wdl === 0) {
          type = "CREDIT";
          txAmount = dep;
        } else if (isExplicitCredit) {
          type = "CREDIT";
          txAmount = dep > 0 ? dep : wdl;
        } else {
          type = "DEBIT";
          txAmount = wdl > 0 ? wdl : dep;
        }
      } else if (amounts.length === 2) {
        // Table layout: [Txn_Amount, Balance]
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

      // Clean narration and merchant name (no special characters like # or @)
      const { name: merchantKey, category: categoryHint } = cleanMerchantName(blockText, txAmount, type);

      transactions.push({
        date: isoDate,
        time,
        merchantKey,
        amountINR: Math.round(txAmount * 100) / 100,
        type,
        timeBucket: getTimeBucket(time),
        categoryHint,
        parseConfidence: 0.96,
      });
    }

    // 3. Fallback: If blocks yielded 0 transactions, try line-by-line parsing
    if (transactions.length === 0) {
      for (const line of lines) {
        const dateMatch = line.match(dateRegex);
        if (!dateMatch) continue;

        const isoDate = normalizeDate(dateMatch[1]);
        if (!isoDate) continue;

        const lineLower = line.toLowerCase();
        if (lineLower.includes("opening balance") || lineLower.includes("closing balance")) continue;

        const lineAmounts = extractAmountsFromText(line, dateMatch[1]);
        if (lineAmounts.length === 0) continue;

        const txAmount = lineAmounts[0];
        const isCredit = /\b(cr|credit|deposit|salary|refund)\b/i.test(lineLower);
        const type: TransactionType = isCredit ? "CREDIT" : "DEBIT";

        const { name: merchantKey, category: categoryHint } = cleanMerchantName(line, txAmount, type);

        transactions.push({
          date: isoDate,
          time: null,
          merchantKey,
          amountINR: Math.round(txAmount * 100) / 100,
          type,
          timeBucket: "UNKNOWN",
          categoryHint,
          parseConfidence: 0.92,
        });
      }
    }

    // 4. Fallback: If still 0 transactions, match lines containing monetary amounts with nearest detected dates
    if (transactions.length === 0) {
      const allDates: string[] = [];
      for (const line of lines) {
        const m = line.match(dateRegex);
        if (m) {
          const d = normalizeDate(m[1]);
          if (d) allDates.push(d);
        }
      }
      const defaultDate = allDates[0] || new Date().toISOString().slice(0, 10);

      let currentDate = defaultDate;
      for (const line of lines) {
        const dateMatch = line.match(dateRegex);
        if (dateMatch) {
          const d = normalizeDate(dateMatch[1]);
          if (d) currentDate = d;
        }

        const lineLower = line.toLowerCase();
        if (lineLower.includes("opening balance") || lineLower.includes("closing balance") || lineLower.includes("page ")) {
          continue;
        }

        const amounts = extractAmountsFromText(line);
        if (amounts.length > 0) {
          const txAmount = amounts[0];
          const isCredit = /\b(cr|credit|deposit|salary|refund)\b/i.test(lineLower);
          const type: TransactionType = isCredit ? "CREDIT" : "DEBIT";
          const { name: merchantKey, category: categoryHint } = cleanMerchantName(line, txAmount, type);

          transactions.push({
            date: currentDate,
            time: null,
            merchantKey,
            amountINR: Math.round(txAmount * 100) / 100,
            type,
            timeBucket: "UNKNOWN",
            categoryHint,
            parseConfidence: 0.88,
          });
        }
      }
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Could not find readable transaction records in this PDF. Please ensure it is an official bank statement PDF." },
        { status: 422 }
      );
    }

    const payload = buildAggregatedPayload(transactions, {
      parsedRows: transactions.length,
      rejectedRows: rejectedCount,
      confidence: 0.98,
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
