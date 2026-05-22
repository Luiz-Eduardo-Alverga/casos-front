import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpCronogramaApiResponse } from "@/interfaces/sgp-cronograma";

export type { DeleteSgpCronogramaApiResponse };

/**
 * Exclui tarefa de cronograma SGP.
 * Fluxo: Service → API Route → API externa DELETE /sgp-cronograma/{sequencia}
 */
export async function deleteSgpCronograma(
  sequencia: number | string,
): Promise<DeleteSgpCronogramaApiResponse> {
  const url = new URL(
    `/api/sgp-cronograma/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao excluir tarefa do cronograma",
    );
  }

  return await response.json();
}
