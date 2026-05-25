import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpRiscoApiResponse } from "@/interfaces/sgp-risco";

export type { DeleteSgpRiscoApiResponse };

const DEFAULT_SUCCESS: DeleteSgpRiscoApiResponse = {
  success: true,
  message: "Risco excluído com sucesso.",
};

/**
 * Exclui risco SGP.
 * Fluxo: Service → API Route → API externa DELETE /sgp-riscos/{sequencia}
 */
export async function deleteSgpRisco(
  sequencia: number | string,
): Promise<DeleteSgpRiscoApiResponse> {
  const url = new URL(
    `/api/sgp-riscos/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir risco",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteSgpRiscoApiResponse;
}
