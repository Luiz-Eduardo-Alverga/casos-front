import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateSgpStakeApiResponse,
  UpdateSgpStakeRequest,
} from "@/interfaces/sgp-stake";

export type { UpdateSgpStakeRequest, UpdateSgpStakeApiResponse };

/**
 * Atualiza stakeholder (stake) SGP.
 * Fluxo: Service → API Route → API externa PUT /sgp-stakes/{sequencia}
 */
export async function updateSgpStake(
  sequencia: number | string,
  data: UpdateSgpStakeRequest,
): Promise<UpdateSgpStakeApiResponse> {
  const url = new URL(
    `/api/sgp-stakes/${encodeURIComponent(String(sequencia))}`,
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
      error?.message || error?.error || "Erro ao atualizar stakeholder",
    );
  }

  return await response.json();
}
