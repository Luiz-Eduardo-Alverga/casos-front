"use client";

import { Box } from "lucide-react";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { mapProjetoMemoriaToTabelaRow } from "@/components/projetos/tabela/map-projeto-memoria-to-escopo-row";

interface ReportsTabelaDetalhesCasoProps {
  item: ProjetoMemoriaItem;
}

export function ReportsTabelaDetalhesCaso({
  item,
}: ReportsTabelaDetalhesCasoProps) {
  const row = mapProjetoMemoriaToTabelaRow(item);
  const versaoLabel = row.versao
    ? row.versao.toLowerCase().startsWith("v")
      ? row.versao
      : `v${row.versao}`
    : "—";

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-sm font-semibold leading-snug text-text-primary break-words">
        {row.descricao?.trim() ? row.descricao : "—"}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
        <Box className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="min-w-0 truncate font-semibold">
          {row.produto || "—"}
        </span>
        <span className="text-text-secondary" aria-hidden>
          •
        </span>
        <span className="shrink-0 whitespace-nowrap font-semibold">
          {versaoLabel}
        </span>
        <span className="text-text-secondary" aria-hidden>
          •
        </span>
        <span className="shrink-0 whitespace-nowrap font-semibold">
          Projeto {row.projetoId}
        </span>
        <span
          className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary"
          title={`${row.dias_no_backlog} dias no backlog`}
        >
          Aberto há {row.dias_no_backlog} dias
        </span>
        <span className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary">
          Importância: {Number(row.importancia) || 0}
        </span>
      </div>
    </div>
  );
}
