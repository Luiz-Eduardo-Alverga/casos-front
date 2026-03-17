import { fetchWithAuth } from "@/lib/fetch";

export interface CreateAnotacaoRequest {
  registro: number;
  anotacoes: string;
}

export interface AnotacaoItem {
  sequencia: number;
  registro: number;
  data_anotacao: string;
  anotacoes: string;
  usuario: string;
}

export interface CreateAnotacaoResponse {
  message: string;
  data: AnotacaoItem;
}

/**
 * Cria uma anotação em um caso.
 * POST /api/projeto-casos-anotacoes → API externa POST /projeto-casos-anotacoes
 */
export async function createAnotacao(
  data: CreateAnotacaoRequest
): Promise<CreateAnotacaoResponse> {
  const response = await fetchWithAuth(
    `${window.location.origin}/api/projeto-casos-anotacoes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao criar anotação"
    );
  }

  return await response.json();
}
