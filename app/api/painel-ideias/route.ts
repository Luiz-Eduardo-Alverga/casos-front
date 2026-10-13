import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET(request: Request) {
  return withPermission("list-improvement", async (session) => {
  try {
    const url = new URL(request.url);
    const per_page = url.searchParams.get("per_page");
    const page = url.searchParams.get("page");
    const data_inicial = url.searchParams.get("data_inicial");
    const data_final = url.searchParams.get("data_final");
    const registro = url.searchParams.get("registro");
    const produto_id = url.searchParams.get("produto_id");
    const lacrar = url.searchParams.get("lacrar");
    const concluido = url.searchParams.get("concluido");
    const setor = url.searchParams.get("setor");
    const search = url.searchParams.get("search");

    const response = await api.get("/painel-ideias", {
      params: {
        ...(per_page ? { per_page } : {}),
        ...(page ? { page } : {}),
        ...(data_inicial ? { data_inicial } : {}),
        ...(data_final ? { data_final } : {}),
        ...(registro ? { registro } : {}),
        ...(produto_id ? { produto_id } : {}),
        ...(lacrar ? { lacrar } : {}),
        ...(concluido ? { concluido } : {}),
        ...(setor ? { setor } : {}),
        ...(search ? { search } : {}),
      },
      headers: session.authorizationHeader,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de painel de ideias:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar painel de ideias";
    return Response.json({ error: errorMessage }, { status });
  }
  });
}
