import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateLiberacaoRequest,
  UpdateLiberacaoResponse,
} from "@/interfaces/liberacao";

export type { UpdateLiberacaoRequest, UpdateLiberacaoResponse };

/**
 * Atualiza um registro de liberação.
 * Fluxo: Service → API Route → API externa PATCH /sprint/liberacoes/{registro}
 */
export async function updateLiberacao(
  registro: number | string,
  data: UpdateLiberacaoRequest,
): Promise<UpdateLiberacaoResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao atualizar liberação",
    );
  }

  return await response.json();
}
