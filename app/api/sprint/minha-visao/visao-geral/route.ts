import { api } from "@/lib/axios";
import { getAuthorizationHeader } from "@/lib/auth-server";

const AGRUPAR_POR_OPTIONS = new Set([
  "versao",
  "produto",
  "projeto",
  "atribuido_para",
]);

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id_projeto = url.searchParams.get("id_projeto");
    const produto_id = url.searchParams.get("produto_id");
    const setor = url.searchParams.get("setor");
    const agrupar_por = url.searchParams.get("agrupar_por");
    const atribuido_para = url.searchParams.get("atribuido_para");

    if (!id_projeto && !produto_id && !setor) {
      return Response.json(
        {
          error:
            "Informe ao menos um parametro: id_projeto, produto_id ou setor",
        },
        { status: 400 },
      );
    }

    if (agrupar_por && !AGRUPAR_POR_OPTIONS.has(agrupar_por)) {
      return Response.json(
        {
          error:
            "Parametro agrupar_por invalido. Use: versao, produto, projeto ou atribuido_para",
        },
        { status: 400 },
      );
    }

    const authHeaders = await getAuthorizationHeader();
    if (!authHeaders.Authorization) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const response = await api.get("/sprint/minha-visao/visao-geral", {
      params: {
        ...(id_projeto ? { id_projeto } : {}),
        ...(produto_id ? { produto_id } : {}),
        ...(setor ? { setor } : {}),
        ...(agrupar_por ? { agrupar_por } : {}),
        ...(atribuido_para ? { atribuido_para } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de visão geral:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar visão geral";
    return Response.json({ error: errorMessage }, { status });
  }
}
