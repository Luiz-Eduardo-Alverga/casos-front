import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateSgpRiscoHistoricoApiResponse,
  UpdateSgpRiscoHistoricoRequest,
} from "@/interfaces/sgp-risco-historico";

export type { UpdateSgpRiscoHistoricoRequest, UpdateSgpRiscoHistoricoApiResponse };

/**
 * Atualiza ocorrência de risco SGP.
 * Fluxo: Service → API Route → API externa PUT /sgp-riscos-historico/{id}
 */
export async function updateSgpRiscoHistorico(
  id: number | string,
  data: UpdateSgpRiscoHistoricoRequest,
): Promise<UpdateSgpRiscoHistoricoApiResponse> {
  const response = await fetchWithAuth(
    `/api/sgp-riscos-historico/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao atualizar ocorrência",
    );
  }

  return await response.json();
}
