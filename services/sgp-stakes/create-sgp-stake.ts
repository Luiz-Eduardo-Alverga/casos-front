import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpStakeApiResponse,
  CreateSgpStakeRequest,
} from "@/interfaces/sgp-stake";

export type { CreateSgpStakeRequest, CreateSgpStakeApiResponse };

/**
 * Cadastra stakeholder (stake) em um projeto SGP.
 * Fluxo: Service → API Route → API externa POST /sgp-stakes
 */
export async function createSgpStake(
  data: CreateSgpStakeRequest,
): Promise<CreateSgpStakeApiResponse> {
  const response = await fetchWithAuth("/api/sgp-stakes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao cadastrar stakeholder",
    );
  }

  return await response.json();
}
