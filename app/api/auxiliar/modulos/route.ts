import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const produto_id = url.searchParams.get("produto_id");
    const search = url.searchParams.get("search") ?? undefined;

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!produto_id) {
      return Response.json({ error: "produto_id é obrigatório" }, { status: 400 });
    }

    const response = await api.get("/auxiliar/modulos", {
      params: {
        produto_id,
        ...(search ? { search } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Erro na API Route de módulos:", error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error?.message || "Erro ao buscar módulos";
    return Response.json({ error: errorMessage }, { status });
  }
}
