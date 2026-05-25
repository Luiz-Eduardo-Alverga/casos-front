import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateSgpRiscoHistoricoRequest } from "@/interfaces/sgp-risco-historico";

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
  body: UpdateSgpRiscoHistoricoRequest,
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { id } = await params;
      if (!id) {
        return Response.json(
          { error: "ID da ocorrência é obrigatório" },
          { status: 400 },
        );
      }

      const response = await api.delete(`/sgp-riscos-historico/${id}`, {
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
      console.error("Erro na API Route ao excluir sgp-riscos-historico:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao excluir ocorrência",
      );
      return Response.json({ error: message }, { status });
    }
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withPermission("edit-project", async () => {
    try {
      const authHeaders = await getAuthorizationHeader();
      if (!authHeaders.Authorization) {
        return Response.json({ error: "Não autorizado" }, { status: 401 });
      }

      const { id } = await params;
      if (!id) {
        return Response.json(
          { error: "ID da ocorrência é obrigatório" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateSgpRiscoHistoricoRequest;
      const validationError = validateHistoricoBody(body);
      if (validationError) return validationError;

      const response = await api.put(`/sgp-riscos-historico/${id}`, body, {
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
      console.error("Erro na API Route ao atualizar sgp-riscos-historico:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao atualizar ocorrência",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
