import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission(["edit-case", "edit-report"], async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { id } = await params;
      if (!id) {
        return Response.json(
          { error: "ID do caso é obrigatório" },
          { status: 400 },
        );
      }

      const body = await request.json().catch(() => null);
      const cronogramaDestino = Number(body?.cronograma_destino);

      if (!Number.isFinite(cronogramaDestino) || cronogramaDestino <= 0) {
        return Response.json(
          { error: "Campo cronograma_destino é obrigatório" },
          { status: 400 },
        );
      }

      const payload = {
        cronograma_destino: cronogramaDestino,
        duplicar: Boolean(body?.duplicar),
      };

      const response = await api.post(
        `/projeto-casos/${encodeURIComponent(id)}/transferir-projeto`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
        },
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
      console.error("Erro na API Route ao transferir caso de projeto:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao transferir caso para o projeto";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
