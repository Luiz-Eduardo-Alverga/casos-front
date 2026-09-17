import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { UpdateProdutoRequest } from "@/interfaces/produto";
import { validateProdutoWriteBody } from "../validate-produto-body";

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

export async function GET(
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
        { error: "ID do produto é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get(`/projeto-versoes/${id}`, {
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Erro na API Route de projeto-versoes por ID:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar detalhes do produto",
    );
    return Response.json({ error: message }, { status });
  }
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
        { error: "ID do produto é obrigatório" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as UpdateProdutoRequest;
    const validationError = validateProdutoWriteBody(body);
    if (validationError) return validationError;

    const response = await api.put(`/projeto-versoes/${id}`, body, {
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
    console.error("Erro na API Route ao atualizar produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao atualizar produto",
    );
    return Response.json({ error: message }, { status });
  }
}
