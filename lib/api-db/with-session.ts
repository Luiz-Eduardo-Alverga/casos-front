import {
  requireSessionAuth,
  type SessionAuthSuccess,
} from "@/lib/auth-server";

type SessionHandler = (session: SessionAuthSuccess) => Promise<Response>;

/**
 * Executa o handler apenas com sessão válida (`casos_token`); caso contrário retorna 401.
 */
export async function withSession(handler: SessionHandler): Promise<Response> {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;
  return handler(auth);
}
