import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const produto_id = url.searchParams.get("produto_id");
    const setor = url.searchParams.get("setor");
    const tipo_liberacao = url.searchParams.get("tipo_liberacao");

    if (!produto_id && !setor && !tipo_liberacao) {
      return Response.json(
        {
          error:
            "Informe ao menos um parametro: produto_id, setor ou tipo_liberacao",
        },
        { status: 400 },
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get(
      "/sprint/minha-visao/visao-proximas-liberacoes",
      {
        params: {
          ...(produto_id ? { produto_id } : {}),
          ...(setor ? { setor } : {}),
          ...(tipo_liberacao ? { tipo_liberacao } : {}),
        },
        headers: authHeaders,
      },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de próximas liberações:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar próximas liberações";
    return Response.json({ error: errorMessage }, { status });
  }
}
