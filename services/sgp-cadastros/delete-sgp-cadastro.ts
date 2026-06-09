import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpCadastroApiResponse } from "@/interfaces/sgp-cadastro";

export type { DeleteSgpCadastroApiResponse };

const DEFAULT_SUCCESS: DeleteSgpCadastroApiResponse = {
  success: true,
  message: "Cadastro excluído com sucesso",
};

/**
 * Exclui cadastro SGP (projeto).
 * Fluxo: Service → API Route → API externa DELETE /sgp-cadastros/{id}
 */
export async function deleteSgpCadastro(
  id: number | string,
): Promise<DeleteSgpCadastroApiResponse> {
  const url = new URL(
    `/api/sgp-cadastros/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir projeto",
    );
  }

  if (response.status === 204) {
    return DEFAULT_SUCCESS;
  }

  const text = await response.text();
  if (!text.trim()) {
    return DEFAULT_SUCCESS;
  }

  return JSON.parse(text) as DeleteSgpCadastroApiResponse;
}
