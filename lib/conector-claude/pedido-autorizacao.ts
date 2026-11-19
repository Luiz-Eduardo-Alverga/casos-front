import { getMcpResourceUrl, isRedirectUriPermitida } from "@/lib/conector-claude/config";
import { getOauthClienteById, type OauthClienteRow } from "@/lib/db/claude-conector";
import {
  oauthPedidoAutorizacaoSchema,
  type OauthPedidoAutorizacao,
} from "@/lib/validators/db/claude-conector";

export type PedidoValidado =
  | { ok: true; pedido: OauthPedidoAutorizacao; cliente: OauthClienteRow }
  | {
      ok: false;
      /** Causa em uma linha, para a tela de erro. */
      motivo: string;
    };

/**
 * Valida o pedido de autorização (query de `/oauth/autorizar`). Nunca devolve um endereço de
 * retorno que não esteja na lista do cliente e na lista do Claude (decisão #4).
 * Usado pela tela (Parte 3) e pelo `POST /api/oauth/autorizar`.
 */
export async function validarPedidoAutorizacao(
  input: unknown,
): Promise<PedidoValidado> {
  const parsed = oauthPedidoAutorizacaoSchema.safeParse(input);
  if (!parsed.success) {
    const campos = parsed.error.issues.map((i) => i.path.join("."));
    if (campos.some((c) => c.startsWith("code_challenge"))) {
      return { ok: false, motivo: "O pedido não trouxe a proteção PKCE (S256)." };
    }
    return { ok: false, motivo: "O pedido de conexão está incompleto ou inválido." };
  }
  const pedido = parsed.data;

  const cliente = await getOauthClienteById(pedido.client_id);
  if (!cliente) {
    return { ok: false, motivo: "O cliente que pediu a conexão não é conhecido." };
  }
  if (
    !isRedirectUriPermitida(pedido.redirect_uri) ||
    !cliente.redirectUris.includes(pedido.redirect_uri)
  ) {
    return { ok: false, motivo: "O endereço de retorno não é permitido." };
  }
  if (pedido.resource && pedido.resource !== getMcpResourceUrl()) {
    return { ok: false, motivo: "O pedido é para outro servidor." };
  }
  return { ok: true, pedido, cliente };
}

/** Monta a URL de retorno ao Claude com os parâmetros do OAuth. */
export function montarUrlRetorno(
  redirectUri: string,
  params: Record<string, string | undefined>,
): string {
  const url = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  return url.toString();
}
