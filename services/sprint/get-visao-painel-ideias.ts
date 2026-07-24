import { fetchWithAuth } from "@/lib/fetch";

export interface VisaoPainelIdeiasItem {
  competencia: string;
  produto: string;
  produto_id: number;
  qtde: number;
  pendente: number;
  aprovado: number;
  reprovado: number;
  dt_inicial: string | null;
  dt_final: string | null;
}

export interface VisaoPainelIdeiasFiltro {
  agrupar_por: string;
  produto_id: number;
  setor: string;
  dias_abertura: number;
}

export interface VisaoPainelIdeiasResponse {
  success: boolean;
  data: VisaoPainelIdeiasItem[];
  filtro: VisaoPainelIdeiasFiltro;
  total: number;
}

export interface GetVisaoPainelIdeiasParams {
  id_projeto?: string;
  produto_id?: string;
  setor?: string;
}

/**
 * Busca o painel de ideias da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-painel-ideias
 */
export async function getVisaoPainelIdeias(
  params: GetVisaoPainelIdeiasParams,
): Promise<VisaoPainelIdeiasResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-painel-ideias",
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
      error?.message || error?.error || "Erro ao buscar painel de ideias",
    );
  }

  return await response.json();
}
