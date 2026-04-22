import { api } from "@/lib/axios";

export class LegacyAuthMeError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
    this.name = "LegacyAuthMeError";
  }
}

/**
 * Extrai o objeto usuário de respostas `{ user: ... }` ou do próprio corpo.
 */
export function extractLegacyUserPayload(data: unknown): unknown {
  if (data != null && typeof data === "object" && "user" in data) {
    return (data as { user: unknown }).user;
  }
  return data;
}

/**
 * Busca o usuário autenticado na API Soft Flow (`GET /auth/me`).
 * Somente uso em servidor (Route Handlers / libs server-side).
 */
export async function getLegacyUserFromToken(
  authorizationHeader: { Authorization: string },
): Promise<unknown> {
  try {
    const response = await api.get("/auth/me", { headers: authorizationHeader });
    return extractLegacyUserPayload(response.data);
  } catch (err: unknown) {
    const ax = err as {
      response?: { status?: number; data?: { message?: string } };
      message?: string;
    };
    const status = ax.response?.status ?? 0;
    const msg =
      (typeof ax.response?.data?.message === "string"
        ? ax.response.data.message
        : null) ||
      ax.message ||
      "Falha ao consultar /auth/me";
    if (status === 401 || status === 403) {
      throw new LegacyAuthMeError(msg, status);
    }
    throw new LegacyAuthMeError(msg, status >= 400 ? status : 502);
  }
}
