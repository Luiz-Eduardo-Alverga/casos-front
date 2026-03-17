import { fetchWithAuth } from "@/lib/fetch";

export interface MarcarMensagemLidaResponse {
  success: boolean;
  message: string;
}

export async function marcarMensagemComoLida(
  id: number | string
): Promise<MarcarMensagemLidaResponse> {
  const url = `${window.location.origin}/api/mensagens/${encodeURIComponent(String(id))}/lido`;

  const response = await fetchWithAuth(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.message || error?.error || "Erro ao marcar mensagem como lida"
    );
  }

  return await response.json();
}
