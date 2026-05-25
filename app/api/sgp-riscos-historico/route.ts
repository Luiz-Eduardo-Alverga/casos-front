import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { CreateSgpRiscoHistoricoRequest } from "@/interfaces/sgp-risco-historico";

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

function validateHistoricoBody(
  body: CreateSgpRiscoHistoricoRequest,
): Response | null {
  if (body?.id_seq == null || Number.isNaN(Number(body.id_seq))) {
    return Response.json({ error: "id_seq é obrigatório" }, { status: 400 });
  }
  if (!body?.data_historico?.trim()) {
    return Response.json(
      { error: "data_historico é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.descricao?.trim()) {
    return Response.json({ error: "descricao é obrigatório" }, { status: 400 });
  }
  if (!body?.impacto?.trim()) {
    return Response.json({ error: "impacto é obrigatório" }, { status: 400 });
  }
  return null;
}

export async function GET(request: Request) {
  return withPermission("list-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const url = new URL(request.url);
      const id_seq = url.searchParams.get("id_seq");
      if (!id_seq) {
        return Response.json(
          { error: "id_seq (risco) é obrigatório" },
          { status: 400 },
        );
      }

      const per_page = url.searchParams.get("per_page") ?? undefined;
      const cursor = url.searchParams.get("cursor") ?? undefined;

      const response = await api.get("/sgp-riscos-historico", {
        params: {
          id_seq,
          ...(per_page ? { per_page } : {}),
          ...(cursor !== undefined && cursor !== "" ? { cursor } : {}),
        },
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route de sgp-riscos-historico:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao buscar histórico de riscos",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

export async function POST(request: Request) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const body = (await request.json()) as CreateSgpRiscoHistoricoRequest;
      const validationError = validateHistoricoBody(body);
      if (validationError) return validationError;

      const response = await api.post("/sgp-riscos-historico", body, {
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
      console.error("Erro na API Route ao cadastrar sgp-riscos-historico:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao cadastrar ocorrência",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
