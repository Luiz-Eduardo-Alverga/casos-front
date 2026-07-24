import { fetchWithAuth } from "@/lib/fetch";

export interface VisaoCasosEmProducaoItem {
  projeto: number;
  id_caso: number;
  iniciado_em: string;
  colaborador: string;
  setor: string;
  produto: string;
  produto_id: number;
  descricao_resumo: string;
}

export interface VisaoCasosEmProducaoFiltro {
  produto_id: number;
  setor: string;
  id_projeto: number;
}

export interface VisaoCasosEmProducaoResponse {
  success: boolean;
  data: VisaoCasosEmProducaoItem[];
  filtro: VisaoCasosEmProducaoFiltro;
  total: number;
}

export interface GetVisaoCasosEmProducaoParams {
  id_projeto?: string;
  produto_id?: string;
  setor?: string;
}

/**
 * Busca os casos em produção da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-casos-em-producao
 */
export async function getVisaoCasosEmProducao(
  params: GetVisaoCasosEmProducaoParams,
): Promise<VisaoCasosEmProducaoResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-casos-em-producao",
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

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar casos em produção",
    );
  }

  return await response.json();
}
