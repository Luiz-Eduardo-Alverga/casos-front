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

export function isRedirectUriPermitida(uri: string): boolean {
  return (REDIRECT_URIS_PERMITIDAS as readonly string[]).includes(uri);
}

/** Escopo único anunciado (o que cada ferramenta pode fazer vem do RBAC da pessoa). */
export const ESCOPO_CONECTOR = "softflow";

export const CODIGO_TTL_MS = 5 * 60 * 1000;
export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
export const PREVIA_TTL_MS = 15 * 60 * 1000;
