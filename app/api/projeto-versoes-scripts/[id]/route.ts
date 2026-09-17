import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { UpdateProdutoScriptRequest } from "@/interfaces/produto";
import { validateProdutoScriptWriteBody } from "../validate-produto-script-body";

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return Response.json(
        { error: "ID do script é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateProdutoScriptRequest;
    const validationError = validateProdutoScriptWriteBody(body);
    if (validationError) return validationError;

    const response = await api.put(`/projeto-versoes-scripts/${id}`, body, {
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
    console.error("Erro na API Route ao atualizar script do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao atualizar script do produto",
    );
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return Response.json(
        { error: "ID do script é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(`/projeto-versoes-scripts/${id}`, {
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
    console.error("Erro na API Route ao excluir script do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao excluir script do produto",
    );
    return Response.json({ error: message }, { status });
  }
}
