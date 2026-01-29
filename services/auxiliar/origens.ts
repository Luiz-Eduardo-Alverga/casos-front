import { getToken } from "@/lib/auth";

export interface Origem {
  id: string;
  nome: string;
}

export async function getOrigens(params?: {
  search?: string;
}): Promise<Origem[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/origens", window.location.origin);
  
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
    throw new Error(error?.message || error?.error || "Erro ao buscar origens");
  }

  return await response.json();
}
