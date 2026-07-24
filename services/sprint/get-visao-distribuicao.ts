import { fetchWithAuth } from "@/lib/fetch";

export interface VisaoDistribuicaoItem {
  campo: string | null;
  atribuido_para: string;
  id_colaborador: number;
  setor: string;
  id_produto: number | null;
  versao_produto: string | null;
  retornos: number;
  abertos: number;
  estimados_qtd: number;
  estimados_minutos: number;
  estimados_horas: string;
  pendentes_qtd: number;
  nao_planejados_qtd: number;
}

export interface VisaoDistribuicaoTotais {
  linhas: number;
  retornos: number;
  abertos: number;
  estimados_qtd: number;
  estimados_minutos: number;
  estimados_horas: string;
  pendentes_qtd: number;
  nao_planejados_qtd: number;
}

export interface VisaoDistribuicaoFiltro {
  agrupar_por: string;
  atribuido_para: string | null;
  versao: string | null;
  id_projeto: number;
  produto_id: number;
  setor: string;
}

export interface VisaoDistribuicaoResponse {
  success: boolean;
  data: VisaoDistribuicaoItem[];
  totais: VisaoDistribuicaoTotais;
  filtro: VisaoDistribuicaoFiltro;
  total: number;
}

export interface GetVisaoDistribuicaoParams {
  id_projeto?: string;
  produto_id?: string;
  setor?: string;
  atribuido_para?: string;
}

/**
 * Busca a visão de distribuição da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-distribuicao
 */
export async function getVisaoDistribuicao(
  params: GetVisaoDistribuicaoParams,
): Promise<VisaoDistribuicaoResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-distribuicao",
    window.location.origin,
  );

  if (params.id_projeto?.trim()) {
    url.searchParams.set("id_projeto", params.id_projeto.trim());
  }
  if (params.produto_id?.trim()) {
    url.searchParams.set("produto_id", params.produto_id.trim());
  }
  if (params.setor?.trim()) {
    url.searchParams.set("setor", params.setor.trim());
  }
  if (params.atribuido_para?.trim()) {
    url.searchParams.set("atribuido_para", params.atribuido_para.trim());
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar visão distribuição",
    );
  }

  return await response.json();
}
