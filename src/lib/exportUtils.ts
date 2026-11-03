import { NormalizedTransaction } from "@/types";

/**
 * Sanitizes a cell string against CSV formula injection (CSV Injection / DDE attack).
 * If cell starts with '=', '+', '-', '@', tab, or CR, prefix with a single quote.
 */
export function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);

  // Check if string begins with dangerous formula triggers
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }

  // Standard escape
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates and triggers download of a sanitized CSV report.
 * Guaranteed: Original narration is omitted by default.
 */
export function downloadSanitizedCsv(
  transactions: NormalizedTransaction[],
  fileNamePrefix: string = "solvent-sanitized-export"
): void {
  const headers = [
    "Date (ISO)",
    "Time (Local)",
    "Merchant Cluster",
    "Category",
    "Type",
    "Amount (INR)",
    "Time Bucket",
    "Parser Confidence",
  ];

  const rows = transactions.map((t) => [
    sanitizeCsvCell(t.date),
    sanitizeCsvCell(t.time || ""),
    sanitizeCsvCell(t.merchantKey),
    sanitizeCsvCell(t.categoryHint || "UNCLASSIFIED"),
    sanitizeCsvCell(t.type),
    sanitizeCsvCell(t.amountINR),
    sanitizeCsvCell(t.timeBucket),
    sanitizeCsvCell(t.parseConfidence),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileNamePrefix}-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
