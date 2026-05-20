import { fetchWithAuth } from "@/lib/fetch";

/** Item retornado por GET /auxiliar/sgp-objetivos */
export interface SgpObjetivo {
  Registro: string;
  Perspectiva: string;
  Objetivo: string;
  Ordem: string;
  Responsavel: string;
  CulturaID: string;
}

export interface GetSgpObjetivosResponse {
  success: boolean;
  data: SgpObjetivo[];
  total: number;
}

export async function getSgpObjetivos(params?: {
  search?: string;
}): Promise<GetSgpObjetivosResponse> {
  const url = new URL("/api/auxiliar/sgp-objetivos", window.location.origin);
  if (params?.search) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar objetivos SGP",
    );
  }

  return await response.json();
}
