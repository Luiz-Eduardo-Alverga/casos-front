import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

function extractApiError(error: unknown, fallback: string) {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string; error?: string };
    };
    message?: string;
  };
  return {
    status: err?.response?.status ?? 500,
    message:
      err?.response?.data?.message ??
      err?.response?.data?.error ??
      err?.message ??
      fallback,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projetoId: string }> },
) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { projetoId } = await params;
      if (!projetoId) {
        return Response.json(
          { error: "ID do projeto é obrigatório" },
          { status: 400 },
        );
      }

      const url = new URL(request.url);
      const per_page = url.searchParams.get("per_page") ?? undefined;
      const cursor = url.searchParams.get("cursor") ?? undefined;

      const response = await api.get(`/sgp-cronograma/projeto/${projetoId}`, {
        params: {
          ...(per_page ? { per_page } : {}),
          ...(cursor !== undefined ? { cursor } : {}),
        },
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error(
        "Erro na API Route de sgp-cronograma por projeto:",
        error,
      );
      const { status, message } = extractApiError(
        error,
        "Erro ao buscar cronograma do projeto",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
