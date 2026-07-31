import { fetchWithAuth } from "@/lib/fetch";
import type {
  GetLiberacoesParams,
  LiberacoesApiResponse,
  LiberacoesResponse,
} from "@/interfaces/liberacao";

export type {
  GetLiberacoesParams,
  LiberacaoItem,
  LiberacaoPagination,
  LiberacaoVersao,
  LiberacoesApiResponse,
  LiberacoesResponse,
} from "@/interfaces/liberacao";

function normalizeLiberacoesResponse(
  raw: LiberacoesApiResponse,
  perPage: number,
): LiberacoesResponse {
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
 * Lista registros de liberação da sprint.
 * Fluxo: Service → API Route → API externa GET /sprint/liberacoes
 */
export async function getLiberacoes(
  params: GetLiberacoesParams = {},
): Promise<LiberacoesResponse> {
  const per_page = params.per_page ?? 15;
  const url = new URL("/api/sprint/liberacoes", window.location.origin);

  const stringParams: Array<[string, string | undefined | null]> = [
    [
      "produto_id",
      params.produto_id != null ? String(params.produto_id) : undefined,
    ],
    ["status", params.status],
    ["tipo_liberacao", params.tipo_liberacao],
    ["versao", params.versao],
    ["sort_by", params.sort_by],
    ["sort_order", params.sort_order],
    ["per_page", String(per_page)],
  ];

  for (const [key, value] of stringParams) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  if (params.cursor != null && params.cursor !== "") {
    url.searchParams.set("cursor", params.cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar liberações",
    );
  }

  const raw = (await response.json()) as LiberacoesApiResponse;
  return normalizeLiberacoesResponse(raw, per_page);
}
