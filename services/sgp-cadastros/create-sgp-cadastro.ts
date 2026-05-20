import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpCadastroRequest,
  CreateSgpProjetoResponse,
} from "@/interfaces/sgp-cadastro";

export type { CreateSgpCadastroRequest, CreateSgpProjetoResponse };

/**
 * Cadastra projeto SGP (cadastro + vínculo de usuário).
 * Fluxo: Service → API Route → API externa POST /sgp-cadastros e POST /sgp-usuarios
 */
export async function createSgpCadastro(
  data: CreateSgpCadastroRequest,
): Promise<CreateSgpProjetoResponse> {
  const response = await fetchWithAuth("/api/sgp-cadastros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao cadastrar projeto",
    );
  }

  return await response.json();
}
