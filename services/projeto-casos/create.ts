import { getToken, getUser } from "@/lib/auth";

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
  QaId: number;
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

export async function createCaso(data: CreateCasoRequest): Promise<CreateCasoResponse> {
  const token = getToken();
  const user = getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const response = await fetch("/api/projeto-casos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || error?.message || "Erro ao criar caso");
  }

  return await response.json();
}
