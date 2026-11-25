/**
 * Configuração do conector do Claude (docs/conector-claude).
 * O endereço público vem de `SOFTFLOW_PUBLIC_URL` (decisão #13).
 */

const DEFAULT_PUBLIC_URL = "https://softflow.hostsoftcom.cloud";

/** Origem pública do Softflow, sem barra no fim (ex.: https://softflow.hostsoftcom.cloud). */
export function getPublicOrigin(): string {
  const raw = process.env.SOFTFLOW_PUBLIC_URL?.trim() || DEFAULT_PUBLIC_URL;
  return raw.replace(/\/+$/, "");
}

/** Endereço do servidor MCP; é o `resource` dos metadados (RFC 9728) e o que a pessoa cadastra no Claude. */
export function getMcpResourceUrl(): string {
  return `${getPublicOrigin()}/api/mcp`;
}

/** URL dos metadados do recurso protegido, usada no `WWW-Authenticate` do `/api/mcp`. */
export function getProtectedResourceMetadataUrl(): string {
  return `${getPublicOrigin()}/.well-known/oauth-protected-resource/api/mcp`;
}

/** Endereços de retorno aceitos, por igualdade exata (decisão #4). */
export const REDIRECT_URIS_PERMITIDAS = [
  "https://claude.ai/api/mcp/auth_callback",
  "https://claude.com/api/mcp/auth_callback",
] as const;

/**
 * Retorno loopback do Claude Code (decisão #24, RFC 8252): `http`, `localhost` ou `127.0.0.1`,
 * qualquer porta, caminho exato `/callback`, sem query nem fragmento. Comparação no texto cru,
 * para nada que o `URL` normalize (`/x/../callback`, maiúsculas, porta padrão) passar.
 */
const LOOPBACK_CALLBACK = /^http:\/\/(?:localhost|127\.0\.0\.1):(\d{1,5})\/callback$/;

export function isRedirectUriLoopback(uri: string): boolean {
  const m = LOOPBACK_CALLBACK.exec(uri);
  if (!m) return false;
  const porta = Number(m[1]);
  return porta >= 1 && porta <= 65535;
}

export function isRedirectUriPermitida(uri: string): boolean {
  return (
    (REDIRECT_URIS_PERMITIDAS as readonly string[]).includes(uri) ||
    isRedirectUriLoopback(uri)
  );
}

/** Tipo de cliente da conexão (decisão #25): sai do `redirect_uri` (loopback = Claude Code). */
export const TIPOS_CLIENTE = ["claude", "claude-code"] as const;
export type TipoCliente = (typeof TIPOS_CLIENTE)[number];

export function tipoClienteDoRedirect(uri: string): TipoCliente {
  return isRedirectUriLoopback(uri) ? "claude-code" : "claude";
}

export const NOME_TIPO_CLIENTE: Record<TipoCliente, string> = {
  claude: "Claude",
  "claude-code": "Claude Code",
};

/** Escopo único anunciado (o que cada ferramenta pode fazer vem do RBAC da pessoa). */
export const ESCOPO_CONECTOR = "softflow";

export const CODIGO_TTL_MS = 5 * 60 * 1000;
export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const PREVIA_TTL_MS = 15 * 60 * 1000;

/** Conector do Brainiac recomendado no modal (decisões #18 e #21); cada campo some sem a variável. */
export interface BrainiacConector {
  endereco: string | null;
  clientId: string | null;
}

export function getBrainiacConector(): BrainiacConector {
  return {
    endereco: process.env.BRAINIAC_MCP_URL?.trim() || null,
    clientId: process.env.BRAINIAC_OAUTH_CLIENT_ID?.trim() || null,
  };
}
