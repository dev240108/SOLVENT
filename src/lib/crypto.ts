import crypto from "crypto";

/**
 * Creates a cryptographically secure random capability token for client authorization.
 */
export function generateCapabilityToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Produces a SHA-256 hash of a capability token for safe storage at rest.
 */
export function hashCapabilityToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verifies a capability token against a stored hash using constant-time comparison.
 */
export function verifyCapabilityToken(token: string, storedHash: string): boolean {
  try {
    const computedHash = hashCapabilityToken(token);
    const a = Buffer.from(computedHash, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Creates a stable per-audit pseudonym for unknown merchants or peer transfer VPAs.
 */
export function createPerAuditPseudonym(auditSalt: string, rawMerchantOrVpa: string): string {
  const hash = crypto
    .createHmac("sha256", auditSalt)
    .update(rawMerchantOrVpa.trim().toLowerCase())
    .digest("hex");
  const shortId = hash.slice(0, 4).toUpperCase();
  return `M_#${shortId}`;
}

/**
 * Computes and validates Razorpay HMAC-SHA256 signature in constant time.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}
