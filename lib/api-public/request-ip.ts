function firstForwardedFor(xff: string): string | null {
  const first = xff
    .split(",")
    .map((s) => s.trim())
    .find(Boolean);
  return first ?? null;
}

/**
 * Extrai o IP mais provável para rate limit.
 * Prioriza `x-forwarded-for`, depois `x-real-ip`. Fallback: `"unknown"`.
 */
export function getRequestIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return firstForwardedFor(xff) ?? "unknown";
  const xrip = request.headers.get("x-real-ip");
  if (xrip?.trim()) return xrip.trim();
  return "unknown";
}

