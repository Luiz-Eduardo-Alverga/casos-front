import { getToken } from "@/lib/auth";

export interface Usuario {
  id: string;
  nome_suporte: string;
  setor: string;
  usuario_discord: string;
}

export async function getUsuarios(params?: {
  search?: string;
}): Promise<Usuario[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/usuarios", window.location.origin);
  
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
    throw new Error(error?.message || error?.error || "Erro ao buscar usuários");
  }

  return await response.json();
}
