import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateLiberacaoRequest,
  CreateLiberacaoResponse,
} from "@/interfaces/liberacao";

export type { CreateLiberacaoRequest, CreateLiberacaoResponse };

/**
 * Cria um registro de liberação.
 * Fluxo: Service → API Route → API externa POST /sprint/liberacoes
 */
export async function createLiberacao(
  data: CreateLiberacaoRequest,
): Promise<CreateLiberacaoResponse> {
  const response = await fetchWithAuth("/api/sprint/liberacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao criar liberação",
    );
  }

  return await response.json();
}
