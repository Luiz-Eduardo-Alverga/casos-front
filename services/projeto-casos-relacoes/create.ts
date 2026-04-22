import { fetchWithAuth } from "@/lib/fetch";

export type TipoRelacaoCaso = 1 | 2 | 3 | 4 | 5;

export const TIPO_RELACAO_CASO_LABEL: Record<TipoRelacaoCaso, string> = {
  1: "É PAI DE",
  2: "É FILHO DE",
  3: "ESTA RELACIONADO A",
  4: "É DUPLICADO DE",
  5: "POSSUI DUPLICADO",
};

export interface CreateCasoRelacaoRequest {
  registro: number;
  tipo_relacao: TipoRelacaoCaso;
  caso_relacionado: number;
  descricao_resumo: string;
}

export interface CasoRelacaoItem {
  sequencia: number;
  registro: number;
  data_relacao: string;
  tipo_relacao: TipoRelacaoCaso;
  tipo_relacao_nome: string;
  caso_relacionado: number;
  descricao_resumo: string;
}

export interface CreateCasoRelacaoResponse {
  message: string;
  data: CasoRelacaoItem;
}

/**
 * Cria uma relação entre casos.
 * POST /api/projeto-casos-relacoes → API externa POST /projeto-casos-relacoes
 */
export async function createCasoRelacao(
  data: CreateCasoRelacaoRequest
): Promise<CreateCasoRelacaoResponse> {
  const response = await fetchWithAuth(
    `${window.location.origin}/api/projeto-casos-relacoes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao criar relação do caso"
    );
  }

  return await response.json();
}

