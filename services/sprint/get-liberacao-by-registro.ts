import { fetchWithAuth } from "@/lib/fetch";
import { readApiErrorMessage } from "@/lib/read-api-error-message";
import { HttpError } from "@/lib/http-error";
import type { LiberacaoByRegistroResponse } from "@/interfaces/liberacao";

export type {
  LiberacaoByRegistroResponse,
  LiberacaoItem,
  LiberacaoVersao,
} from "@/interfaces/liberacao";

/**
 * Busca um registro de liberação pelo número do registro.
 * Fluxo: Service → API Route → API externa GET /sprint/liberacoes/{registro}
 */
export async function getLiberacaoByRegistro(
  registro: number | string,
): Promise<LiberacaoByRegistroResponse> {
  const url = new URL(
    `/api/sprint/liberacoes/${encodeURIComponent(String(registro))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = readApiErrorMessage(error, "Erro ao buscar liberação");
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
