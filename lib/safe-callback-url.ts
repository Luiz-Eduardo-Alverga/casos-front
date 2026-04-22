/**
 * Valida um valor vindo de `callbackUrl` (query) para redirecionamento pós-login.
 * Evita open redirect (ex.: //dominio-externo, https://...).
 */
export function getSafeInternalReturnPath(
  raw: string | null | undefined
): string | null {
  if (raw == null || typeof raw !== "string") return null;
  let decoded = raw.trim();
  if (!decoded) return null;
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return null;
  }
  decoded = decoded.trim();
  if (!decoded.startsWith("/")) return null;
  if (decoded.startsWith("//")) return null;
  if (decoded.includes("://")) return null;
  if (decoded.includes("\\")) return null;
  if (/[\n\r\x00]/.test(decoded)) return null;
  // Evita loop com a própria rota de login.
  if (decoded === "/login" || decoded.startsWith("/login?")) return null;
  return decoded;
}
