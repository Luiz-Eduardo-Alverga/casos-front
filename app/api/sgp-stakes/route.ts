import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { CreateSgpStakeRequest } from "@/interfaces/sgp-stake";

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

export async function POST(request: Request) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = (await request.json()) as CreateSgpStakeRequest;

      if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
        return Response.json(
          { error: "Registro (projeto) é obrigatório" },
          { status: 400 },
        );
      }
      if (!body?.Caracteristica?.trim()) {
        return Response.json(
          { error: "Caracteristica é obrigatória" },
          { status: 400 },
        );
      }
      if (body?.Id_Tipo == null || Number.isNaN(Number(body.Id_Tipo))) {
        return Response.json(
          { error: "Id_Tipo é obrigatório" },
          { status: 400 },
        );
      }
      if (!body?.Nomes?.trim()) {
        return Response.json({ error: "Nomes é obrigatório" }, { status: 400 });
      }
      if (body?.Suporte_id == null || Number.isNaN(Number(body.Suporte_id))) {
        return Response.json(
          { error: "Suporte_id é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.post("/sgp-stakes", body, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao cadastrar sgp-stakes:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao cadastrar stakeholder",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
