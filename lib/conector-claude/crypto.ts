import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

/** Token aleatório em base64url (padrão: 32 bytes = 256 bits). */
export function gerarTokenAleatorio(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** SHA-256 em hex; tokens e códigos OAuth são guardados só assim. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** PKCE S256: BASE64URL(SHA256(code_verifier)) === code_challenge (comparação em tempo constante). */
export function verificarPkceS256(
  codeVerifier: string,
  codeChallenge: string,
): boolean {
  if (!/^[A-Za-z0-9\-._~]{43,128}$/.test(codeVerifier)) return false;
  const calculado = createHash("sha256")
    .update(codeVerifier, "ascii")
    .digest("base64url");
  const a = Buffer.from(calculado);
  const b = Buffer.from(codeChallenge);
  return a.length === b.length && timingSafeEqual(a, b);
}

function getChave(): Buffer {
  const raw = process.env.CLAUDE_CONECTOR_CHAVE?.trim();
  if (!raw) {
    throw new Error("CLAUDE_CONECTOR_CHAVE não configurada");
  }
  const chave = /^[0-9a-fA-F]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");
  if (chave.length !== 32) {
    throw new Error(
      "CLAUDE_CONECTOR_CHAVE deve ter 32 bytes (64 caracteres hex ou base64)",
    );
  }
  return chave;
}

/** Cifra com AES-256-GCM. Formato: `v1.<iv>.<tag>.<cifrado>` (base64url). */
export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getChave(), iv);
  const cifrado = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, cifrado].map((p) =>
    typeof p === "string" ? p : p.toString("base64url"),
  ).join(".");
}

export function decifrar(valor: string): string {
  const [versao, iv, tag, cifrado] = valor.split(".");
  if (versao !== "v1" || !iv || !tag || !cifrado) {
    throw new Error("Valor cifrado em formato desconhecido");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getChave(),
    Buffer.from(iv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(cifrado, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
