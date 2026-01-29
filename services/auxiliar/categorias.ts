import { getToken } from "@/lib/auth";

export interface Categoria {
  id: string;
  tipo_categoria: string;
}

export async function getCategorias(params?: {
  search?: string;
}): Promise<Categoria[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/categorias", window.location.origin);
  
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
    throw new Error(error?.message || error?.error || "Erro ao buscar categorias");
  }

  return await response.json();
}
