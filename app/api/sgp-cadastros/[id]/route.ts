import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }
      const { id } = await params;

      if (!id) {
        return Response.json(
          { error: "ID do cadastro é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.get(`/sgp-cadastros/${id}`, {
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; error?: string };
        };
        message?: string;
      };
      console.error("Erro na API Route de sgp-cadastros por ID:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao buscar cadastro SGP";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
