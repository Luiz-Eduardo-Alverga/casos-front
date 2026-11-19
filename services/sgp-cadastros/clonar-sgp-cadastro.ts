import { fetchWithAuth } from "@/lib/fetch";
import type {
  ClonarSgpCadastroRequest,
  ClonarSgpCadastroResponse,
} from "@/interfaces/sgp-cadastro";

export type { ClonarSgpCadastroRequest, ClonarSgpCadastroResponse };

/**
 * Clona um projeto SGP (nome e período novos; o resto vem da origem).
 * Fluxo: Service → API Route → API externa POST /sgp-cadastros/{id}/clonar
 */
export async function clonarSgpCadastro(
  id: number | string,
  data: ClonarSgpCadastroRequest,
): Promise<ClonarSgpCadastroResponse> {
  const url = new URL(
    `/api/sgp-cadastros/${encodeURIComponent(String(id))}/clonar`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao clonar projeto");
  }

  return await response.json();
}
