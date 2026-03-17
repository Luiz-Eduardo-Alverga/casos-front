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
