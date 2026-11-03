import { AggregatedStatementPayload } from "@/types";

export interface PiiScanResult {
  hasLeak: boolean;
  violations: string[];
}

const PII_PATTERNS = [
  { name: "Permanent Account Number (PAN)", regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i },
  { name: "Indian Mobile Phone Number", regex: /\b[6-9]\d{9}\b/ },
  { name: "Raw Bank Account Number (11-18 digits)", regex: /\b\d{11,18}\b/ },
  { name: "Email Address", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { name: "Aadhaar Number Pattern", regex: /\b\d{4}\s\d{4}\s\d{4}\b/ },
];

/**
 * Secondary defense-in-depth scanner that inspects the serialized payload
 * to guarantee no unredacted PII is sent to the server.
 */
export function scanPayloadForPii(payload: AggregatedStatementPayload): PiiScanResult {
  const jsonString = JSON.stringify(payload);
  const violations: string[] = [];

  for (const { name, regex } of PII_PATTERNS) {
    if (regex.test(jsonString)) {
      violations.push(`Detected pattern resembling ${name}`);
    }
  }

  return {
    hasLeak: violations.length > 0,
    violations,
  };
}
