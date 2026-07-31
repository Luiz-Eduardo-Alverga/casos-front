import { fetchWithAuth } from "@/lib/fetch";
import type {
  FecharLiberacaoRequest,
  FecharLiberacaoResponse,
} from "@/interfaces/liberacao";

export type { FecharLiberacaoRequest, FecharLiberacaoResponse };

/**
 * Fecha um registro de liberação.
 * Fluxo: Service → API Route → API externa PUT /sprint/liberacoes/{registro}
 */
export async function fecharLiberacao(
  registro: number | string,
  data: FecharLiberacaoRequest,
): Promise<FecharLiberacaoResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}`,
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
      error?.message || error?.error || "Erro ao fechar liberação",
    );
  }

  return await response.json();
}
