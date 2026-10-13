import { api } from "@/lib/axios";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  return withPermission("list-release", async (session) => {
    try {
      const { registro } = await params;

      if (!registro) {
        return Response.json(
          { error: "Parametro registro é obrigatório" },
          { status: 400 },
        );
      }

      const url = new URL(request.url);
      const liberacao = url.searchParams.get("liberacao") ?? "todos";
      const resumo = url.searchParams.get("resumo");
      const limit = url.searchParams.get("limit");
      const offset = url.searchParams.get("offset");

      const queryParams: Record<string, string> = { liberacao };
      if (resumo != null && resumo !== "") queryParams.resumo = resumo;
      if (limit != null && limit !== "") queryParams.limit = limit;
      if (offset != null && offset !== "") queryParams.offset = offset;

      const response = await api.get(`/sprint/liberacoes/${registro}/itens`, {
        params: queryParams,
        headers: session.authorizationHeader,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Erro na API Route ao buscar itens da liberação:", error);
      const status = error?.response?.status || 500;
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Erro ao buscar itens da liberação";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
