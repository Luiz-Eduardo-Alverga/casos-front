import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { CreateProdutoScriptRequest } from "@/interfaces/produto";
import { validateProdutoScriptWriteBody } from "./validate-produto-script-body";

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

export async function GET(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const projetoVersoesId = url.searchParams.get("projetoVersoes_id");
    const per_page = url.searchParams.get("per_page") ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;

    if (!projetoVersoesId) {
      return Response.json(
        { error: "Parametro projetoVersoes_id é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get("/projeto-versoes-scripts", {
      params: {
        projetoVersoes_id: projetoVersoesId,
        ...(per_page ? { per_page } : {}),
        ...(cursor !== undefined ? { cursor } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Erro na API Route de projeto-versoes-scripts:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar scripts do produto",
    );
    return Response.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as CreateProdutoScriptRequest;
    const validationError = validateProdutoScriptWriteBody(body);
    if (validationError) return validationError;

    const response = await api.post("/projeto-versoes-scripts", body, {
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
    console.error("Erro na API Route ao criar script do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao criar script do produto",
    );
    return Response.json({ error: message }, { status });
  }
}

