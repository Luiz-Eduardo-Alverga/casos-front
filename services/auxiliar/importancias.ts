import { fetchWithAuth } from "@/lib/fetch";

export interface AuxiliarImportancia {
  Registro: number;
  TipoPrioridade: string | null;
  nivel: string;
  descricao: string;
  sla: string;
  tipo: string;
  report_categoria: string;
  report_importancia_equivalente: string;
}

export async function getImportancias(params: {
  tipo: string;
}): Promise<AuxiliarImportancia[]> {
  const url = new URL("/api/auxiliar/importancias", window.location.origin);
  url.searchParams.set("tipo", params.tipo);

  const response = await fetchWithAuth(url.toString(), { method: "GET" });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao buscar importâncias",
    );
  }

  return await response.json();
}
