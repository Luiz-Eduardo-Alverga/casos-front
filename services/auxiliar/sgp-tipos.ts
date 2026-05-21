import { fetchWithAuth } from "@/lib/fetch";

/** Item retornado por GET /auxiliar/sgp-tipos */
export interface SgpTipo {
  Registro: string;
  Nomes: string;
  Tipo: string;
  CronogramaOrdem: string;
  cr_data_inicial_exp: string | null;
  cr_data_final_exp: string | null;
  cr_padrao_ped: string;
}

export interface GetSgpTiposResponse {
  success: boolean;
  data: SgpTipo[];
  total: number;
}

export interface GetSgpTiposParams {
  /** Filtra por `Tipo` no endpoint externo GET /auxiliar/sgp-tipos */
  tipo?: string;
}

/**
 * Lista tipos SGP (auxiliar).
 * Fluxo: Service → API Route → API externa GET /auxiliar/sgp-tipos
 */
export async function getSgpTipos(
  params?: GetSgpTiposParams,
): Promise<GetSgpTiposResponse> {
  const url = new URL("/api/auxiliar/sgp-tipos", window.location.origin);
  const tipo = params?.tipo?.trim();
  if (tipo) url.searchParams.set("tipo", tipo);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar tipos SGP",
    );
  }

  return await response.json();
}
