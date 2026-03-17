import { getUser } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface CreateCasoRequest {
  Projeto: number;
  VersaoProduto: string;
  Prioridade: number;
  Cronograma_id: number;
  Modulo: string;
  Id_Origem: string;
  Categoria: number;
  Relator: number;
  AtribuidoPara: number;
  atribuido_qa: number;
  DescricaoResumo: string;
  DescricaoCompleta: string;
  InformacoesAdicionais?: string;
  status: string;
  Id_Usuario_AberturaCaso: string;
}

export interface CreateCasoResponse {
  success: boolean;
  message: string;
  data: {
    registro: number;
    [key: string]: any;
  };
}

export async function createCaso(
  data: CreateCasoRequest,
): Promise<CreateCasoResponse> {
  const user = getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const response = await fetchWithAuth("/api/projeto-casos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || error?.message || "Erro ao criar caso");
  }

  return await response.json();
}
