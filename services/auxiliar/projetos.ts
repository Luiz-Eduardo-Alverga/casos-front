import { getToken, getUser } from "@/lib/auth";

export interface Projeto {
  id: string;
  nome_projeto: string;
  data_inicial: string;
  data_final: string;
  setor: string;
}

export async function getProjetos(params?: {
  usuario_id?: number;
  setor_projeto?: string;
  numero_projeto?: number;
  search?: string;
}): Promise<Projeto[]> {
  const token = getToken();
  const user = getUser();

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  const url = new URL("/api/auxiliar/projetos", window.location.origin);
  
  // usuario_id é obrigatório - usa do localStorage
  url.searchParams.set("usuario_id", String(params?.usuario_id ?? user.id));
  
  // setor_projeto opcional - usa o fornecido (do produto selecionado)
  if (params?.setor_projeto) {
    url.searchParams.set("setor_projeto", params.setor_projeto);
  }
  
  if (params?.numero_projeto) {
    url.searchParams.set("numero_projeto", String(params.numero_projeto));
  }
  
  if (params?.search) {
    url.searchParams.set("search", params.search);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Erro ao buscar projetos");
  }

  return await response.json();
}
