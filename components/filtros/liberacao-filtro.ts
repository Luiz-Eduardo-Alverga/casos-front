export type LiberacaoFiltro = "todos" | "com_liberacao" | "sem_liberacao";

export const LIBERACAO_FILTRO_OPTIONS = [
  { value: "todos" as const, label: "Todos" },
  { value: "com_liberacao" as const, label: "Com liberação" },
  { value: "sem_liberacao" as const, label: "Sem liberação" },
] as const;

export function liberacaoFiltroToApiParam(
  filtro: LiberacaoFiltro,
): boolean | undefined {
  if (filtro === "todos") return undefined;
  if (filtro === "com_liberacao") return true;
  return false;
}
