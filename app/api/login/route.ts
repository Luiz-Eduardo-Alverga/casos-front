import { cookies } from "next/headers";
import { api } from "@/lib/axios";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "@/lib/auth-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await api.post("/auth/login", body);
    const data = await response.data;

    const token = data?.authorization?.token;
    const user = data?.user;

    if (!token || !user) {
      return Response.json(
        { error: "Resposta de login inválida" },
        { status: 502 }
      );
    }

    const store = await cookies();
    store.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

    // Não expor o token no body — apenas user e success
    return Response.json(
      { success: true, user },
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Erro na API Route de login:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao processar requisição de login";
    return Response.json({ error: errorMessage }, { status });
  }
}
