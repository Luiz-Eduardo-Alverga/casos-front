import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { CreateProdutoRequest } from "@/interfaces/produto";
import { validateProdutoWriteBody } from "./validate-produto-body";

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
    const nomeProjeto = url.searchParams.get("NomeProjeto") ?? undefined;
    const setor = url.searchParams.get("Setor") ?? undefined;
    const per_page = url.searchParams.get("per_page") ?? undefined;
    const cursor = url.searchParams.get("cursor") ?? undefined;

    const response = await api.get("/projeto-versoes", {
      params: {
        ...(nomeProjeto ? { NomeProjeto: nomeProjeto } : {}),
        ...(setor ? { Setor: setor } : {}),
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
    console.error("Erro na API Route de projeto-versoes:", error);
    const { status, message } = extractApiError(
      error,
      "Erro ao buscar produtos",
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

    const body = (await request.json()) as CreateProdutoRequest;
    const validationError = validateProdutoWriteBody(body);
    if (validationError) return validationError;

    const response = await api.post("/projeto-versoes", body, {
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
    console.error("Erro na API Route ao criar produto:", error);
    const { status, message } = extractApiError(error, "Erro ao criar produto");
    return Response.json({ error: message }, { status });
  }
}
