/** Tela de consentimento do conector do Claude (docs/conector-claude). */
export const OAUTH_AUTORIZAR_PATH = "/oauth/autorizar";

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
  if (decoded.includes("\\")) return null;
  if (/[\n\r\x00]/.test(decoded)) return null;
  // A tela de autorização do conector do Claude traz `redirect_uri=https://...` na query:
  // só ali o `://` é aceito, e só depois do `?` (o caminho continua interno).
  const [pathPart] = decoded.split("?", 1);
  if (pathPart.includes("://")) return null;
  if (decoded.includes("://") && pathPart !== OAUTH_AUTORIZAR_PATH) return null;
  // Evita loop com a própria rota de login.
  if (decoded === "/login" || decoded.startsWith("/login?")) return null;
  // Na tela de autorização a query precisa chegar intacta (o `state` do OAuth pode ter `+`, `=`
  // ou `&` codificados): devolve o valor sem a segunda decodificação.
  const trimmed = raw.trim();
  if (
    pathPart === OAUTH_AUTORIZAR_PATH &&
    trimmed.startsWith(`${OAUTH_AUTORIZAR_PATH}?`)
  ) {
    return trimmed;
  }
  return decoded;
}
