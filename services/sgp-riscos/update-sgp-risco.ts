import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateSgpRiscoApiResponse,
  UpdateSgpRiscoRequest,
} from "@/interfaces/sgp-risco";

export type { UpdateSgpRiscoRequest, UpdateSgpRiscoApiResponse };

/**
 * Atualiza risco SGP.
 * Fluxo: Service → API Route → API externa PUT /sgp-riscos/{sequencia}
 */
export async function updateSgpRisco(
  sequencia: number | string,
  data: UpdateSgpRiscoRequest,
): Promise<UpdateSgpRiscoApiResponse> {
  const url = new URL(
    `/api/sgp-riscos/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao atualizar risco",
    );
  }

  return await response.json();
}
