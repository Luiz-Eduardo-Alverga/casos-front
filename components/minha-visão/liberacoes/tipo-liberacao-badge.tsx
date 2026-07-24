"use client";

import { cn } from "@/lib/utils";
import type { TipoLiberacao } from "@/services/sprint/get-visao-proximas-liberacoes";

interface TipoLiberacaoBadgeProps {
  tipo: TipoLiberacao;
}

export function TipoLiberacaoBadge({ tipo }: TipoLiberacaoBadgeProps) {
  const isHotfix = tipo === "Hotfix";
  return (
    <span
      className={cn(
        "text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0",
        isHotfix ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700",
      )}
    >
      {tipo}
    </span>
  );
}
