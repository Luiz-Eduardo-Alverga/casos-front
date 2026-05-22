import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import { withPermission } from "@/lib/api-db/with-permission";
import type { UpdateSgpCronogramaRequest } from "@/interfaces/sgp-cronograma";

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

function validateCronogramaBody(
  body: UpdateSgpCronogramaRequest,
): Response | null {
  if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
    return Response.json(
      { error: "Registro (projeto) é obrigatório" },
      { status: 400 },
    );
  }
  if (body?.Id_Tipo == null || Number.isNaN(Number(body.Id_Tipo))) {
    return Response.json({ error: "Id_Tipo é obrigatório" }, { status: 400 });
  }
  if (body?.Id_Papel == null || Number.isNaN(Number(body.Id_Papel))) {
    return Response.json({ error: "Id_Papel é obrigatório" }, { status: 400 });
  }
  if (!body?.ObjetivoQuem?.trim()) {
    return Response.json(
      { error: "ObjetivoQuem é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.HoraPrevista?.trim()) {
    return Response.json(
      { error: "HoraPrevista é obrigatória" },
      { status: 400 },
    );
  }
  if (!body?.DataInicio?.trim()) {
    return Response.json(
      { error: "DataInicio é obrigatória" },
      { status: 400 },
    );
  }
  if (!body?.DataTermino?.trim()) {
    return Response.json(
      { error: "DataTermino é obrigatória" },
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
          { error: "Sequência da tarefa é obrigatória" },
          { status: 400 },
        );
      }

      const response = await api.delete(`/sgp-cronograma/${sequencia}`, {
        headers: authHeaders,
      });

      return Response.json(response.data, {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      console.error("Erro na API Route ao excluir sgp-cronograma:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao excluir tarefa do cronograma",
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
          { error: "Sequência da tarefa é obrigatória" },
          { status: 400 },
        );
      }

      const body = (await request.json()) as UpdateSgpCronogramaRequest;
      const validationError = validateCronogramaBody(body);
      if (validationError) return validationError;

      const response = await api.put(`/sgp-cronograma/${sequencia}`, body, {
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
      console.error("Erro na API Route ao atualizar sgp-cronograma:", error);
      const { status, message } = extractApiError(
        error,
        "Erro ao atualizar tarefa do cronograma",
      );
      return Response.json({ error: message }, { status });
    }
  });
}
