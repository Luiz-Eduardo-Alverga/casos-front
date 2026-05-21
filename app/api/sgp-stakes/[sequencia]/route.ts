import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateSgpStakeRequest } from "@/interfaces/sgp-stake";

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

function validateStakeBody(body: UpdateSgpStakeRequest): Response | null {
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
    return Response.json({ error: "Id_Tipo é obrigatório" }, { status: 400 });
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
          { error: "Sequência do stake é obrigatória" },
          { status: 400 },
        );
      }

      const response = await api.delete(`/sgp-stakes/${sequencia}`, {
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao excluir sgp-stakes:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao excluir stakeholder",
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
          { error: "Sequência do stake é obrigatória" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateSgpStakeRequest;
      const validationError = validateStakeBody(body);
      if (validationError) return validationError;

      const response = await api.put(`/sgp-stakes/${sequencia}`, body, {
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
      console.error("Erro na API Route ao atualizar sgp-stakes:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao atualizar stakeholder",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
