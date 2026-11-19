import { fetchWithAuth } from "@/lib/fetch";

export type AutorizarConectorAcao = "permitir" | "cancelar";

export interface AutorizarConectorInput {
  /** Parâmetros do pedido OAuth recebidos na query de `/oauth/autorizar`. */
  params: Record<string, string>;
  acao: AutorizarConectorAcao;
  senha?: string;
}

export class AutorizarConectorError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AutorizarConectorError";
  }
}

/** "Permitir acesso" / "Cancelar": devolve a URL de volta ao Claude. */
export async function autorizarConector(
  input: AutorizarConectorInput,
): Promise<{ redirectTo: string }> {
  const res = await fetchWithAuth("/api/oauth/autorizar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input.params,
      acao: input.acao,
      ...(input.senha ? { senha: input.senha } : {}),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    data?: { redirectTo?: string };
    error?: { message?: string };
  };
  if (!res.ok || !json.data?.redirectTo) {
    throw new AutorizarConectorError(
      json.error?.message || "Não foi possível conectar",
      res.status,
    );
  }
  return { redirectTo: json.data.redirectTo };
}
