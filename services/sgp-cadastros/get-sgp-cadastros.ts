import { fetchWithAuth } from "@/lib/fetch";
import type { SgpCadastrosListResponse } from "@/interfaces/sgp-cadastro";

export type {
  SgpCadastroPagination,
  SgpCadastrosListResponse,
} from "@/interfaces/sgp-cadastro";

export interface GetSgpCadastrosParams {
  setor?: string;
  registro?: number | string;
  objetivo_id?: number | string;
  /** Parte do nome (`NomeProjeto`). */
  nome_projeto?: string;
  /** `ABERTO` ou `FECHADO` (`Status`). */
  status?: string;
  /** `AAAA-MM-DD`, 1º dia do mês filtrado. */
  data_inicio?: string;
  /** `AAAA-MM-DD`, último dia do mês filtrado. */
  data_fim?: string;
  per_page?: number;
  cursor?: string | null;
}

/**
 * Lista cadastros SGP com filtros opcionais.
 * Fluxo: Service → API Route → API externa GET /sgp-cadastros
 */
export async function getSgpCadastros(
  params: GetSgpCadastrosParams = {},
): Promise<SgpCadastrosListResponse> {
  const url = new URL("/api/sgp-cadastros", window.location.origin);

  if (params.setor) url.searchParams.set("Setor", params.setor);
  if (params.registro != null && params.registro !== "") {
    url.searchParams.set("Registro", String(params.registro));
  }
  if (params.objetivo_id != null && params.objetivo_id !== "") {
    url.searchParams.set("objetivo_id", String(params.objetivo_id));
  }
  if (params.nome_projeto) url.searchParams.set("NomeProjeto", params.nome_projeto);
  if (params.status) url.searchParams.set("Status", params.status);
  if (params.data_inicio) url.searchParams.set("data_inicio", params.data_inicio);
  if (params.data_fim) url.searchParams.set("data_fim", params.data_fim);
  if (params.per_page != null) {
    url.searchParams.set("per_page", String(params.per_page));
  }
  if (params.cursor != null) {
    url.searchParams.set("cursor", params.cursor);
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar cadastros SGP",
    );
  }

  return await response.json();
}
