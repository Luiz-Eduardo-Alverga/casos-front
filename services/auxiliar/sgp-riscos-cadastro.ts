import { fetchWithAuth } from "@/lib/fetch";

/** Item retornado por GET /auxiliar/sgp-riscos-cadastro */
export interface SgpRiscoCadastro {
  id: string;
  nome_risco: string;
}

export interface GetSgpRiscosCadastroResponse {
  success: boolean;
  data: SgpRiscoCadastro[];
  total: number;
}

export interface GetSgpRiscosCadastroParams {
  search?: string;
}

/**
 * Lista riscos cadastrados (catálogo auxiliar).
 * Fluxo: Service → API Route → API externa GET /auxiliar/sgp-riscos-cadastro
 */
export async function getSgpRiscosCadastro(
  params?: GetSgpRiscosCadastroParams,
): Promise<GetSgpRiscosCadastroResponse> {
  const url = new URL(
    "/api/auxiliar/sgp-riscos-cadastro",
    window.location.origin,
  );
  const search = params?.search?.trim();
  if (search) url.searchParams.set("search", search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message ||
        error?.error ||
        "Erro ao buscar riscos cadastrados",
    );
  }

  return await response.json();
}
