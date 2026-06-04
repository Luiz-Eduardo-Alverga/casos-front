import type { Produto } from "@/services/auxiliar/produtos";

/**
 * Resolve o ID do PO/QA (AtribuidoPara) conforme categoria do report:
 * BUG → responsavel_bugs_suporte_id, MELHORIA → responsavel_melhorias_suporte_id.
 */
export function resolveReportPoQaAtribuidoPara(
  produto: Produto | undefined,
  categoriaTipoLabel: string | undefined | null,
): number | null {
  const categoriaTipo = String(categoriaTipoLabel ?? "").trim().toUpperCase();
  if (!produto || !categoriaTipo) return null;

  let responsavelId: string | null = null;
  if (categoriaTipo === "BUG") {
    responsavelId = produto.responsavel_bugs_suporte_id;
  } else if (categoriaTipo === "MELHORIA") {
    responsavelId = produto.responsavel_melhorias_suporte_id;
  }

  if (!responsavelId) return null;

  const parsed = Number(responsavelId);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
