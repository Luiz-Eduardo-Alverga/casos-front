import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpCronogramaApiResponse,
  CreateSgpCronogramaRequest,
} from "@/interfaces/sgp-cronograma";

export type { CreateSgpCronogramaRequest, CreateSgpCronogramaApiResponse };

/**
 * Cadastra tarefa de cronograma SGP.
 * Fluxo: Service → API Route → API externa POST /sgp-cronograma
 */
export async function createSgpCronograma(
  data: CreateSgpCronogramaRequest,
): Promise<CreateSgpCronogramaApiResponse> {
  const response = await fetchWithAuth("/api/sgp-cronograma", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao cadastrar tarefa do cronograma",
    );
  }

  return await response.json();
}
