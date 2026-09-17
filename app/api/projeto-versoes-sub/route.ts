import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { CreateProdutoVersaoRequest } from "@/interfaces/produto";
import { validateProdutoVersaoWriteBody } from "./validate-produto-versao-body";

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
    const registro = url.searchParams.get("Registro");
    const per_page = url.searchParams.get("per_page") ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;

    if (!registro) {
      return Response.json(
        { error: "Parametro Registro é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get("/projeto-versoes-sub", {
      params: {
        Registro: registro,
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
    console.error("Erro na API Route de projeto-versoes-sub:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar versões do produto",
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

    const body = (await request.json()) as CreateProdutoVersaoRequest;
    const validationError = validateProdutoVersaoWriteBody(body);
    if (validationError) return validationError;

    const response = await api.post("/projeto-versoes-sub", body, {
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
    console.error("Erro na API Route ao criar versão do produto:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao criar versão do produto",
    );
    return Response.json({ error: message }, { status });
  }
}
