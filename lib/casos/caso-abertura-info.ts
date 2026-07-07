import { formatDatePt } from "@/components/cadastros/format-display";
import type { CasoItem } from "@/interfaces/projeto-memoria";

export interface CasoAberturaInfo {
  usuario: string;
  data: string;
  diasNoBacklog: number;
}

export function getCasoAberturaInfo(
  caso?: CasoItem,
): CasoAberturaInfo | undefined {
  if (!caso) return undefined;

  return {
    usuario: caso.usuarios?.abertura?.nome?.trim() || "—",
    data: formatDatePt(caso.datas?.abertura),
    diasNoBacklog: caso.dias_no_backlog ?? 0,
  };
}
