import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface AgendaDevItem {
  ordem: string;
  produto: string;
  abertos: string;
  corrigidos: string;
  retornos: string;
  resolvidos: string;
  id_colaborador: string;
  Cronograma_id: string;
  versao: string;
  selecionado: string;
  id_produto: string;
  NomeSuporte: string;
  ProdutoVersao: string;
  abiertos_estimado: string;
  tem_caso_iniciado: string;
}

export async function getAgendaDev(params: {
  id_colaborador: string;
}): Promise<AgendaDevItem[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/agenda-dev", window.location.origin);
  url.searchParams.set("id_colaborador", params.id_colaborador);

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar agenda dev");
  }

  return await response.json();
}
