import { fetchWithAuth } from "@/lib/fetch";

export interface PainelIdeiaItem {
  registro: number;
  suporte: number;
  datas: string;
  modulo: string | null;
  descricao: string;
  produto: string;
  objetivo: string;
  status: string;
  concluido: string | null;
  justificativa: string | null;
  data_aprovado: string | null;
  tipo: string;
  versao: string | null;
  partner: string | null;
  nome_suporte: string | null;
  processo: string | null;
  avaliado_por: string | null;
  setor: string | null;
  melhoria_em: number | null;
  descricao_resumo: string | null;
  importancia: string | null;
  link: string | null;
  lacrar: boolean;
  report: boolean;
  produto_id: number;
  descricao_resumo_tratada: string | null;
  numero_caso: number | null;
  setor_produto: string | null;
  suporte_setor: string | null;
}

export interface PainelIdeiasPagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number;
  to: number;
}

export interface PainelIdeiasResponse {
  success: boolean;
  data: PainelIdeiaItem[];
  pagination: PainelIdeiasPagination;
}

export interface GetPainelIdeiasParams {
  per_page?: number;
  page?: number;
  data_inicial?: string;
  data_final?: string;
  registro?: number | string;
  produto_id?: number | string;
  lacrar?: boolean;
  concluido?: boolean;
  setor?: string;
  search?: string;
}

/**
 * Lista ideias do painel.
 * Fluxo: Service → API Route → API externa GET /painel-ideias
 */
export async function getPainelIdeias(
  params: GetPainelIdeiasParams = {},
): Promise<PainelIdeiasResponse> {
  const url = new URL("/api/painel-ideias", window.location.origin);

  const stringParams: Array<[string, string | undefined | null]> = [
    [
      "per_page",
      params.per_page != null ? String(params.per_page) : undefined,
    ],
    ["page", params.page != null ? String(params.page) : undefined],
    ["data_inicial", params.data_inicial],
    ["data_final", params.data_final],
    [
      "registro",
      params.registro != null ? String(params.registro) : undefined,
    ],
    [
      "produto_id",
      params.produto_id != null ? String(params.produto_id) : undefined,
    ],
    [
      "lacrar",
      params.lacrar != null ? String(params.lacrar) : undefined,
    ],
    [
      "concluido",
      params.concluido != null ? String(params.concluido) : undefined,
    ],
    ["setor", params.setor],
    ["search", params.search],
  ];

  for (const [key, value] of stringParams) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
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
