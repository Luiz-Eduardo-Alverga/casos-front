import { fetchWithAuth } from "@/lib/fetch";

export interface TransferirProximoProjetoRequest {
  cronograma_origem: number;
  cronograma_destino: number;
  registros?: number[];
}

export interface TransferirProximoProjetoResponse {
  transferidos: unknown[];
  duplicados: unknown[];
  falhas: unknown[];
}

/**
 * Carryover: move ou duplica casos elegíveis para o próximo projeto.
 * POST /api/projeto-casos/transferir-proximo-projeto
 * → API externa POST /projeto-casos/transferir-proximo-projeto
 */
export async function transferirProximoProjeto(
  body: TransferirProximoProjetoRequest,
): Promise<TransferirProximoProjetoResponse> {
  const url = new URL(
    "/api/projeto-casos/transferir-proximo-projeto",
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error ||
        error?.message ||
        "Erro ao transferir casos para o próximo projeto",
    );
  }

  return await response.json();
}
