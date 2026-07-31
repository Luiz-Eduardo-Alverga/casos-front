import { fetchWithAuth } from "@/lib/fetch";
import type {
  GetLiberacaoItensParams,
  LiberacaoItensResponse,
} from "@/interfaces/liberacao";

export type {
  GetLiberacaoItensParams,
  LiberacaoCasoItem,
  LiberacaoItensFiltro,
  LiberacaoItensResponse,
} from "@/interfaces/liberacao";

/**
 * Lista os casos (itens) vinculados a um registro de liberação.
 * Fluxo: Service → API Route → API externa GET /sprint/liberacoes/{registro}/itens
 */
export async function getLiberacaoItens(
  registro: number | string,
  params: GetLiberacaoItensParams = {},
): Promise<LiberacaoItensResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}/itens`,
    window.location.origin,
  );

  const liberacao = params.liberacao ?? "todos";
  url.searchParams.set("liberacao", liberacao);

  if (params.resumo != null && params.resumo !== "") {
    url.searchParams.set("resumo", params.resumo);
  }
  if (params.limit != null) {
    url.searchParams.set("limit", String(params.limit));
  }
  if (params.offset != null) {
    url.searchParams.set("offset", String(params.offset));
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar itens da liberação",
    );
  }

  return (await response.json()) as LiberacaoItensResponse;
}
