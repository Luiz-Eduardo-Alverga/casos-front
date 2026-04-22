import { fetchWithAuth } from "@/lib/fetch";
import type {
  CasoRelacaoItem,
  TipoRelacaoCaso,
} from "@/services/projeto-casos-relacoes/create";

export interface UpdateCasoRelacaoRequest {
  tipo_relacao: TipoRelacaoCaso;
  caso_relacionado: number;
  descricao_resumo: string;
}

export interface UpdateCasoRelacaoResponse {
  message: string;
  data: CasoRelacaoItem;
}

/**
 * Atualiza uma relação de caso pelo ID (sequência).
 * PUT /api/projeto-casos-relacoes/{id} → API externa PUT /projeto-casos-relacoes/{id}
 */
export async function updateCasoRelacao(
  id: number | string,
  data: UpdateCasoRelacaoRequest
): Promise<UpdateCasoRelacaoResponse> {
  const url = new URL(
    `/api/projeto-casos-relacoes/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao atualizar relação do caso"
    );
  }

  return await response.json();
}

