import type { AuxiliarImportancia } from "@/services/auxiliar/importancias";

export interface ResolvedReportImportancia {
  /** Campo `nivel` da API auxiliar/importancias (report_prioridade). */
  nivel: number;
  slaHours: number;
}

function findReportImportanciaRow(
  items: readonly AuxiliarImportancia[],
  importanciaEquivalente: string,
  categoriaTipo?: string | null,
): AuxiliarImportancia | null {
  const eq = String(importanciaEquivalente ?? "").trim();
  if (!eq) return null;

  const cat = String(categoriaTipo ?? "")
    .trim()
    .toUpperCase();

  const matches = items.filter(
    (item) =>
      item.tipo === "REPORT" &&
      String(item.report_importancia_equivalente ?? "").trim() === eq,
  );

  if (!matches.length) return null;

  const row = cat
    ? matches.find((item) =>
        String(item.report_categoria ?? "")
          .split(";")
          .map((part) => part.trim().toUpperCase())
          .includes(cat),
      )
    : undefined;

  return row ?? matches[0];
}

/**
 * Resolve `nivel` (report_prioridade) e horas de SLA para data limite.
 */
export function resolveReportImportancia(
  items: readonly AuxiliarImportancia[] | undefined,
  importanciaEquivalente: string,
  categoriaTipo?: string | null,
): ResolvedReportImportancia | null {
  if (!items?.length) return null;

  const selected = findReportImportanciaRow(
    items,
    importanciaEquivalente,
    categoriaTipo,
  );
  if (!selected) return null;

  const slaRaw = String(selected.sla ?? "").trim();
  const slaHours = Number(slaRaw.replace(",", "."));
  if (!slaRaw || !Number.isFinite(slaHours)) return null;

  const nivel = Number(String(selected.nivel ?? "").trim());
  if (!Number.isFinite(nivel)) return null;

  return {
    nivel,
    slaHours,
  };
}
