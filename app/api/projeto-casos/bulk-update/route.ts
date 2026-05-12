import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";

export async function POST(request: Request) {
  return withPermission("edit-case", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = await request.json().catch(() => null);
      const ids = body?.ids;

      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.json(
          { error: "Campo ids é obrigatório e deve ser um array não vazio" },
          { status: 400 },
        );
      }

      const response = await api.post("/projeto-casos/bulk-update", body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
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
      console.error("Erro na API Route de atualização em lote de casos:", error);
      const status = err?.response?.status ?? 500;
      const errorMessage =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        err?.message ??
        "Erro ao atualizar casos em lote";
      return Response.json({ error: errorMessage }, { status });
    }
  });
}
