import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET() {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/auxiliar/tamanhos", {
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: unknown) {
    const err = error as {
      message: string | undefined;
      response?: {
        status?: number;
        data?: { message?: string };
        message?: string;
      };
    };
    console.error("Erro na API Route de tamanhos:", error);
    const status = err?.response?.status ?? 500;
    const errorMessage =
      err?.response?.data?.message ??
      err?.message ??
      err?.message ??
      "Erro ao buscar tamanhos";
    return Response.json(
      { error: errorMessage ?? "Erro ao buscar tamanhos" },
      { status },
    );
  }
}
