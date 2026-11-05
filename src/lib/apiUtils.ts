/**
 * Safe fetch helper that gracefully handles non-JSON responses (HTML error pages, 413, 500, etc.)
 * and returns structured JSON or throws clear, readable error messages.
 */
export async function safeFetchJson<T = any>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T }> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (netErr: any) {
    throw new Error(
      netErr?.message?.includes("Failed to fetch")
        ? "Network connection error. Please check your internet connection."
        : netErr?.message || "Failed to communicate with server."
    );
  }

  const rawText = await res.text();
  let data: any = null;

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    // Non-JSON response received (often an HTML 413, 500, or 504 error page)
    if (res.status === 413) {
      throw new Error("Statement file is too large for upload. Please use a file under 15MB or export a CSV.");
    }
    if (res.status === 504 || res.status === 408) {
      throw new Error("Server timed out processing statement. Please try a shorter date range or CSV format.");
    }
    if (res.status === 404) {
      throw new Error("Requested endpoint was not found on server.");
    }
    throw new Error(
      `Server returned an unreadable response (${res.status}). Please check your statement format and try again.`
    );
  }

  return { ok: res.ok, status: res.status, data };
}
