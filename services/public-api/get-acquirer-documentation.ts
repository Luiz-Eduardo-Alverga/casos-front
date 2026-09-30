export type PublicAcquirerDocumentation = {
  title: string;
  summary: string | null;
  contentMd: string;
};

/**
 * Documentação pública de Configuração da adquirente.
 * Sem autenticação: `/api/public/acquirers/[id]/documentacao`.
 * `null` quando não há documento publicado vinculado.
 */
export async function getPublicAcquirerDocumentation(
  opaqueAcquirerId: string,
): Promise<PublicAcquirerDocumentation | null> {
  const res = await fetch(
    `/api/public/acquirers/${encodeURIComponent(opaqueAcquirerId)}/documentacao`,
    { method: "GET" },
  );
  const json = (await res.json().catch(() => ({}))) as {
    data?: unknown;
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(
      typeof json?.error?.message === "string"
        ? json.error.message
        : `Erro ${res.status}`,
    );
  }
  if (json.data == null) return null;
  const data = json.data as Partial<PublicAcquirerDocumentation>;
  if (typeof data.title !== "string" || typeof data.contentMd !== "string") {
    throw new Error("Resposta inválida da API");
  }
  return {
    title: data.title,
    summary: typeof data.summary === "string" ? data.summary : null,
    contentMd: data.contentMd,
  };
}
