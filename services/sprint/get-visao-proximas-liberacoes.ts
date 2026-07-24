import { fetchWithAuth } from "@/lib/fetch";

export type TipoLiberacao = "Hotfix" | "Release";

export interface VisaoProximasLiberacoesItem {
  produto: string;
  versao: string;
  data: string;
  tipo_liberacao: TipoLiberacao;
  liberado: string;
  status: string;
  datas: string;
  versao_final_data_prevista: string | null;
  setor: string;
  registro: number;
}

export interface VisaoProximasLiberacoesFiltro {
  produto_id: number;
  setor: string;
  tipo_liberacao: TipoLiberacao;
  dias_abertura: number;
  dias_prevista: number;
}

export interface VisaoProximasLiberacoesResponse {
  success: boolean;
  data: VisaoProximasLiberacoesItem[];
  filtro: VisaoProximasLiberacoesFiltro;
  total: number;
}

export interface GetVisaoProximasLiberacoesParams {
  produto_id?: string;
  setor?: string;
  tipo_liberacao?: TipoLiberacao;
}

/**
 * Busca as próximas liberações da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-proximas-liberacoes
 */
export async function getVisaoProximasLiberacoes(
  params: GetVisaoProximasLiberacoesParams,
): Promise<VisaoProximasLiberacoesResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-proximas-liberacoes",
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

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar próximas liberações",
    );
  }

  return await response.json();
}
