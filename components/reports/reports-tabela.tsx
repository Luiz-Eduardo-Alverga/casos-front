"use client";

import { useCallback } from "react";
import { Inbox, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/painel/empty-state";
import { cn } from "@/lib/utils";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { mapProjetoMemoriaToReportCard } from "./utils";
import { getPrioridadeStyle } from "./utils";
import { ReportCategoriaBadge, ReportPrioridadeBadge } from "./report-badges";
import { ReportsTabelaDetalhesCaso } from "./reports-tabela-detalhes-caso";
import {
  ReportsTabelaSkeleton,
  ReportsTabelaSkeletonRows,
} from "./reports-tabela-skeleton";

interface ReportsTabelaProps {
  itens: ProjetoMemoriaItem[];
  isLoading: boolean;
  hasSetor: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  loadMoreRef: React.Ref<HTMLDivElement>;
  setScrollRoot: (el: HTMLElement | null) => void;
}

export function ReportsTabela({
  itens,
  isLoading,
  hasSetor,
  hasNextPage,
  isFetchingNextPage,
  selectedId,
  onSelect,
  loadMoreRef,
  setScrollRoot,
}: ReportsTabelaProps) {
  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      setScrollRoot(node);
    },
    [setScrollRoot],
  );

  if (!hasSetor) {
    return (
      <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Reports abertos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 flex items-center justify-center">
          <EmptyState
            icon={Inbox}
            title="Selecione um setor"
            description="Escolha um setor no filtro para visualizar os reports abertos."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-card rounded-lg flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-border-divider shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-text-primary" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            Reports abertos
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollRef}
        className="p-0 lg:flex-1 lg:min-h-0 lg:overflow-y-auto"
      >
        {isLoading ? (
          <div className="p-4">
            <ReportsTabelaSkeleton />
          </div>
        ) : itens.length === 0 ? (
          <div className="p-6 flex items-center justify-center">
            <EmptyState
              icon={Inbox}
              title="Nenhum report encontrado"
              description="Ajuste os filtros ou não há reports abertos no momento."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow className="bg-background border-b border-background hover:bg-background">
                  <TableHead className="w-[80px] font-medium text-sm text-text-primary py-4 px-3">
                    Caso
                  </TableHead>
                  <TableHead className="w-[110px] font-medium text-sm text-text-primary py-4 px-3">
                    Categoria
                  </TableHead>
                  <TableHead className="min-w-0 font-medium text-sm text-text-primary py-4 px-3">
                    Detalhes do caso
                  </TableHead>
                  <TableHead className="w-[100px] font-medium text-sm text-text-primary py-4 px-3">
                    Prioridade
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((item) => {
                  const row = mapProjetoMemoriaToReportCard(item);
                  const prioridadeStyle = getPrioridadeStyle(row.prioridade);
                  const isSelected = selectedId === row.id;

                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "cursor-pointer border-t border-border-strong hover:bg-muted/30",
                        isSelected && "bg-muted/50",
                      )}
                      onClick={() => onSelect(row.id)}
                    >
                      <TableCell className="relative py-3 px-3 pl-4 align-top">
                        {isSelected ? (
                          <span
                            className={cn(
                              "absolute inset-y-0 left-0 w-1",
                              prioridadeStyle.border,
                            )}
                            aria-hidden
                          />
                        ) : null}
                        <span className="text-sm font-semibold text-text-primary whitespace-nowrap">
                          #{row.id}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 px-3 align-top">
                        <ReportCategoriaBadge categoria={row.categoria} />
                      </TableCell>
                      <TableCell className="py-3 px-3 align-top min-w-0">
                        <ReportsTabelaDetalhesCaso item={item} />
                      </TableCell>
                      <TableCell className="py-3 px-3 align-top">
                        <ReportPrioridadeBadge prioridade={row.prioridade} />
                      </TableCell>
                    </TableRow>
                  );
                })}
                {isFetchingNextPage ? (
                  <ReportsTabelaSkeletonRows count={3} />
                ) : null}
              </TableBody>
            </Table>
            {hasNextPage && itens.length > 0 ? (
              <div ref={loadMoreRef} className="min-h-[48px]" />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
