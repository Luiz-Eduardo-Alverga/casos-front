import { fetchWithAuth } from "@/lib/fetch";

export interface DeleteCasoResponse {
  success: boolean;
  message: string;
}

/**
 * Exclui um caso pelo ID.
 * DELETE /api/projeto-casos/{id} → API externa DELETE /projeto-casos/{id}
 */
export async function deleteCaso(
  id: number | string
): Promise<DeleteCasoResponse> {
  const url = new URL(
    `/api/projeto-casos/${encodeURIComponent(String(id))}`,
    window.location.origin
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao excluir caso"
    );
  }

  return await response.json();
}
