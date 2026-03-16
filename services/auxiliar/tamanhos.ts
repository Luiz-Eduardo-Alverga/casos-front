import { getToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/fetch";

export interface TamanhoItem {
  id: string;
  tamanho: string;
  tempo: string;
  descricao: string;
}

export async function getTamanhos(): Promise<TamanhoItem[]> {
  const token = getToken();

  const url = new URL("/api/auxiliar/tamanhos", window.location.origin);

  const response = await fetchWithAuth(url.toString(), {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar tamanhos"
    );
  }

  return await response.json();
}
