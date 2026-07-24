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
    const atribuido_para = url.searchParams.get("atribuido_para");
    const agrupar_por = url.searchParams.get("agrupar_por");
    const versao = url.searchParams.get("versao");

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

    const response = await api.get("/sprint/minha-visao/visao-distribuicao", {
      params: {
        ...(id_projeto ? { id_projeto } : {}),
        ...(produto_id ? { produto_id } : {}),
        ...(setor ? { setor } : {}),
        ...(atribuido_para ? { atribuido_para } : {}),
        ...(agrupar_por ? { agrupar_por } : {}),
        ...(versao ? { versao } : {}),
      },
      headers: authHeaders,
    });

    return Response.json(response.data, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Erro na API Route de visão distribuição:", error);
    const status = error?.response?.status || 500;
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Erro ao buscar visão distribuição";
    return Response.json({ error: errorMessage }, { status });
  }
}
