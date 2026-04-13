import { createHmac } from "crypto";

function base64Url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function getSecret(): string {
  const secret = process.env.PUBLIC_OPAQUE_ID_SECRET;
  if (!secret?.trim()) {
    throw new Error(
      "PUBLIC_OPAQUE_ID_SECRET não configurado (necessário para IDs opacos públicos)",
    );
  }
  return secret;
}

/**
 * Gera um identificador público opaco e determinístico (HMAC-SHA256).
 * - **Não** é reversível sem o segredo.
 * - Mantém estabilidade (mesma entrada → mesmo output).
 * - Usa prefixo/namespace para evitar colisões entre entidades.
 */
export function opaqueId(namespace: string, rawId: string): string {
  const secret = getSecret();
  const digest = createHmac("sha256", secret)
    .update(`${namespace}:${rawId}`)
    .digest();
  // 16 bytes já dão entropia suficiente e deixam o ID curto.
  const short = digest.subarray(0, 16);
  return `${namespace}_${base64Url(short)}`;
}

