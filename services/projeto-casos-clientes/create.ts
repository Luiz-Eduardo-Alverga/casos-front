import { fetchWithAuth } from "@/lib/fetch";

export interface CreateClienteCasoRequest {
  registro: number;
  cliente: number;
  incidente: number;
}

export interface ClienteCasoItem {
  sequencia: number;
  registro: number;
  data_solicitacao: string;
  cliente: number;
  incidente: number;
  cliente_nome: string | null;
}

export interface CreateClienteCasoResponse {
  message: string;
  data: ClienteCasoItem;
}

/**
 * Vincula um cliente a um caso.
 * POST /api/projeto-casos-clientes → API externa POST /projeto-casos-clientes
 */
export async function createClienteCaso(
  data: CreateClienteCasoRequest
): Promise<CreateClienteCasoResponse> {
  const response = await fetchWithAuth(
    `${window.location.origin}/api/projeto-casos-clientes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error || error?.message || "Erro ao vincular cliente ao caso"
    );
  }

  return await response.json();
}
