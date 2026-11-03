import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
import { NormalizedTransaction, TransactionType } from "@/types";
import { matchBrand } from "@/lib/parser/brandDictionary";
import { getTimeBucket, normalizeDate, parseAmount, clientPseudonymize } from "@/lib/parser/adapters";
import { buildAggregatedPayload } from "@/lib/aggregation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Fast PDF text parsing
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "This statement appears to be scanned or image-only. Text could not be extracted." },
        { status: 422 }
      );
    }

    const lines: string[] = (text as string).split(/\r?\n/).map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    const auditSalt = Math.random().toString(36).substring(7);

    const transactions: NormalizedTransaction[] = [];
    let rejectedCount = 0;

    // Line-by-line regex parsing for Indian bank & UPI statements
    // Matches patterns like: 15/09/2026 UPI/Swiggy/... 450.00
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Date pattern
      const dateMatch = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/);
      if (!dateMatch) {
        rejectedCount++;
        continue;
      }

      const isoDate = normalizeDate(dateMatch[1]);
      if (!isoDate) {
        rejectedCount++;
        continue;
      }

      // Money amount pattern (e.g. 1,450.00 or 50.00)
      const amountMatches = line.match(/(?:(?:INR|Rs\.?|₹)\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+(?:\.[0-9]{2})?)/g);
      if (!amountMatches || amountMatches.length === 0) {
        rejectedCount++;
        continue;
      }

      // Take the first or second numerical amount on the line
      let amount = 0;
      for (const amtStr of amountMatches) {
        const parsed = parseAmount(amtStr);
        // Avoid treating dates or reference IDs (e.g. 2026) as amounts if small or huge
        if (parsed > 0 && parsed !== 2024 && parsed !== 2025 && parsed !== 2026) {
          amount = parsed;
          break;
        }
      }

      if (amount <= 0) {
        rejectedCount++;
        continue;
      }

      // Time pattern if present
      const timeMatch = line.match(/(\d{1,2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : null;

      // Classify Debit vs Credit
      const lowerLine = line.toLowerCase();
      let type: TransactionType = "DEBIT";
      if (lowerLine.includes("cr") || lowerLine.includes("credit") || lowerLine.includes("deposit") || lowerLine.includes("refund")) {
        type = "CREDIT";
      }

      // Brand matching
      const brand = matchBrand(line);
      const merchantKey = brand ? brand.canonicalName : clientPseudonymize(line, auditSalt);
      const categoryHint = brand ? brand.category : (amount < 100 ? "MICRO_QR" : "UNCLASSIFIED");

      transactions.push({
        date: isoDate,
        time,
        merchantKey,
        amountINR: Math.round(amount * 100) / 100,
        type,
        timeBucket: getTimeBucket(time),
        categoryHint,
        parseConfidence: 0.95,
      });
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Could not detect tabular transaction rows. Please ensure your PDF is not a scanned photo." },
        { status: 422 }
      );
    }

    const payload = buildAggregatedPayload(transactions, {
      parsedRows: transactions.length,
      rejectedRows: rejectedCount,
      confidence: 0.95,
    });

    return NextResponse.json({
      success: true,
      transactions,
      payload,
    });
  } catch (err: any) {
    console.error("PDF parse server error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to parse PDF document." },
      { status: 500 }
    );
  }
}
