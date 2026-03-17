import { cookies } from "next/headers";
import { api } from "@/lib/axios";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  getTokenFromCookie,
} from "@/lib/auth-server";

export async function POST() {
  try {
    const token = await getTokenFromCookie();

    if (!token) {
      return Response.json(
        { error: "Sessão inválida ou expirada" },
        { status: 401 }
      );
    }

    const response = await api.post(
      "/auth/refresh",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newToken = response.data?.authorization?.token;
    if (!newToken) {
      return Response.json(
        { error: "Resposta de refresh inválida" },
        { status: 502 }
      );
    }

    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, newToken, AUTH_COOKIE_OPTIONS);

    // Não expor o token no body — cookie já foi atualizado
    return Response.json(
      { success: true },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro na API Route de refresh token:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao renovar token";
    return Response.json({ error: errorMessage }, { status });
  }
}
