import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { LegacyAuthMeError } from "@/lib/legacy-auth/me";
import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { getProtectedResourceMetadataUrl } from "@/lib/conector-claude/config";
import { hashToken } from "@/lib/conector-claude/crypto";
import {
  authHeaderDaConexao,
  ConexaoExpiradaError,
  renovarTokenDaConexao,
  type AuthorizationHeader,
} from "@/lib/conector-claude/legacy-token";
import {
  getConexaoAtivaByAccessHash,
  touchConexaoUltimoUso,
  type AppUserRowConector,
  type ClaudeConexaoRow,
} from "@/lib/db/claude-conector";
import type { PermissionRequirement } from "@/lib/api-db/with-permission";

export type ConectorSession = {
  conexao: ClaudeConexaoRow;
  appUser: AppUserRowConector;
  /** Header com o token Soft Flow da conexão (já renovado, se foi preciso). */
  authorizationHeader: AuthorizationHeader;
  permissions: string[];
};

type ConectorHandler = (session: ConectorSession) => Promise<Response>;

const RATE_LIMIT_POR_MINUTO = 60;

/** `401` com o `WWW-Authenticate` que faz o Claude (re)iniciar o OAuth (RFC 9728). */
export function conectorUnauthorized(
  descricao = "Token ausente, inválido ou expirado",
): Response {
  return Response.json(
    { error: "invalid_token", error_description: descricao },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer resource_metadata="${getProtectedResourceMetadataUrl()}", error="invalid_token", error_description="${descricao}"`,
      },
    },
  );
}

function bearerFrom(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export function temPermissao(
  permissions: string[],
  required: PermissionRequirement,
): boolean {
  return Array.isArray(required)
    ? required.some((r) => permissions.includes(r))
    : permissions.includes(required);
}

/**
 * Espelho do `withPermission` para o conector do Claude: parte do Bearer emitido pelo
 * Softflow ao Claude (não do cookie), recalcula as permissões da pessoa com o token Soft Flow
 * da conexão e, se `required` vier, exige a permissão (403 sem ela).
 * `required = null` só exige conexão válida (as ferramentas do MCP checam a própria permissão).
 */
export async function withConectorPermission(
  request: Request,
  required: PermissionRequirement | null,
  handler: ConectorHandler,
): Promise<Response> {
  const accessToken = bearerFrom(request);
  if (!accessToken) return conectorUnauthorized("Token ausente");

  const found = await getConexaoAtivaByAccessHash(hashToken(accessToken));
  if (!found) return conectorUnauthorized();
  const { conexao, appUser } = found;

  const rl = rateLimitByKey({
    key: `conector-claude:${conexao.id}`,
    limit: RATE_LIMIT_POR_MINUTO,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return Response.json(
      { error: "rate_limited", error_description: "Muitas chamadas; tente em instantes" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAtMs - Date.now()) / 1000)),
        },
      },
    );
  }

  let authorizationHeader: AuthorizationHeader;
  let permissions: string[];
  try {
    authorizationHeader = authHeaderDaConexao(conexao);
    try {
      ({ permissions } = await syncAppUserAndPermissions(authorizationHeader));
    } catch (error) {
      if (!(error instanceof LegacyAuthMeError) || error.statusCode !== 401) {
        throw error;
      }
      authorizationHeader = await renovarTokenDaConexao(conexao);
      ({ permissions } = await syncAppUserAndPermissions(authorizationHeader));
    }
  } catch (error) {
    if (error instanceof ConexaoExpiradaError) {
      return conectorUnauthorized(
        "A conexão com o Softflow expirou; conecte o Claude de novo",
      );
    }
    console.error("[conector-claude] Falha ao validar a conexão:", error);
    return Response.json(
      { error: "server_error", error_description: "Falha ao validar a conexão" },
      { status: 502 },
    );
  }

  if (required != null && !temPermissao(permissions, required)) {
    return Response.json(
      { error: "insufficient_scope", error_description: "Sem permissão para executar esta ação" },
      { status: 403 },
    );
  }

  await touchConexaoUltimoUso(conexao.id);

  return handler({ conexao, appUser, authorizationHeader, permissions });
}
