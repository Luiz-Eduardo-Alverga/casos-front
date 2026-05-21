import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type { SgpUsuariosByProjetoResponse } from "@/interfaces/sgp-usuario-projeto";

export type {
  SgpUsuarioProjetoItem,
  SgpUsuarioProjetoPagination,
  SgpUsuariosByProjetoResponse,
} from "@/interfaces/sgp-usuario-projeto";

export interface GetSgpUsuariosByProjetoParams {
  projetoId: number | string;
  per_page?: number;
  cursor?: string | null;
}

/**
 * Lista usuários autorizados de um projeto SGP (com nome e setor enriquecidos no servidor).
 * Fluxo: Service → API Route → API externa GET /sgp-usuarios/projeto/{registro} + auxiliar/usuarios
 */
export async function getSgpUsuariosByProjeto(
  params: GetSgpUsuariosByProjetoParams,
): Promise<SgpUsuariosByProjetoResponse> {
  const { projetoId, per_page, cursor } = params;
  const url = new URL(
    `/api/sgp-usuarios/projeto/${encodeURIComponent(String(projetoId))}`,
    window.location.origin,
  );

  if (per_page != null) {
    url.searchParams.set("per_page", String(per_page));
  }
  if (cursor != null) {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message ||
      error?.error ||
      "Erro ao buscar usuários autorizados do projeto";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
