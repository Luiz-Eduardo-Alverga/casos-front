import { fetchWithAuth } from "@/lib/fetch";

export interface VisaoPrazosClientesItem {
  id: number;
  datas: string;
  descricao_resumo: string;
  status_caso: string;
  entregue: string;
  versao_produto: string;
  prazo_conclusao: string;
  status_caso_final: string;
  status_liberacao: string;
  versao_final_data_prevista: string | null;
  produto: string;
  produto_id: number;
  setor: string;
  cliente_id: number;
  cliente_nome: string;
}

export interface VisaoPrazosClientesFiltro {
  entregue: string | null;
  produto_id: number | null;
  setor: string | null;
  id_projeto: number | null;
}

export interface VisaoPrazosClientesResponse {
  success: boolean;
  data: VisaoPrazosClientesItem[];
  filtro: VisaoPrazosClientesFiltro;
  total: number;
}

export interface GetVisaoPrazosClientesParams {
  id_projeto?: string;
  produto_id?: string;
  setor?: string;
}

/**
 * Busca os prazos de clientes da sprint (minha visão).
 * Fluxo: Service → API Route → API externa GET /sprint/minha-visao/visao-prazos-clientes
 */
export async function getVisaoPrazosClientes(
  params: GetVisaoPrazosClientesParams,
): Promise<VisaoPrazosClientesResponse> {
  const url = new URL(
    "/api/sprint/minha-visao/visao-prazos-clientes",
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
      error?.message || error?.error || "Erro ao buscar prazos clientes",
    );
  }

  return await response.json();
}
