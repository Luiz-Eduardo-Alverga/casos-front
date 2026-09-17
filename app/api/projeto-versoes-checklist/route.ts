import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { CreateProdutoChecklistRequest } from "@/interfaces/produto";
import { validateProdutoChecklistWriteBody } from "./validate-produto-checklist-body";

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
    const projetoVersoesId = url.searchParams.get("Projeto_Versoes_ID");
    const per_page = url.searchParams.get("per_page") ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;

    if (!projetoVersoesId) {
      return Response.json(
        { error: "Parametro Projeto_Versoes_ID é obrigatório" },
        { status: 400 },
      );
    }

    const response = await api.get("/projeto-versoes-checklist", {
      params: {
        Projeto_Versoes_ID: projetoVersoesId,
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
    console.error("Erro na API Route de projeto-versoes-checklist:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar checklist do produto",
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

    const body = (await request.json()) as CreateProdutoChecklistRequest;
    const validationError = validateProdutoChecklistWriteBody(body);
    if (validationError) return validationError;

    const response = await api.post("/projeto-versoes-checklist", body, {
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
    console.error("Erro na API Route ao criar item de checklist:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao criar item de checklist",
    );
    return Response.json({ error: message }, { status });
  }
}
