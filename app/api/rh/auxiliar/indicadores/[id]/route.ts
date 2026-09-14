import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const indicadorId = id?.trim() ?? "";

    if (!indicadorId) {
      return Response.json(
        { error: "Parâmetro id é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get(
      `/rh/auxiliar/indicadores/${encodeURIComponent(indicadorId)}`,
      { headers: authHeaders },
    );

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; error?: string };
      };
      message?: string;
    };

    console.error("Erro na API Route de detalhe do indicador:", error);

    const status = err?.response?.status ?? 500;
    const data = err?.response?.data;
    const errorMessage =
      data?.message ??
      data?.error ??
      err?.message ??
      "Erro ao buscar detalhe do indicador";

    return Response.json({ error: errorMessage }, { status });
  }
}
