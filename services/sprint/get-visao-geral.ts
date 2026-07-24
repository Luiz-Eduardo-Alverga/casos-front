import { fetchWithAuth } from "@/lib/fetch";

export type VisaoGeralAgruparPor =
  | "versao"
  | "produto"
  | "projeto"
  | "atribuido_para";

export interface VisaoGeralItem {
  campo: string;
  produto: string;
  produto_id: number;
  id_projeto: number | null;
  qtde: number;
  abertos: number;
  aguardando_teste: number;
  retorno: number;
  suspenso: number;
  resolvidos: number;
  clientes: number;
  versao_status: string;
  versao_data_abertura: string;
}

export interface VisaoGeralFiltro {
  agrupar_por: VisaoGeralAgruparPor | string;
  atribuido_para: string | null;
  versao: string | null;
  id_projeto: number;
  produto_id: number;
  setor: string;
  dias_abertura: number;
}

export interface VisaoGeralResponse {
  success: boolean;
  data: VisaoGeralItem[];
  filtro: VisaoGeralFiltro;
  total: number;
}

export interface GetVisaoGeralParams {
  id_projeto?: string;
  produto_id?: string;
  setor?: string;
  agrupar_por?: VisaoGeralAgruparPor;
  atribuido_para?: string;
}

/**
 * Busca a visão geral da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-geral
 */
export async function getVisaoGeral(
  params: GetVisaoGeralParams,
): Promise<VisaoGeralResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-geral",
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
  if (params.agrupar_por?.trim()) {
    url.searchParams.set("agrupar_por", params.agrupar_por.trim());
  }
  if (params.atribuido_para?.trim()) {
    url.searchParams.set("atribuido_para", params.atribuido_para.trim());
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar visão geral",
    );
  }

  return await response.json();
}
