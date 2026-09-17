import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { UpdateProdutoVersaoRequest } from "@/interfaces/produto";
import { validateProdutoVersaoWriteBody } from "../validate-produto-versao-body";

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

export async function PATCH(
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
        { error: "ID da versão é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateProdutoVersaoRequest;
    const validationError = validateProdutoVersaoWriteBody(body);
    if (validationError) return validationError;

    const response = await api.patch(`/projeto-versoes-sub/${id}`, body, {
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
    console.error("Erro na API Route ao atualizar versão do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao atualizar versão do produto",
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
        { error: "ID da versão é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.delete(`/projeto-versoes-sub/${id}`, {
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
    console.error("Erro na API Route ao excluir versão do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao excluir versão do produto",
    );
    return Response.json({ error: message }, { status });
  }
}
