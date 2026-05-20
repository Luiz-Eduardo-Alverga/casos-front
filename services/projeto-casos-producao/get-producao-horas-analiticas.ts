import { fetchWithAuth } from "@/lib/fetch";

export interface ProducaoHorasAnaliticasParams {
  produto_id?: string | number;
  projeto_id?: string | number;
  usuario?: string | number;
  data_producao_inicio: string;
  data_producao_fim: string;
}

export interface ProducaoHorasAnaliticasItem {
  registro: string;
  sequencia: string;
  descricao_resumo: string;
  nome_suporte: string;
  hora_abertura: string;
  hora_fechamento: string;
  realizado_minutos: string;
  tarefa_tecnica: boolean;
  tipo: string;
  produto: string;
  versao_produto: string;
  data_producao: string;
}

export interface ProducaoHorasAnaliticasResponse {
  success: boolean;
  data: ProducaoHorasAnaliticasItem[];
  total: number;
}

export async function getProducaoHorasAnaliticas(
  params: ProducaoHorasAnaliticasParams,
): Promise<ProducaoHorasAnaliticasResponse> {
  const url = new URL(
    "/api/projeto-casos-producao/horas-analiticas",
    window.location.origin,
  );

  const produtoId = String(params.produto_id ?? "").trim();
  const projetoId = String(params.projeto_id ?? "").trim();
  const usuarioId = String(params.usuario ?? "").trim();

  if (produtoId) {
    url.searchParams.set("produto_id", produtoId);
  }
  if (projetoId) {
    url.searchParams.set("projeto_id", projetoId);
  }
  if (usuarioId) {
    url.searchParams.set("usuario", usuarioId);
  }
  url.searchParams.set("data_producao_inicio", params.data_producao_inicio);
  url.searchParams.set("data_producao_fim", params.data_producao_fim);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body?.message ??
        body?.error ??
        "Erro ao buscar produção de horas analíticas",
    );
  }

  return body as ProducaoHorasAnaliticasResponse;
}
