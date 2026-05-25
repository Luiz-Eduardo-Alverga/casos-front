import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpRiscoApiResponse,
  CreateSgpRiscoRequest,
} from "@/interfaces/sgp-risco";

export type { CreateSgpRiscoRequest, CreateSgpRiscoApiResponse };

/**
 * Cadastra risco em um projeto SGP.
 * Fluxo: Service → API Route → API externa POST /sgp-riscos
 */
export async function createSgpRisco(
  data: CreateSgpRiscoRequest,
): Promise<CreateSgpRiscoApiResponse> {
  const response = await fetchWithAuth("/api/sgp-riscos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao cadastrar risco",
    );
  }

  return await response.json();
}
