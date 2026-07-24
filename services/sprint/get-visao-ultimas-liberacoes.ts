import { fetchWithAuth } from "@/lib/fetch";
import type { TipoLiberacao } from "@/services/sprint/get-visao-proximas-liberacoes";

export type { TipoLiberacao };

export interface VisaoUltimasLiberacoesItem {
  produto: string;
  versao: string;
  data: string;
  tipo_liberacao: TipoLiberacao;
  status: string;
  setor: string;
  registro: number;
}

export interface VisaoUltimasLiberacoesFiltro {
  produto_id: number;
  setor: string;
  tipo_liberacao: TipoLiberacao;
  dias_liberacao: number;
}

export interface VisaoUltimasLiberacoesResponse {
  success: boolean;
  data: VisaoUltimasLiberacoesItem[];
  filtro: VisaoUltimasLiberacoesFiltro;
  total: number;
}

export interface GetVisaoUltimasLiberacoesParams {
  produto_id?: string;
  setor?: string;
  tipo_liberacao?: TipoLiberacao;
  dias_liberacao?: string;
}

/**
 * Busca as últimas liberações da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-ultimas-liberacoes
 */
export async function getVisaoUltimasLiberacoes(
  params: GetVisaoUltimasLiberacoesParams,
): Promise<VisaoUltimasLiberacoesResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-ultimas-liberacoes",
    window.location.origin,
  );

  if (params.produto_id?.trim()) {
    url.searchParams.set("produto_id", params.produto_id.trim());
  }
  if (params.setor?.trim()) {
    url.searchParams.set("setor", params.setor.trim());
  }
  if (params.tipo_liberacao?.trim()) {
    url.searchParams.set("tipo_liberacao", params.tipo_liberacao.trim());
  }
  if (params.dias_liberacao?.trim()) {
    url.searchParams.set("dias_liberacao", params.dias_liberacao.trim());
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar últimas liberações",
    );
  }

  return await response.json();
}
