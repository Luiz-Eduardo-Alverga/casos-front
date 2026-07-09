export type NaoPlanejadoFiltro = "todos" | "planejado" | "nao_planejado";

export const NAO_PLANEJADO_FILTRO_OPTIONS = [
  { value: "todos" as const, label: "Todos" },
  { value: "planejado" as const, label: "Planejado" },
  { value: "nao_planejado" as const, label: "Não planejados" },
] as const;

export function naoPlanejadoFiltroToApiParam(
  filtro: NaoPlanejadoFiltro,
): boolean | undefined {
  if (filtro === "todos") return undefined;
  if (filtro === "planejado") return false;
  return true;
}
