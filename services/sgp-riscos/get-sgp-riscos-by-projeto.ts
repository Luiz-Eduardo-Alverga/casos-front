import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type {
  SgpRiscosByProjetoApiResponse,
  SgpRiscosByProjetoResponse,
} from "@/interfaces/sgp-risco";

export type {
  SgpRiscoItem,
  SgpRiscoPagination,
  SgpRiscosByProjetoApiResponse,
  SgpRiscosByProjetoResponse,
} from "@/interfaces/sgp-risco";

export interface GetSgpRiscosByProjetoParams {
  projetoId: number | string;
  per_page?: number;
  cursor?: string | null;
}

function normalizeSgpRiscosResponse(
  raw: SgpRiscosByProjetoApiResponse,
  perPage: number,
): SgpRiscosByProjetoResponse {
  const next_cursor = raw.next_cursor ?? null;
  const prev_cursor = raw.prev_cursor ?? null;

  return {
    success: true,
    data: raw.data ?? [],
    pagination: {
      per_page: perPage,
      next_cursor,
      prev_cursor,
      has_more: next_cursor != null && next_cursor !== "",
    },
  };
}

/**
 * Lista riscos de um projeto SGP.
 * Fluxo: Service → API Route → API externa GET /sgp-riscos/projeto/{sgp_cadastro_id}
 */
export async function getSgpRiscosByProjeto(
  params: GetSgpRiscosByProjetoParams,
): Promise<SgpRiscosByProjetoResponse> {
  const { projetoId, per_page = 15, cursor } = params;
  const url = new URL(
    `/api/sgp-riscos/projeto/${encodeURIComponent(String(projetoId))}`,
    window.location.origin,
  );

  url.searchParams.set("per_page", String(per_page));
  if (cursor != null && cursor !== "") {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao buscar riscos do projeto";
    throw new HttpError(response.status, message);
  }

  const raw = (await response.json()) as SgpRiscosByProjetoApiResponse;
  return normalizeSgpRiscosResponse(raw, per_page);
}
