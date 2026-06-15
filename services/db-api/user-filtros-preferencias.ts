import { fetchWithAuth } from "@/lib/fetch";
import type { FiltroResumoItem } from "@/lib/types/filtros-resumo";

interface ApiDbResponse<T> {
  data?: T;
  error?: { message?: string };
}

async function parseSuccessData<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => ({}))) as ApiDbResponse<T>;
  if (!response.ok) {
    const msg =
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${response.status}`;
    throw new Error(msg);
  }
  if (json.data === undefined) {
    throw new Error("Resposta inválida da API");
  }
  return json.data;
}

export async function getUserFiltrosPreferenciasClient(): Promise<FiltroResumoItem[]> {
  const res = await fetchWithAuth("/api/db/user-prefs/casos-filtros");
  return parseSuccessData<FiltroResumoItem[]>(res);
}

export async function upsertUserFiltrosPreferenciasClient(
  filtros: FiltroResumoItem[],
): Promise<void> {
  const res = await fetchWithAuth("/api/db/user-prefs/casos-filtros", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtros),
  });
  await parseSuccessData<unknown>(res);
}
