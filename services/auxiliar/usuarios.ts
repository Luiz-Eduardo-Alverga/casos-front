import { fetchWithAuth } from "@/lib/fetch";

export interface Usuario {
  id: string;
  nome_suporte: string;
  setor: string;
  usuario_discord: string;
}

export async function getUsuarios(params?: {
  search?: string;
  somente_projetos?: boolean;
}): Promise<Usuario[]> {
  const somente_projetos = params?.somente_projetos ?? true;
  const url = new URL("/api/auxiliar/usuarios", window.location.origin);
  if (params?.search) url.searchParams.set("search", params.search);
  if (params?.somente_projetos !== undefined) {
    url.searchParams.set("somente_projetos", somente_projetos.toString());
  }

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar usuários",
    );
  }

  return await response.json();
}
