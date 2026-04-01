import { fetchWithAuth } from "@/lib/fetch";

/** Converte totais string da API em número para exibição (ex.: badge). */
export function parseAgendaDevCount(value: string | undefined): number {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

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
  const url = new URL("/api/auxiliar/agenda-dev", window.location.origin);
  url.searchParams.set("id_colaborador", params.id_colaborador);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar agenda dev");
  }

  return await response.json();
}
