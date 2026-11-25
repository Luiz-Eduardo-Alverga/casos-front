import { z } from "zod";
import { TIPOS_CLIENTE } from "@/lib/conector-claude/config";

/** Corpo do DCR (RFC 7591). Campos não usados são ignorados. */
export const oauthRegisterBodySchema = z.object({
  redirect_uris: z.array(z.string().min(1)).min(1),
  client_name: z.string().max(200).optional(),
  token_endpoint_auth_method: z.string().optional(),
  grant_types: z.array(z.string()).optional(),
  response_types: z.array(z.string()).optional(),
});

export type OauthRegisterBody = z.infer<typeof oauthRegisterBodySchema>;

/** Parâmetros do pedido de autorização (query de `/oauth/autorizar`). */
export const oauthPedidoAutorizacaoSchema = z.object({
  response_type: z.literal("code"),
  client_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  code_challenge: z.string().regex(/^[A-Za-z0-9\-_]{43}$/),
  code_challenge_method: z.literal("S256"),
  state: z.string().max(2048).optional(),
  scope: z.string().max(500).optional(),
  resource: z.string().max(500).optional(),
});

export type OauthPedidoAutorizacao = z.infer<
  typeof oauthPedidoAutorizacaoSchema
>;

/** "Permitir acesso": pedido + senha para emitir o token da conexão (decisão #14). */
export const oauthAutorizarBodySchema = oauthPedidoAutorizacaoSchema.extend({
  senha: z.string().min(1, "Informe sua senha"),
});

export type OauthAutorizarBody = z.infer<typeof oauthAutorizarBodySchema>;

/** Corpo do token endpoint (`application/x-www-form-urlencoded`). */
export const oauthTokenBodySchema = z.discriminatedUnion("grant_type", [
  z.object({
    grant_type: z.literal("authorization_code"),
    code: z.string().min(1),
    redirect_uri: z.string().min(1),
    code_verifier: z.string().min(1),
    client_id: z.string().min(1),
    resource: z.string().optional(),
  }),
  z.object({
    grant_type: z.literal("refresh_token"),
    refresh_token: z.string().min(1),
    client_id: z.string().optional(),
    resource: z.string().optional(),
    scope: z.string().optional(),
  }),
]);

export type OauthTokenBody = z.infer<typeof oauthTokenBodySchema>;

/** `DELETE /api/db/claude-conexao?tipo=`: sem `tipo`, desconecta todas (decisão #25). */
export const claudeConexaoDeleteQuerySchema = z.object({
  tipo: z.enum(TIPOS_CLIENTE).optional(),
});
