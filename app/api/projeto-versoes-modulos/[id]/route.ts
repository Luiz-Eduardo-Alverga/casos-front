import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { UpdateProdutoModuloRequest } from "@/interfaces/produto";
import { validateProdutoModuloWriteBody } from "../validate-produto-modulo-body";

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
        { error: "ID do módulo é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateProdutoModuloRequest;
    const validationError = validateProdutoModuloWriteBody(body);
    if (validationError) return validationError;

    const response = await api.put(`/projeto-versoes-modulos/${id}`, body, {
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
    console.error("Erro na API Route ao atualizar módulo do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao atualizar módulo do produto",
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
        { error: "ID do módulo é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(`/projeto-versoes-modulos/${id}`, {
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
    console.error("Erro na API Route ao excluir módulo do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao excluir módulo do produto",
    );
    return Response.json({ error: message }, { status });
  }
}
