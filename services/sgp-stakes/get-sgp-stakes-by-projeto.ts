import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type { SgpStakesByProjetoResponse } from "@/interfaces/sgp-stake";

export type {
  SgpStakeItem,
  SgpStakePagination,
  SgpStakesByProjetoResponse,
} from "@/interfaces/sgp-stake";

export interface GetSgpStakesByProjetoParams {
  projetoId: number | string;
  per_page?: number;
  cursor?: string | null;
}

/**
 * Lista stakes de um projeto SGP.
 * Fluxo: Service → API Route → API externa GET /sgp-stakes/projeto/{registro}
 */
export async function getSgpStakesByProjeto(
  params: GetSgpStakesByProjetoParams,
): Promise<SgpStakesByProjetoResponse> {
  const { projetoId, per_page, cursor } = params;
  const url = new URL(
    `/api/sgp-stakes/projeto/${encodeURIComponent(String(projetoId))}`,
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
      error?.message || error?.error || "Erro ao buscar stakes do projeto";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
