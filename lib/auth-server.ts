import { cookies } from "next/headers";

/** Nome do cookie HttpOnly onde o token é armazenado (apenas no servidor). */
export const AUTH_COOKIE_NAME = "casos_token";

/** Opções padrão do cookie de autenticação (HttpOnly, Secure em produção). */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 dias
};

/**
 * Obtém o token de autenticação a partir do cookie (uso apenas em Server Components e Route Handlers).
 * O cliente nunca tem acesso a este token.
 */
export async function getTokenFromCookie(): Promise<string | null> {
  const store = await cookies();
  const cookie = store.get(AUTH_COOKIE_NAME);
  return cookie?.value ?? null;
}

/**
 * Retorna o header Authorization para repassar ao backend.
 */
export async function getAuthorizationHeader(): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await getTokenFromCookie();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/** Dados da sessão quando o cookie de login está presente (Route Handlers / Server Actions). */
export type SessionAuthSuccess = {
  token: string;
  authorizationHeader: { Authorization: string };
};

/**
 * Resultado de {@link requireSessionAuth}: ou sessão válida ou resposta 401 pronta para retornar.
 */
export type SessionAuthResult =
  | ({ authenticated: true } & SessionAuthSuccess)
  | { authenticated: false; response: Response };

/**
 * Exige cookie `casos_token` (login na API externa). Use em rotas que acessam Drizzle/Supabase.
 *
 * @example
 * ```ts
 * const auth = await requireSessionAuth();
 * if (!auth.authenticated) return auth.response;
 * // auth.token, auth.authorizationHeader
 * ```
 */
export async function requireSessionAuth(): Promise<SessionAuthResult> {
  const token = await getTokenFromCookie();
  if (!token) {
    return {
      authenticated: false,
      response: Response.json(
        { error: { message: "Não autorizado" } },
        { status: 401 },
      ),
    };
  }
  return {
    authenticated: true,
    token,
    authorizationHeader: { Authorization: `Bearer ${token}` },
  };
}
