import Papa from "papaparse";
import { AggregatedStatementPayload, NormalizedTransaction } from "@/types";
import { ALL_ADAPTERS } from "./adapters";
import { buildAggregatedPayload } from "../aggregation";
import { scanPayloadForPii } from "./piiScanner";

export interface ParseResult {
  success: boolean;
  transactions?: NormalizedTransaction[];
  payload?: AggregatedStatementPayload;
  adapterUsed?: string;
  error?: string;
  isEncrypted?: boolean;
}

/**
 * Parses a statement CSV string or file content purely on the client side.
 * Never uploads raw files or unredacted text to any server!
 */
export async function parseStatementLocally(
  fileContent: string,
  fileName: string,
  auditSalt: string
): Promise<ParseResult> {
  return new Promise((resolve) => {
    // 1. Check if empty or malformed
    if (!fileContent || fileContent.trim().length === 0) {
      return resolve({
        success: false,
        error: "File appears to be empty or unreadable.",
      });
    }

    // 2. Parse with PapaParse
    Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const rows = results.data;
        if (!rows || rows.length === 0) {
          return resolve({
            success: false,
            error: "No tabular rows found. Scanned or image-only PDFs are not supported for local parsing.",
          });
        }

        const headers = results.meta.fields || [];

        // 3. Find matching adapter
        const matchedAdapter = ALL_ADAPTERS.find((adapter) =>
          adapter.detect(headers, [])
        ) || ALL_ADAPTERS[ALL_ADAPTERS.length - 1]; // fallback to generic CSV

        const normalizedTxns: NormalizedTransaction[] = [];
        let rejectedCount = 0;

        for (let i = 0; i < rows.length; i++) {
          try {
            const parsed = matchedAdapter.parseRow(rows[i], i, auditSalt);
            if (parsed && parsed.amountINR > 0) {
              normalizedTxns.push(parsed);
            } else {
              rejectedCount++;
            }
          } catch {
            rejectedCount++;
          }
        }

        if (normalizedTxns.length === 0) {
          return resolve({
            success: false,
            error: "Could not identify valid transaction amounts or dates in this file layout.",
          });
        }

        // 4. Build strict aggregate payload
        const qualityConfidence = Math.max(
          0.7,
          Math.min(0.99, (normalizedTxns.length / (rows.length || 1)))
        );

        const payload = buildAggregatedPayload(normalizedTxns, {
          parsedRows: normalizedTxns.length,
          rejectedRows: rejectedCount,
          confidence: Math.round(qualityConfidence * 100) / 100,
        });

        // 5. Defense-in-depth PII scan
        const piiCheck = scanPayloadForPii(payload);
        if (piiCheck.hasLeak) {
          return resolve({
            success: false,
            error: `Payload safety check blocked transmission: ${piiCheck.violations.join(", ")}`,
          });
        }

        resolve({
          success: true,
          transactions: normalizedTxns,
          payload,
          adapterUsed: matchedAdapter.name,
        });
      },
      error: (err: any) => {
        resolve({
          success: false,
          error: `Parser error: ${err.message}`,
        });
      },
    });
  });
}
