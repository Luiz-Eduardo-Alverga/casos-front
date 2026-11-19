import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { getRequestIp } from "@/lib/api-public/request-ip";
import { isRedirectUriPermitida } from "@/lib/conector-claude/config";
import { gerarTokenAleatorio } from "@/lib/conector-claude/crypto";
import { insertOauthCliente } from "@/lib/db/claude-conector";
import { oauthRegisterBodySchema } from "@/lib/validators/db/claude-conector";

function oauthError(error: string, description: string, status = 400) {
  return Response.json({ error, error_description: description }, { status });
}

/** Dynamic Client Registration (RFC 7591). Só aceita os endereços de retorno do Claude (decisão #4). */
export async function POST(request: Request) {
  const rl = rateLimitByKey({
    key: `oauth-register:${getRequestIp(request)}`,
    limit: 20,
    windowMs: 60 * 60 * 1000,
  });
  if (!rl.ok) {
    return oauthError("rate_limited", "Muitos registros; tente mais tarde", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return oauthError("invalid_client_metadata", "Corpo JSON inválido");
  }
  const parsed = oauthRegisterBodySchema.safeParse(body);
  if (!parsed.success) {
    return oauthError("invalid_client_metadata", "Metadados do cliente inválidos");
  }
  const data = parsed.data;

  if (!data.redirect_uris.every(isRedirectUriPermitida)) {
    return oauthError(
      "invalid_redirect_uri",
      "Endereço de retorno não permitido para este servidor",
    );
  }
  if (
    data.token_endpoint_auth_method &&
    data.token_endpoint_auth_method !== "none"
  ) {
    return oauthError(
      "invalid_client_metadata",
      "Só clientes públicos (token_endpoint_auth_method=none)",
    );
  }

  try {
    const cliente = await insertOauthCliente({
      id: gerarTokenAleatorio(16),
      nome: data.client_name?.trim() || "Claude",
      redirectUris: data.redirect_uris,
    });

    return Response.json(
      {
        client_id: cliente.id,
        client_id_issued_at: Math.floor(cliente.criadoEm.getTime() / 1000),
        client_name: cliente.nome,
        redirect_uris: cliente.redirectUris,
        grant_types: ["authorization_code", "refresh_token"],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[conector-claude] Falha no registro do cliente:", error);
    return oauthError("server_error", "Falha ao registrar o cliente", 500);
  }
}
