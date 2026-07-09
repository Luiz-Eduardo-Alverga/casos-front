"use client";

import Link from "next/link";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/badges/status-badge";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { ProjetosTabelaEscopoBadges } from "@/components/projetos/tabela/projetos-tabela-escopo-badges";
import type { ProjetosTabelaEscopoRow } from "@/components/projetos/tabela/projetos-tabela-types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CasoRelacoes } from "@/interfaces/projeto-memoria";
import { buildCasoHrefForNewTab } from "@/lib/caso-standalone-url";
import { formatDatePt } from "@/components/cadastros/format-display";
import { formatMinutesToHHMM } from "@/lib/utils";
import { Box, ExternalLink, Paperclip, SquarePen, Users } from "lucide-react";
import { SortableFieldContextMenu } from "@/components/projetos/tabela/sortable-field-context-menu";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";

export interface ProjetosTabelaRowEscopoProps {
  row: ProjetosTabelaEscopoRow;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  sort?: ProjetoMemoriaSortState;
  onSortChange?: (sort: ProjetoMemoriaSortState) => void;
}

export function ProjetosTabelaRowEscopo({
  row,
  showCheckbox = false,
  checked = false,
  onCheckedChange,
  sort,
  onSortChange,
}: ProjetosTabelaRowEscopoProps) {
  const versaoLabel = row.versao
    ? row.versao.toLowerCase().startsWith("v")
      ? row.versao
      : `v${row.versao}`
    : "—";
  const isReport =
    String(row.tipo_abertura ?? "")
      .trim()
      .toUpperCase() === "REPORT";
  const relacoes = Array.isArray(row.relacoes) ? row.relacoes : [];

  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-muted/30">
      {showCheckbox ? (
        <TableCell
          key="checkbox"
          className="w-[48px] py-3 px-2 text-center align-top"
        >
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => onCheckedChange?.(Boolean(value))}
            aria-label={`Selecionar caso ${row.numero}`}
          />
        </TableCell>
      ) : null}
      <TableCell
        key="id"
        className="min-w-[95px] max-w-[120px] py-3 px-2 align-top"
      >
        <div className="flex flex-col gap-0.5">
          <SortableFieldContextMenu
            sortField="numero_caso"
            sort={sort}
            onSortChange={onSortChange}
          >
            <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
              #{row.numero}
            </span>
          </SortableFieldContextMenu>
          <CategoriaBadge categoria={row.categoria} />
        </div>
      </TableCell>
      <TableCell key="detalhes" className="min-w-0 flex-1 py-3 px-2 align-top">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-semibold leading-snug text-text-primary break-words">
            {row.descricao?.trim() ? row.descricao : "—"}
          </p>
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
              <Box className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <SortableFieldContextMenu
                sortField="produto_nome"
                sort={sort}
                onSortChange={onSortChange}
              >
                <span className="min-w-0 truncate font-semibold">
                  {row.produto || "—"}
                </span>
              </SortableFieldContextMenu>
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

              <div className="flex flex-wrap items-center gap-1">
                {/* <CategoriaBadge categoria={row.categoria} /> */}
                <span
                  className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary"
                  title={`${row.dias_no_backlog} dias no backlog`}
                >
                  Aberto há {row.dias_no_backlog} dias
                </span>
                <span
                  className="inline-flex w-fit items-center gap-0.5 rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary"
                  title={`${row.qtd_clientes_vinculados} cliente(s) vinculado(s)`}
                >
                  <Users className="h-2.5 w-2.5 shrink-0" aria-hidden />
                  {row.qtd_clientes_vinculados}
                </span>
              </div>

              <SortableFieldContextMenu
                sortField="prioridade"
                sort={sort}
                onSortChange={onSortChange}
              >
                <span className="inline-flex w-fit items-center rounded-full border border-border-divider bg-muted/90 px-1.5 py-0 text-[10px] font-semibold text-text-secondary">
                  Importância: {Number(row.importancia) || 0}
                </span>
              </SortableFieldContextMenu>

              {/* <ImportanciaBadge importancia={Number(row.importancia) || 0} /> */}

              {relacoes.length > 0 ? (
                <>
                  <span className="text-text-secondary" aria-hidden>
                    •
                  </span>
                  <CasosRelacionadosTooltip relacoes={relacoes} />
                </>
              ) : null}
              {isReport ? (
                <>
                  <span className="text-text-secondary" aria-hidden>
                    •
                  </span>
                  <Badge className="bg-secondary font-semibold text-text-primary hover:bg-secondary/80">
                    REPORT
                  </Badge>
                </>
              ) : null}
            </div>
            <ProjetosTabelaEscopoBadges
              showNaoPlanejado={row.showNaoPlanejado}
              showViavel={row.showViavel}
              showDuplicado={row.showDuplicado}
            />
          </div>
        </div>
      </TableCell>
      <TableCell key="estimativas" className="w-[88px] py-3 px-2 align-top">
        <SortableFieldContextMenu
          sortField="tempo_estimado"
          sort={sort}
          onSortChange={onSortChange}
        >
          <div className="flex flex-col gap-0.5 text-xs font-normal text-text-secondary">
            <span>E: {formatMinutesToHHMM(row.estimado_minutos)}</span>
            <span>R: {formatMinutesToHHMM(row.realizado_minutos)}</span>
          </div>
        </SortableFieldContextMenu>
      </TableCell>
      <TableCell key="desenvolvedor" className="w-[120px] py-3 px-5 align-top">
        <span className="text-sm font-light text-text-primary line-clamp-2">
          {row.desenvolvedor?.trim() ? row.desenvolvedor : "—"}
        </span>
      </TableCell>
      <TableCell key="status" className="w-[123px] py-3 px-2 align-top">
        <SortableFieldContextMenu
          sortField="data_conclusao_dev"
          sort={sort}
          onSortChange={onSortChange}
        >
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={row.status} />
            {row.dataConclusao ? (
              <span className="text-xs font-semibold text-text-secondary">
                Finalizado em {formatDatePt(row.dataConclusao)}
              </span>
            ) : null}
          </div>
        </SortableFieldContextMenu>
      </TableCell>
      <TableCell key="acoes" className="w-[66px] py-3 px-5 align-top">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/casos/${row.id}`}
            aria-label={`Editar caso ${row.numero}`}
          >
            <SquarePen className="h-4 w-4 text-text-primary" />
          </Link>
          <Link
            target="_blank"
            href={buildCasoHrefForNewTab(row.id)}
            aria-label={`Abrir caso ${row.numero} em nova aba`}
          >
            <ExternalLink className="h-4 w-4 text-text-primary" />
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}

function formatRelacaoTipo(relacao: CasoRelacoes): string {
  return relacao.tipo_relacao_nome?.trim() || `Tipo ${relacao.tipo_relacao}`;
}

function CasosRelacionadosTooltip({ relacoes }: { relacoes: CasoRelacoes[] }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 items-center text-text-secondary transition-colors hover:text-text-primary"
            aria-label={`${relacoes.length} caso(s) relacionado(s)`}
          >
            <Paperclip className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs space-y-2 p-3"
        >
          <p className="text-xs font-semibold text-popover-foreground">
            Casos relacionados
          </p>
          <ul className="space-y-1.5">
            {relacoes.map((relacao) => (
              <li
                key={relacao.sequencia}
                className="text-xs leading-snug text-popover-foreground/90"
              >
                <span className="font-semibold">
                  {formatRelacaoTipo(relacao)} • #{relacao.caso_relacionado}
                </span>
                {relacao.descricao_resumo?.trim() ? (
                  <span className="block text-popover-foreground/75">
                    {relacao.descricao_resumo.trim()}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
