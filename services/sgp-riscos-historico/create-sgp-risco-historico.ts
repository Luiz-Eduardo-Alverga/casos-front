import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpRiscoHistoricoApiResponse,
  CreateSgpRiscoHistoricoRequest,
} from "@/interfaces/sgp-risco-historico";

export type { CreateSgpRiscoHistoricoRequest, CreateSgpRiscoHistoricoApiResponse };

/**
 * Cadastra ocorrência de risco SGP.
 * Fluxo: Service → API Route → API externa POST /sgp-riscos-historico
 */
export async function createSgpRiscoHistorico(
  data: CreateSgpRiscoHistoricoRequest,
): Promise<CreateSgpRiscoHistoricoApiResponse> {
  const response = await fetchWithAuth("/api/sgp-riscos-historico", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao cadastrar ocorrência",
    );
  }

  return await response.json();
}
