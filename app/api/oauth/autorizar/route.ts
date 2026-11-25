import { requireSessionAuth } from "@/lib/auth-server";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { rateLimitByKey } from "@/lib/api-public/rate-limit";
import { jsonError, jsonOk } from "@/lib/api-db/responses";
import {
  CODIGO_TTL_MS,
  getPublicOrigin,
  tipoClienteDoRedirect,
} from "@/lib/conector-claude/config";
import { gerarTokenAleatorio, hashToken } from "@/lib/conector-claude/crypto";
import {
  cifrarTokenLegacy,
  emitirTokenPorLogin,
  LoginRecusadoError,
} from "@/lib/conector-claude/legacy-token";
import {
  montarUrlRetorno,
  validarPedidoAutorizacao,
} from "@/lib/conector-claude/pedido-autorizacao";
import {
  insertConexaoRevogandoAnteriores,
  insertOauthCodigo,
} from "@/lib/db/claude-conector";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";

/** Bloqueia POST de outra origem (o cookie já é SameSite=Lax; isto é defesa extra). */
function origemPermitida(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin || origin === getPublicOrigin();
}

/**
 * "Permitir acesso" / "Cancelar" da tela `/oauth/autorizar`.
 * Corpo: os parâmetros do pedido OAuth + `acao` ("permitir" | "cancelar") + `senha` (só em
 * "permitir", decisão #14). Responde `{ data: { redirectTo } }` com a URL de volta ao Claude.
 */
export async function POST(request: Request) {
  if (!origemPermitida(request)) {
    return jsonError("Origem não permitida", 403);
  }

  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Corpo JSON inválido", 400);
  }
  const { acao, senha, ...params } = body;

  const validado = await validarPedidoAutorizacao(params);
  if (!validado.ok) {
    // Pedido inválido nunca redireciona (decisão #4): a tela mostra o erro.
    return jsonError(validado.motivo, 400);
  }
  const { pedido, cliente } = validado;

  if (acao === "cancelar") {
    return jsonOk({
      redirectTo: montarUrlRetorno(pedido.redirect_uri, {
        error: "access_denied",
        error_description: "A pessoa cancelou a conexão",
        state: pedido.state,
        iss: getPublicOrigin(),
      }),
    });
  }
  if (acao !== "permitir") {
    return jsonError("Ação inválida", 400);
  }
  if (typeof senha !== "string" || !senha) {
    return jsonError("Informe sua senha", 400);
  }

  let appUserId: string;
  let legacyUserId: number;
  let email: string;
  try {
    const sync = await syncAppUserAndPermissions(auth.authorizationHeader);
    appUserId = sync.appUser.id;
    legacyUserId = sync.appUser.legacyUserId;
    email = sync.appUser.email;
  } catch (error) {
    console.error("[conector-claude] Falha ao identificar a pessoa:", error);
    return jsonError("Sessão inválida ou expirada", 401);
  }

  const rl = rateLimitByKey({
    key: `oauth-autorizar:${appUserId}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return jsonError("Muitas tentativas; aguarde alguns minutos", 429);
  }

  let tokenLegacy: string;
  try {
    const login = await emitirTokenPorLogin(email, senha);
    const user = legacyUserSchema.safeParse(login.user);
    if (!user.success || user.data.id !== legacyUserId) {
      return jsonError("A senha não é desta conta", 403);
    }
    tokenLegacy = login.token;
  } catch (error) {
    if (error instanceof LoginRecusadoError) {
      // 422 e não 401: no front, 401 faz o fetchWithAuth encerrar a sessão do navegador.
      return jsonError("Senha incorreta", 422);
    }
    console.error("[conector-claude] Falha no login da conexão:", error);
    return jsonError("Não foi possível falar com o Softflow; tente de novo", 502);
  }

  try {
    const conexao = await insertConexaoRevogandoAnteriores({
      appUserId,
      clienteId: cliente.id,
      legacyTokenCifrado: cifrarTokenLegacy(tokenLegacy),
      tipoCliente: tipoClienteDoRedirect(pedido.redirect_uri),
    });

    const codigo = gerarTokenAleatorio();
    await insertOauthCodigo({
      codigoHash: hashToken(codigo),
      clienteId: cliente.id,
      conexaoId: conexao.id,
      redirectUri: pedido.redirect_uri,
      codeChallenge: pedido.code_challenge,
      expiraEm: new Date(Date.now() + CODIGO_TTL_MS),
    });

    console.info(
      `[conector-claude] Conexão criada: conexao=${conexao.id} app_user=${appUserId} tipo=${conexao.tipoCliente}`,
    );

    return jsonOk({
      redirectTo: montarUrlRetorno(pedido.redirect_uri, {
        code: codigo,
        state: pedido.state,
        iss: getPublicOrigin(),
      }),
    });
  } catch (error) {
    console.error("[conector-claude] Falha ao criar a conexão:", error);
    return jsonError("Falha ao criar a conexão", 500);
  }
}
