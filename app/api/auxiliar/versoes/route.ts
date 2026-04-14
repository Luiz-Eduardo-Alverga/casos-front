import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const produto_id = url.searchParams.get("produto_id");
    const search = url.searchParams.get("search") ?? undefined;
    const todasParam = url.searchParams.get("todas");
    const todas = todasParam === "true";

    if (!produto_id) {
      return Response.json(
        { error: "Parametro produto_id é obrigatório" },
        { status: 400 }
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/auxiliar/versoes", {
      params: {
        produto_id,
        todas,
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
    console.error("Erro na API Route de versões:", error);
    const status = error?.response?.status || 500;
    const errorMessage = error?.response?.data?.message || error?.message || "Erro ao buscar versões";
    return Response.json({ error: errorMessage }, { status });
  }
}

