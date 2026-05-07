import { fetchWithAuth } from "@/lib/fetch";

export interface Produto {
  id: number;
  nome_projeto: string;
  setor: string;
  data_projeto: string;
  po: string;
  scrum_master: string;
  comercial_necessidades_id: number | null;
  responsavel_suporte: string;
  responsavel_parametrizacao: string;
  desativado: string;
  mostrar_consulta: string;
  mostrar_teste: string;
  vinculado_a: string;
  faq_exibir: string;
  informacoes_tecnicas: string | null;
  calcular_burn_down: string;
  responsavel_bugs_suporte_id: string | null;
  responsavel_melhorias_suporte_id: string | null;
}

export async function getProdutos(params?: { search?: string }): Promise<Produto[]> {
  const url = new URL("/api/auxiliar/produtos", window.location.origin);
  if (params?.search) url.searchParams.set("search", params.search);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar produtos");
  }

  return await response.json();
}

