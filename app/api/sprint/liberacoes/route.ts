import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";
import type { CreateLiberacaoRequest } from "@/interfaces/liberacao";

function validateCreateLiberacaoBody(
  body: CreateLiberacaoRequest,
): Response | null {
  if (body?.produto_id == null || Number.isNaN(Number(body.produto_id))) {
    return Response.json(
      { error: "produto_id é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.tipo_liberacao?.trim()) {
    return Response.json(
      { error: "tipo_liberacao é obrigatório" },
      { status: 400 },
    );
  }
  if (!body?.status?.trim()) {
    return Response.json({ error: "status é obrigatório" }, { status: 400 });
  }
  if (!Array.isArray(body?.versoes) || body.versoes.length === 0) {
    return Response.json(
      { error: "versoes é obrigatório e deve conter ao menos um item" },
      { status: 400 },
    );
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const produto_id = url.searchParams.get("produto_id");
    const status = url.searchParams.get("status");
    const tipo_liberacao = url.searchParams.get("tipo_liberacao");
    const versao = url.searchParams.get("versao");
    const sort_by = url.searchParams.get("sort_by");
    const sort_order = url.searchParams.get("sort_order");
    const per_page = url.searchParams.get("per_page");
    const cursor = url.searchParams.get("cursor");

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/sprint/liberacoes", {
      params: {
        ...(produto_id ? { produto_id } : {}),
        ...(status ? { status } : {}),
        ...(tipo_liberacao ? { tipo_liberacao } : {}),
        ...(versao ? { versao } : {}),
        ...(sort_by ? { sort_by } : {}),
        ...(sort_order ? { sort_order } : {}),
        ...(per_page ? { per_page } : {}),
        ...(cursor ? { cursor } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de liberações:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar liberações";
    return Response.json({ error: errorMessage }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = (await request.json()) as CreateLiberacaoRequest;
    const validationError = validateCreateLiberacaoBody(body);
    if (validationError) return validationError;

    const response = await api.post("/sprint/liberacoes", body, {
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
    console.error("Erro na API Route ao criar liberação:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao criar liberação";
    return Response.json({ error: errorMessage }, { status });
  }
}
