"use client";

import type { KeyboardEvent } from "react";
import { Clock } from "lucide-react";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import { cn } from "@/lib/utils";
import type { VisaoCasosEmProducaoItem } from "@/services/sprint/get-visao-casos-em-producao";

interface CasosEmProducaoRowProps {
  item: VisaoCasosEmProducaoItem;
}

export function CasosEmProducaoRow({ item }: CasosEmProducaoRowProps) {
  const handleOpenCaso = () => {
    window.open(
      buildCasoEditHref(item.id_caso, "case", { standalone: true }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenCaso();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleOpenCaso}
      onKeyDown={handleKeyDown}
      className={cn(
        "px-4 py-3 flex items-start gap-3 border-b border-border-divider last:border-b-0",
        "cursor-pointer hover:bg-muted/40 transition-colors",
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 text-[11px] text-text-secondary flex-wrap">
          <span className="font-semibold text-text-primary">#{item.id_caso}</span>
          <span>Proj: {item.projeto}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {item.iniciado_em}
          </span>
        </div>
        <div className="text-xs font-medium text-text-primary leading-snug">
          {item.descricao_resumo}
        </div>
        <div className="text-[11px] text-text-secondary mt-1">
          {item.produto} · Dev:{" "}
          <span className="text-text-primary">{item.colaborador}</span>
        </div>
      </div>
    </div>
  );
}
