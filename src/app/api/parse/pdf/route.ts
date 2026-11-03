import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");
import { NormalizedTransaction, TransactionType } from "@/types";
import { matchBrand } from "@/lib/parser/brandDictionary";
import { getTimeBucket, normalizeDate, parseAmount, clientPseudonymize } from "@/lib/parser/adapters";
import { buildAggregatedPayload } from "@/lib/aggregation";

export async function POST(req: NextRequest) {
  let parser: any = null;
  try {
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

    const auditSalt = Math.random().toString(36).substring(7);
    const transactions: NormalizedTransaction[] = [];
    let rejectedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Date detection (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.)
      const dateMatch = line.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})/);
      if (!dateMatch) {
        rejectedCount++;
        continue;
      }

      const isoDate = normalizeDate(dateMatch[1]);
      if (!isoDate) {
        rejectedCount++;
        continue;
      }

      // Money amount detection (INR / Rs / ₹ / comma amounts)
      const amountMatches = line.match(/(?:(?:INR|Rs\.?|₹)\s*)?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+\.[0-9]{2})/g);
      if (!amountMatches || amountMatches.length === 0) {
        rejectedCount++;
        continue;
      }

      let amount = 0;
      for (const amtStr of amountMatches) {
        const parsed = parseAmount(amtStr);
        // Avoid treating years (e.g. 2024-2026) or PIN codes as amounts
        if (parsed > 0 && parsed !== 2024 && parsed !== 2025 && parsed !== 2026) {
          amount = parsed;
          break;
        }
      }

      if (amount <= 0) {
        rejectedCount++;
        continue;
      }

      const timeMatch = line.match(/(\d{1,2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : null;

      const lowerLine = line.toLowerCase();
      let type: TransactionType = "DEBIT";
      if (
        lowerLine.includes(" cr ") ||
        lowerLine.includes("/cr") ||
        lowerLine.endsWith("cr") ||
        lowerLine.includes("credit") ||
        lowerLine.includes("deposit") ||
        lowerLine.includes("salary") ||
        lowerLine.includes("refund")
      ) {
        type = "CREDIT";
      }

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
        { error: "Could not find readable transaction rows in this PDF. Please ensure it is a digital statement, not a photo." },
        { status: 422 }
      );
    }

    const payload = buildAggregatedPayload(transactions, {
      parsedRows: transactions.length,
      rejectedRows: rejectedCount,
      confidence: 0.96,
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
