import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function POST(request: Request) {
  return withPermission(["edit-case", "edit-report"], async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = await request.json().catch(() => null);
      const cronogramaOrigem = Number(body?.cronograma_origem);
      const cronogramaDestino = Number(body?.cronograma_destino);

      if (!Number.isFinite(cronogramaOrigem) || cronogramaOrigem <= 0) {
        return Response.json(
          { error: "Campo cronograma_origem é obrigatório" },
          { status: 400 },
        );
      }

      if (!Number.isFinite(cronogramaDestino) || cronogramaDestino <= 0) {
        return Response.json(
          { error: "Campo cronograma_destino é obrigatório" },
          { status: 400 },
        );
      }

      const payload: {
        cronograma_origem: number;
        cronograma_destino: number;
        registros?: number[];
      } = {
        cronograma_origem: cronogramaOrigem,
        cronograma_destino: cronogramaDestino,
      };

      if (Array.isArray(body?.registros) && body.registros.length > 0) {
        payload.registros = body.registros
          .map(Number)
          .filter((n: number) => Number.isFinite(n) && n > 0);
      }

      const response = await api.post(
        "/projeto-casos/transferir-proximo-projeto",
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
      console.error(
        "Erro na API Route ao transferir para o próximo projeto:",
        error,
      );
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao transferir casos para o próximo projeto";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
