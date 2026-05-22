import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type { SgpCronogramaByProjetoResponse } from "@/interfaces/sgp-cronograma";

export type {
  SgpCronogramaItem,
  SgpCronogramaPagination,
  SgpCronogramaByProjetoResponse,
} from "@/interfaces/sgp-cronograma";

export interface GetSgpCronogramaByProjetoParams {
  projetoId: number | string;
  per_page?: number;
  cursor?: string | null;
}

/**
 * Lista tarefas de cronograma de um projeto SGP.
 * Fluxo: Service → API Route → API externa GET /sgp-cronograma/projeto/{registro}
 */
export async function getSgpCronogramaByProjeto(
  params: GetSgpCronogramaByProjetoParams,
): Promise<SgpCronogramaByProjetoResponse> {
  const { projetoId, per_page, cursor } = params;
  const url = new URL(
    `/api/sgp-cronograma/projeto/${encodeURIComponent(String(projetoId))}`,
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
      "Erro ao buscar cronograma do projeto";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
