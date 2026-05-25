"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/badges/status-badge";
import { ImportanciaBadge } from "@/components/badges/importancia-badge";
import { CategoriaBadge } from "@/components/casos/tabela/categoria-badge";
import { CasosTabelaSkeletonRows } from "@/components/casos/layout/casos-tabela-skeleton";
import Link from "next/link";
import { buildCasoHrefForNewTab } from "@/lib/caso-standalone-url";
import { Box, ExternalLink, SquarePen } from "lucide-react";
import { formatMinutesToHHMM } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CasoProducaoIndicador,
  getCasoProducaoEstado,
} from "@/components/casos/tabela/caso-producao-indicador";

export interface CasosTabelaRow {
  id: string;
  numero: string;
  produto: string;
  versao: string;
  descricao: string;
  status: string;
  categoria: string;
  importancia: number;
  tipo_abertura?: string;
  estimado_minutos: number;
  realizado_minutos: number;
  desenvolvedor: string;
  tempoStatus?: string;
  statusTempo?: string;
}

interface CasosTabelaTableProps {
  itens: CasosTabelaRow[];
  isFetchingNextPage: boolean;
  selectedIds: string[];
  onToggleItem: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

export function CasosTabelaTable({
  itens,
  isFetchingNextPage,
  selectedIds,
  onToggleItem,
  onToggleAll,
}: CasosTabelaTableProps) {
  const selectedIdsSet = new Set(selectedIds);
  const allChecked =
    itens.length > 0 && itens.every((row) => selectedIdsSet.has(row.id));
  const someChecked = itens.some((row) => selectedIdsSet.has(row.id));

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
          <TableHead className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2">
            <Checkbox
              checked={
                allChecked ? true : someChecked ? "indeterminate" : false
              }
              onCheckedChange={(checked) => onToggleAll(Boolean(checked))}
              aria-label="Selecionar todos os casos"
            />
          </TableHead>
          <TableHead className="min-w-[150px] max-w-[200px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            ID / Categoria
          </TableHead>
          <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
            Detalhes do caso
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Estimativas
          </TableHead>
          <TableHead className="w-[120px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Desenvolvedor
          </TableHead>
          <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
          <TableHead className="w-[100px] text-right font-medium text-sm text-text-primary h-auto py-4 ">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {itens.map((row) => {
          const producaoEstado = getCasoProducaoEstado(
            row.tempoStatus,
            row.statusTempo,
          );

          return (
            <TableRow
              key={row.id}
              className="bg-background border-t border-border-strong hover:bg-muted/50 transition-colors"
            >
              <TableCell className="w-[48px] py-3 px-2 text-center">
                <Checkbox
                  checked={selectedIdsSet.has(row.id)}
                  onCheckedChange={(checked) =>
                    onToggleItem(row.id, Boolean(checked))
                  }
                  aria-label={`Selecionar caso ${row.numero}`}
                />
              </TableCell>
              <TableCell className="min-w-[150px] max-w-[200px] py-3 px-5 align-top">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-text-primary whitespace-nowrap">
                      #{row.numero}
                    </span>
                    {/* <ImportanciaBadge importancia={row.importancia} /> */}
                  </div>
                  <div className="flex flex-wrap">
                    <CategoriaBadge categoria={row.categoria} />
                  </div>
                </div>
              </TableCell>

              <TableCell className="min-w-0 flex-1 py-3 px-5 align-top">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <p className="text-sm font-semibold leading-snug text-text-primary break-words">
                    {row.descricao?.trim() ? row.descricao : "—"}
                  </p>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-text-secondary">
                    <Box
                      className="h-3.5 w-3.5 shrink-0 text-text-secondary"
                      aria-hidden
                    />
                    <span className="min-w-0 truncate font-semibold">
                      {row.produto || "—"}
                    </span>
                    <span className="text-text-secondary" aria-hidden>
                      •
                    </span>
                    <span className="shrink-0 whitespace-nowrap font-semibold">
                      {row.versao
                        ? row.versao.toLowerCase().startsWith("v")
                          ? row.versao
                          : `v${row.versao}`
                        : "—"}
                    </span>
                    {String(row.tipo_abertura ?? "")
                      .trim()
                      .toUpperCase() === "REPORT" && (
                      <>
                        <span className="text-text-secondary" aria-hidden>
                          •
                        </span>
                        <Badge className="bg-secondary font-semibold text-text-primary hover:bg-secondary/80">
                          REPORT
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="w-[100px] py-3 px-5 text-center align-top">
                <div className="flex flex-col gap-0.5 text-xs font-normal text-text-secondary">
                  <span>E: {formatMinutesToHHMM(row.estimado_minutos)}</span>
                  <span>R: {formatMinutesToHHMM(row.realizado_minutos)}</span>
                </div>
              </TableCell>

              <TableCell className="w-[120px] py-3 px-5 align-top">
                <div className="flex items-center gap-1.5 min-w-0">
                  {producaoEstado && (
                    <CasoProducaoIndicador estado={producaoEstado} />
                  )}
                  <span className="text-sm font-light text-cases-ink line-clamp-2 min-w-0 flex-1">
                    {row.desenvolvedor?.trim() ? row.desenvolvedor : "—"}
                  </span>
                </div>
              </TableCell>

              <TableCell className="w-[150px] py-3 px-5 ">
                <StatusBadge status={row.status} />
              </TableCell>

              <TableCell className="w-[100px] flex items-center gap-2 justify-end h-16">
                <Link href={`/casos/${row.id}`}>
                  <SquarePen className="w-4 h-4 text-text-primary" />
                </Link>

                <Link target="_blank" href={buildCasoHrefForNewTab(row.id)}>
                  <ExternalLink className="w-4 h-4 text-text-primary" />
                </Link>
              </TableCell>
            </TableRow>
          );
        })}

        {isFetchingNextPage && <CasosTabelaSkeletonRows count={3} />}
      </TableBody>
    </Table>
  );
}
