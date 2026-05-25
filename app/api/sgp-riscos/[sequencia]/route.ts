import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateSgpRiscoRequest } from "@/interfaces/sgp-risco";

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

const NIVEL_VALIDOS = new Set(["ALTO", "MEDIO", "BAIXO"]);

function validateRiscoBody(body: UpdateSgpRiscoRequest): Response | null {
  if (
    body?.sgp_cadastro_id == null ||
    Number.isNaN(Number(body.sgp_cadastro_id))
  ) {
    return Response.json(
      { error: "sgp_cadastro_id é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.datas?.trim()) {
    return Response.json({ error: "datas é obrigatório" }, { status: 400 });
  }
  if (!body?.descricao_risco?.trim()) {
    return Response.json(
      { error: "descricao_risco é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.probalidade?.trim() || !NIVEL_VALIDOS.has(body.probalidade.trim())) {
    return Response.json(
      { error: "probalidade inválida" },
      { status: 400 },
    );
  }
  if (!body?.impacto?.trim() || !NIVEL_VALIDOS.has(body.impacto.trim())) {
    return Response.json({ error: "impacto inválido" }, { status: 400 });
  }
  if (!body?.prioridade?.trim() || !NIVEL_VALIDOS.has(body.prioridade.trim())) {
    return Response.json(
      { error: "prioridade inválida" },
      { status: 400 },
    );
  }
  if (body?.id_risco == null || Number.isNaN(Number(body.id_risco))) {
    return Response.json({ error: "id_risco é obrigatório" }, { status: 400 });
  }
  return null;
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
          { error: "Sequência do risco é obrigatória" },
          { status: 400 },
        );
      }

      const response = await api.delete(`/sgp-riscos/${sequencia}`, {
        headers: authHeaders,
      });

      if (response.status === 204) {
        return new Response(null, { status: 204 });
      }

      return Response.json(response.data ?? { success: true }, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao excluir sgp-riscos:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao excluir risco",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

export async function PUT(
  request: Request,
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
          { error: "Sequência do risco é obrigatória" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateSgpRiscoRequest;
      const validationError = validateRiscoBody(body);
      if (validationError) return validationError;

      const response = await api.put(`/sgp-riscos/${sequencia}`, body, {
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
      console.error("Erro na API Route ao atualizar sgp-riscos:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao atualizar risco",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
