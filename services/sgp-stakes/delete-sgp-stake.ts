import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpStakeApiResponse } from "@/interfaces/sgp-stake";

export type { DeleteSgpStakeApiResponse };

/**
 * Exclui stakeholder (stake) SGP.
 * Fluxo: Service → API Route → API externa DELETE /sgp-stakes/{sequencia}
 */
export async function deleteSgpStake(
  sequencia: number | string,
): Promise<DeleteSgpStakeApiResponse> {
  const url = new URL(
    `/api/sgp-stakes/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir stakeholder",
    );
  }

  return await response.json();
}
