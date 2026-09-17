export type EstimadoFiltro = "todos" | "estimado" | "nao_estimado";

export const ESTIMADO_FILTRO_OPTIONS = [
  { value: "todos" as const, label: "Todos" },
  { value: "estimado" as const, label: "Estimado" },
  { value: "nao_estimado" as const, label: "Não estimado" },
] as const;

export function estimadoFiltroToApiParam(
  filtro: EstimadoFiltro,
): boolean | undefined {
  if (filtro === "todos") return undefined;
  if (filtro === "estimado") return true;
  return false;
}
