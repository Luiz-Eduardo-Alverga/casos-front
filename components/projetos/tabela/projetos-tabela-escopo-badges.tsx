"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProjetosTabelaEscopoBadgesProps {
  showNaoPlanejado: boolean;
  showViavel: boolean;
  showDuplicado: boolean;
  className?: string;
}

export function ProjetosTabelaEscopoBadges({
  showNaoPlanejado,
  showViavel,
  showDuplicado,
  className,
}: ProjetosTabelaEscopoBadgesProps) {
  if (!showNaoPlanejado && !showViavel && !showDuplicado) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex shrink-0 flex-wrap items-center justify-end gap-1",
        className,
      )}
    >
      {showNaoPlanejado ? (
        <Badge className="h-[17px] rounded px-1.5 text-[8px] font-semibold border-transparent bg-sidebar-bg text-sidebar-text hover:bg-sidebar-bg">
          Não Planejado
        </Badge>
      ) : null}
      {showViavel ? (
        <Badge className="h-[17px] rounded px-1.5 text-[8px] font-semibold border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100">
          Viável
        </Badge>
      ) : null}
      {showDuplicado ? (
        <Badge className="h-[17px] rounded px-1.5 text-[8px] font-semibold border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100">
          Duplicado
        </Badge>
      ) : null}
    </div>
  );
}
