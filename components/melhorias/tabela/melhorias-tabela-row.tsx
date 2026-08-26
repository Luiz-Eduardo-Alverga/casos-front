"use client";

import type { ReactNode } from "react";
import { Box } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { formatLiberacaoDateDisplay } from "@/components/liberacoes/utils";
import { isMelhoriaPendente } from "@/components/melhorias/melhoria-status";
import { MelhoriasSituacaoBadges } from "@/components/melhorias/tabela/melhorias-situacao-badges";
import type { PainelIdeiaItem } from "@/services/painel-ideias/get-painel-ideias";

export interface MelhoriasTabelaRowProps {
  item: PainelIdeiaItem;
  onAvaliar: (item: PainelIdeiaItem) => void;
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-xs font-semibold text-text-secondary">
      {children}
    </span>
  );
}

function MetaSeparator() {
  return (
    <span className="text-text-secondary" aria-hidden>
      •
    </span>
  );
}

export function MelhoriasTabelaRow({
  item,
  onAvaliar,
}: MelhoriasTabelaRowProps) {
  const descricao =
    item.descricao_resumo_tratada?.trim() ||
    item.descricao_resumo?.trim() ||
    item.descricao?.trim() ||
    "—";
  const dataLabel = formatLiberacaoDateDisplay(item.datas);
  const suporte = item.nome_suporte?.trim() || "—";
  const casoLabel =
    item.numero_caso != null ? `Caso #${item.numero_caso}` : null;
  const importancia = item.importancia?.trim() || "";
  const actionLabel = isMelhoriaPendente(item.status)
    ? "Avaliar"
    : "Reavaliar";

  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-muted/30">
      <TableCell className="min-w-[95px] max-w-[120px] py-3 px-2 align-top">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
            #{item.registro}
          </span>
          {item.tipo?.trim() ? (
            <CategoriaBadge categoria={item.tipo} />
          ) : null}
        </div>
      </TableCell>

      <TableCell className="min-w-0 flex-1 py-3 px-2 align-top">
        <div className="flex min-w-0 flex-col gap-1">
          <p
            className="text-sm font-semibold leading-snug text-text-primary break-words line-clamp-2"
            title={descricao}
          >
            {descricao}
          </p>
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
            <Box className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate font-semibold">
              {item.produto?.trim() || "—"}
            </span>
            <MetaSeparator />
            <span className="shrink-0 whitespace-nowrap font-semibold">
              {dataLabel}
            </span>
            <MetaSeparator />
            <span className="shrink-0 whitespace-nowrap font-semibold">
              Aberto por {suporte}
            </span>
            {casoLabel ? (
              <>
                <MetaSeparator />
                <span className="shrink-0 whitespace-nowrap font-semibold">
                  {casoLabel}
                </span>
              </>
            ) : null}
            {importancia ? (
              <MetaChip>Importância: {importancia}</MetaChip>
            ) : null}
          </div>
        </div>
      </TableCell>

      <TableCell className="min-w-[150px] w-[170px] py-3 px-2 align-top">
        <MelhoriasSituacaoBadges
          status={item.status}
          concluido={item.concluido}
        />
      </TableCell>

      <TableCell className="w-[108px] min-w-[108px] py-3 px-2 align-top">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-3 font-medium"
          onClick={() => onAvaliar(item)}
        >
          {actionLabel}
        </Button>
      </TableCell>
    </TableRow>
  );
}
