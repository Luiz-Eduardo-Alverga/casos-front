import { fetchWithAuth } from "@/lib/fetch";

export type PainelIdeiaStatus = "SIM" | "NÃO";
export type PainelIdeiaConcluido = "Sim" | "Não";

export interface UpdatePainelIdeiaRequest {
  status: PainelIdeiaStatus;
  concluido: PainelIdeiaConcluido;
  justificativa: string;
  data_aprovado: string;
  avaliado_por: string;
}

export interface UpdatePainelIdeiaResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Atualiza a avaliação de uma ideia do painel.
 * Fluxo: Service → API Route → API externa PATCH /painel-ideias/{id}
 */
export async function updatePainelIdeia(
  id: number | string,
  data: UpdatePainelIdeiaRequest,
): Promise<UpdatePainelIdeiaResponse | null> {
  const url = new URL(
    `/api/painel-ideias/${encodeURIComponent(String(id))}`,
    window.location.origin,
  );

  const response = await fetchWithAuth(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao avaliar melhoria",
    );
  }

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as UpdatePainelIdeiaResponse;
  } catch {
    return null;
  }
}
