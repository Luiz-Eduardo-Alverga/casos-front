import { fetchWithAuth } from "@/lib/fetch";
import type {
  UpdateSgpCronogramaApiResponse,
  UpdateSgpCronogramaRequest,
} from "@/interfaces/sgp-cronograma";

export type { UpdateSgpCronogramaRequest, UpdateSgpCronogramaApiResponse };

/**
 * Atualiza tarefa de cronograma SGP.
 * Fluxo: Service → API Route → API externa PUT /sgp-cronograma/{sequencia}
 */
export async function updateSgpCronograma(
  sequencia: number | string,
  data: UpdateSgpCronogramaRequest,
): Promise<UpdateSgpCronogramaApiResponse> {
  const url = new URL(
    `/api/sgp-cronograma/${encodeURIComponent(String(sequencia))}`,
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
      error?.message || error?.error || "Erro ao atualizar tarefa do cronograma",
    );
  }

  return await response.json();
}
