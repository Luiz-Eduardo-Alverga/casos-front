import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id_projeto = url.searchParams.get("id_projeto");
    const produto_id = url.searchParams.get("produto_id");
    const setor = url.searchParams.get("setor");

    if (!id_projeto && !produto_id && !setor) {
      return Response.json(
        {
          error:
            "Informe ao menos um parametro: id_projeto, produto_id ou setor",
        },
        { status: 400 },
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get(
      "/sprint/minha-visao/visao-prazos-clientes",
      {
        params: {
          ...(id_projeto ? { id_projeto } : {}),
          ...(produto_id ? { produto_id } : {}),
          ...(setor ? { setor } : {}),
        },
        headers: authHeaders,
      },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de prazos clientes:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar prazos clientes";
    return Response.json({ error: errorMessage }, { status });
  }
}
