import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateSgpCadastroApiResponse,
  UpdateSgpCadastroRequest,
} from "@/interfaces/sgp-cadastro";

export type { UpdateSgpCadastroRequest, UpdateSgpCadastroApiResponse };

/**
 * Atualiza cadastro SGP (aba Abertura).
 * Fluxo: Service → API Route → API externa PUT /sgp-cadastros/{id}
 */
export async function updateSgpCadastro(
  id: number | string,
  data: UpdateSgpCadastroRequest,
): Promise<UpdateSgpCadastroApiResponse> {
  const url = new URL(
    `/api/sgp-cadastros/${encodeURIComponent(String(id))}`,
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
      error?.message || error?.error || "Erro ao atualizar projeto",
    );
  }

  return await response.json();
}
