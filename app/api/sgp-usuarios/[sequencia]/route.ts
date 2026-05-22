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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ sequencia: string }> },
) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { sequencia } = await params;
      if (!sequencia) {
        return Response.json(
          { error: "Sequência do vínculo é obrigatória" },
          { status: 400 },
        );
      }

      const response = await api.delete(`/sgp-usuarios/${sequencia}`, {
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao excluir sgp-usuarios:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao excluir usuário autorizado",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
