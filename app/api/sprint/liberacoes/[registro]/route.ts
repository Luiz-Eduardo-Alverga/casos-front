import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type {
  FecharLiberacaoRequest,
  UpdateLiberacaoRequest,
} from "@/interfaces/liberacao";

function validateUpdateLiberacaoBody(
  body: UpdateLiberacaoRequest,
): Response | null {
  if (
    body?.produto_id != null &&
    Number.isNaN(Number(body.produto_id))
  ) {
    return Response.json(
      { error: "produto_id inválido" },
      { status: 400 },
    );
  }
  if (
    body?.versoes != null &&
    (!Array.isArray(body.versoes) || body.versoes.length === 0)
  ) {
    return Response.json(
      { error: "versoes deve ser um array com ao menos um item" },
      { status: 400 },
    );
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get(`/sprint/liberacoes/${registro}`, {
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de liberação por registro:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateLiberacaoRequest;
    const validationError = validateUpdateLiberacaoBody(body);
    if (validationError) return validationError;

    const response = await api.patch(`/sprint/liberacoes/${registro}`, body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route ao atualizar liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao atualizar liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

function validateFecharLiberacaoBody(
  body: FecharLiberacaoRequest,
): Response | null {
  if (!body?.status?.trim()) {
    return Response.json({ error: "status é obrigatório" }, { status: 400 });
  }
  if (!body?.versao_final_data_liberacao?.trim()) {
    return Response.json(
      { error: "versao_final_data_liberacao é obrigatório" },
      { status: 400 },
    );
  }
  return null;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as FecharLiberacaoRequest;
    const validationError = validateFecharLiberacaoBody(body);
    if (validationError) return validationError;

    const response = await api.put(`/sprint/liberacoes/${registro}`, body, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route ao fechar liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao fechar liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ registro: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { registro } = await params;

    if (!registro) {
      return Response.json(
        { error: "Parametro registro é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(`/sprint/liberacoes/${registro}`, {
      headers: authHeaders,
    });

    if (response.status === 204) {
      return new Response(null, { status: 204 });
    }

    return Response.json(response.data ?? { success: true }, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route ao excluir liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao excluir liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}
