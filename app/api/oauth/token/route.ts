import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { getRequestIp } from "@/lib/api-public/request-ip";
import {
  ACCESS_TOKEN_TTL_MS,
  ESCOPO_CONECTOR,
  getMcpResourceUrl,
  REFRESH_TOKEN_TTL_MS,
} from "@/lib/conector-claude/config";
import {
  gerarTokenAleatorio,
  hashToken,
  verificarPkceS256,
} from "@/lib/conector-claude/crypto";
import {
  consumeOauthCodigo,
  getOauthCodigoByHash,
  revogarConexao,
  rotateConexaoTokensByRefreshHash,
  setConexaoTokens,
} from "@/lib/db/claude-conector";
import { oauthTokenBodySchema } from "@/lib/validators/db/claude-conector";

const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

function oauthError(error: string, description: string, status = 400) {
  return Response.json(
    { error, error_description: description },
    { status, headers: NO_STORE },
  );
}

function novosTokens() {
  const accessToken = gerarTokenAleatorio();
  const refreshToken = gerarTokenAleatorio();
  const agora = Date.now();
  return {
    accessToken,
    refreshToken,
    db: {
      accessTokenHash: hashToken(accessToken),
      accessExpiraEm: new Date(agora + ACCESS_TOKEN_TTL_MS),
      refreshTokenHash: hashToken(refreshToken),
      refreshExpiraEm: new Date(agora + REFRESH_TOKEN_TTL_MS),
    },
  };
}

function respostaTokens(t: ReturnType<typeof novosTokens>) {
  return Response.json(
    {
      access_token: t.accessToken,
      token_type: "Bearer",
      expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
      refresh_token: t.refreshToken,
      scope: ESCOPO_CONECTOR,
    },
    { headers: NO_STORE },
  );
}

async function lerCorpo(request: Request): Promise<Record<string, string>> {
  const tipo = request.headers.get("content-type") ?? "";
  if (tipo.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(json).map(([k, v]) => [k, String(v ?? "")]),
    );
  }
  const form = new URLSearchParams(await request.text());
  return Object.fromEntries(form.entries());
}

/** Token endpoint: `authorization_code` (com PKCE S256) e `refresh_token` (com rotação). */
export async function POST(request: Request) {
  const rl = rateLimitByKey({
    key: `oauth-token:${getRequestIp(request)}`,
    limit: 120,
    windowMs: 60_000,
  });
  if (!rl.ok) return oauthError("slow_down", "Muitas requisições", 429);

  let corpo: Record<string, string>;
  try {
    corpo = await lerCorpo(request);
  } catch {
    return oauthError("invalid_request", "Corpo inválido");
  }

  const parsed = oauthTokenBodySchema.safeParse(corpo);
  if (!parsed.success) {
    const grant = corpo.grant_type;
    if (grant && grant !== "authorization_code" && grant !== "refresh_token") {
      return oauthError("unsupported_grant_type", "grant_type não suportado");
    }
    return oauthError("invalid_request", "Parâmetros ausentes ou inválidos");
  }
  const body = parsed.data;

  if (body.resource && body.resource !== getMcpResourceUrl()) {
    return oauthError("invalid_target", "resource diferente deste servidor");
  }

  try {
    if (body.grant_type === "authorization_code") {
      const codigoHash = hashToken(body.code);
      const codigo = await consumeOauthCodigo(codigoHash);
      if (!codigo) {
        // Código reutilizado: revoga a conexão emitida por ele (RFC 6749 §4.1.2).
        const antigo = await getOauthCodigoByHash(codigoHash);
        if (antigo?.usadoEm) await revogarConexao(antigo.conexaoId, "expirado");
        return oauthError("invalid_grant", "Código inválido, usado ou vencido");
      }
      if (
        codigo.clienteId !== body.client_id ||
        codigo.redirectUri !== body.redirect_uri
      ) {
        return oauthError("invalid_grant", "Código não pertence a este pedido");
      }
      if (!verificarPkceS256(body.code_verifier, codigo.codeChallenge)) {
        return oauthError("invalid_grant", "code_verifier não confere (PKCE)");
      }

      const tokens = novosTokens();
      await setConexaoTokens(codigo.conexaoId, tokens.db);
      return respostaTokens(tokens);
    }

    const tokens = novosTokens();
    const conexao = await rotateConexaoTokensByRefreshHash(
      hashToken(body.refresh_token),
      tokens.db,
    );
    if (!conexao) {
      return oauthError("invalid_grant", "Refresh token inválido, revogado ou vencido");
    }
    if (body.client_id && body.client_id !== conexao.clienteId) {
      return oauthError("invalid_grant", "Refresh token de outro cliente");
    }
    return respostaTokens(tokens);
  } catch (error) {
    console.error("[conector-claude] Falha no token endpoint:", error);
    return oauthError("server_error", "Falha ao emitir o token", 500);
  }
}
