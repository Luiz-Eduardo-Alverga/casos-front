import { fetchWithAuth } from "@/lib/fetch";
import type {
  CreateSgpUsuarioApiResponse,
  CreateSgpUsuarioRequest,
} from "@/interfaces/sgp-cadastro";

export type { CreateSgpUsuarioRequest, CreateSgpUsuarioApiResponse };

/**
 * Vincula um usuário autorizado ao projeto SGP.
 * Fluxo: Service → API Route → API externa POST /sgp-usuarios
 */
export async function createSgpUsuario(
  data: CreateSgpUsuarioRequest,
): Promise<CreateSgpUsuarioApiResponse> {
  const response = await fetchWithAuth("/api/sgp-usuarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao adicionar usuário autorizado",
    );
  }

  return await response.json();
}
