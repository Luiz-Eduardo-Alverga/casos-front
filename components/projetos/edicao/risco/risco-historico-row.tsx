"use client";

import { SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SgpRiscoHistoricoItem } from "@/interfaces/sgp-risco-historico";
import { formatRiscoHistoricoData } from "@/components/projetos/edicao/risco/utils";

export interface RiscoHistoricoRowProps {
  item: SgpRiscoHistoricoItem;
  onEditar?: (item: SgpRiscoHistoricoItem) => void;
  onExcluir?: (item: SgpRiscoHistoricoItem) => void;
}

export function RiscoHistoricoRow({
  item,
  onEditar,
  onExcluir,
}: RiscoHistoricoRowProps) {
  return (
    <div className="flex items-center gap-6 border-t border-border-divider px-5 py-3">
      <p className="w-[95px] shrink-0 text-sm font-semibold text-text-primary">
        {formatRiscoHistoricoData(item.data_historico)}
      </p>
      <p className="min-w-0 flex-1 text-sm leading-5 text-text-primary">
        {item.descricao?.trim() || "—"}
      </p>
      <p className="w-full max-w-[355px] shrink-0 text-sm leading-5 text-text-secondary">
        {item.impacto?.trim() || "—"}
      </p>
      <div className="flex w-[66px] shrink-0 items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-text-primary"
          onClick={() => onEditar?.(item)}
          disabled={!onEditar}
          aria-label="Editar ocorrência"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-text-secondary hover:text-destructive"
          onClick={() => onExcluir?.(item)}
          disabled={!onExcluir}
          aria-label="Excluir ocorrência"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
