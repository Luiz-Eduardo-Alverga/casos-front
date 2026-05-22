import { fetchWithAuth } from "@/lib/fetch";
import type { DeleteSgpUsuarioApiResponse } from "@/interfaces/sgp-usuario-projeto";

export type { DeleteSgpUsuarioApiResponse };

/**
 * Remove vínculo de usuário autorizado do projeto SGP.
 * Fluxo: Service → API Route → API externa DELETE /sgp-usuarios/{sequencia}
 */
export async function deleteSgpUsuario(
  sequencia: number | string,
): Promise<DeleteSgpUsuarioApiResponse> {
  const url = new URL(
    `/api/sgp-usuarios/${encodeURIComponent(String(sequencia))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "DELETE" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao excluir usuário autorizado",
    );
  }

  return await response.json();
}
