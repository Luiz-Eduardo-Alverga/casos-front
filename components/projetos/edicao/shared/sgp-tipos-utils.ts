import type { SgpTipo } from "@/services/auxiliar/sgp-tipos";

export interface SgpTipoMeta {
  label: string;
  cronogramaOrdem: string | null;
}

/** Mapa `Registro` → label (`Nomes`) para badges e exibição. */
export function buildSgpTiposMap(tipos: SgpTipo[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const tipo of tipos) {
    const id = Number(tipo.Registro);
    if (!Number.isFinite(id)) continue;
    const label = tipo.Nomes?.trim();
    if (label) map.set(id, label);
  }
  return map;
}

/** Mapa `Registro` → metadados (label + ordem no cronograma). */
export function buildSgpTiposMetaMap(tipos: SgpTipo[]): Map<number, SgpTipoMeta> {
  const map = new Map<number, SgpTipoMeta>();
  for (const tipo of tipos) {
    const id = Number(tipo.Registro);
    if (!Number.isFinite(id)) continue;
    const label = tipo.Nomes?.trim() || "";
    const ordem = tipo.CronogramaOrdem?.trim() || null;
    map.set(id, { label, cronogramaOrdem: ordem });
  }
  return map;
}

export function resolveTipoLabel(
  id: number,
  tiposMap: Map<number, string>,
): string {
  const label = tiposMap.get(id)?.trim();
  return label || `Tipo ${id}`;
}
