import { HttpError } from "@/lib/http-error";
import { fetchWithAuth } from "@/lib/fetch";
import type {
  SgpCadastroData,
  SgpCadastroResponse,
} from "@/interfaces/sgp-cadastro";

export type {
  SgpCadastroConfiabilidade,
  SgpCadastroData,
  SgpCadastroEficiencia,
  SgpCadastroFuncionalidade,
  SgpCadastroManutenbilidade,
  SgpCadastroResponse,
  SgpCadastroUsabilidade,
  SgpCadastroViabilidadeDetalhe,
} from "@/interfaces/sgp-cadastro";

/**
 * Busca um cadastro SGP pelo registro (ID).
 * Fluxo: Service → API Route → API externa GET /sgp-cadastros/{id}
 */
export async function getSgpCadastroById(
  id: number | string,
): Promise<SgpCadastroResponse> {
  const url = new URL(
    `/api/sgp-cadastros/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message =
      error?.message || error?.error || "Erro ao buscar cadastro SGP";
    throw new HttpError(response.status, message);
  }

  return await response.json();
}
