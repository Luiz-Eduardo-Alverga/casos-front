import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface StatusItem {
  Registro: number;
  tipo: string;
  descricao: string | null;
  desativado: string;
  resolucao_equivalente: string;
  estado_equivalente: string;
  permissao_adm: string;
  permissao_funcoes_liberadas: string;
  tipo_status: string;
  report_status_equivalente: string;
  report_definir_conclusao: string;
}

export async function getStatus(): Promise<StatusItem[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/status", window.location.origin);

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar status");
  }

  return await response.json();
}
