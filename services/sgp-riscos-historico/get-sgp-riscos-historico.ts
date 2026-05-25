import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type {
  SgpRiscosHistoricoByRiscoApiResponse,
  SgpRiscosHistoricoByRiscoResponse,
} from "@/interfaces/sgp-risco-historico";

export type {
  SgpRiscoHistoricoItem,
  SgpRiscoHistoricoPagination,
  SgpRiscosHistoricoByRiscoApiResponse,
  SgpRiscosHistoricoByRiscoResponse,
} from "@/interfaces/sgp-risco-historico";

export interface GetSgpRiscosHistoricoParams {
  /** Sequência do risco (SgpRiscoItem.sequencia) */
  id_seq: number | string;
  per_page?: number;
  cursor?: string | null;
}

function normalizeSgpRiscosHistoricoResponse(
  raw: SgpRiscosHistoricoByRiscoApiResponse,
  perPage: number,
): SgpRiscosHistoricoByRiscoResponse {
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
 * Lista histórico (ocorrências) de um risco SGP.
 * Fluxo: Service → API Route → API externa GET /sgp-riscos-historico?id_seq=...
 */
export async function getSgpRiscosHistorico(
  params: GetSgpRiscosHistoricoParams,
): Promise<SgpRiscosHistoricoByRiscoResponse> {
  const { id_seq, per_page = 15, cursor } = params;
  const url = new URL("/api/sgp-riscos-historico", window.location.origin);

  url.searchParams.set("id_seq", String(id_seq));
  url.searchParams.set("per_page", String(per_page));
  if (cursor != null && cursor !== "") {
    url.searchParams.set("cursor", cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message ||
      error?.error ||
      "Erro ao buscar histórico de riscos";
    throw new HttpError(response.status, message);
  }

  const raw = (await response.json()) as SgpRiscosHistoricoByRiscoApiResponse;
  return normalizeSgpRiscosHistoricoResponse(raw, per_page);
}
