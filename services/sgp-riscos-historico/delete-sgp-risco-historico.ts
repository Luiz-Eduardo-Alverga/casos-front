import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpRiscoHistoricoApiResponse } from "@/interfaces/sgp-risco-historico";

export type { DeleteSgpRiscoHistoricoApiResponse };

const DEFAULT_SUCCESS: DeleteSgpRiscoHistoricoApiResponse = {
  success: true,
  message: "Ocorrência excluída com sucesso.",
};

/**
 * Exclui ocorrência de risco SGP.
 * Fluxo: Service → API Route → API externa DELETE /sgp-riscos-historico/{id}
 */
export async function deleteSgpRiscoHistorico(
  id: number | string,
): Promise<DeleteSgpRiscoHistoricoApiResponse> {
  const url = new URL(
    `/api/sgp-riscos-historico/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir ocorrência",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteSgpRiscoHistoricoApiResponse;
}
