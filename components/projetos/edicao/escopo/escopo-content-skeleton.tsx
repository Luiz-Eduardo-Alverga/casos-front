"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ProjetosTabelaEscopoSkeletonRows } from "@/components/projetos/layout/projetos-tabela-escopo-skeleton-rows";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";

function SummaryCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-divider p-[13px]">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

export function EscopoContentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 border-b border-border-divider pb-4 pt-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-background border-b border-background hover:bg-background">
            <TableHead className="min-w-[95px] font-medium text-sm text-text-primary h-auto py-4 px-5">
              ID / Categoria
            </TableHead>
            <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
              Detalhes do caso
            </TableHead>
            <TableHead className="w-[88px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
              Estimativas
            </TableHead>
            <TableHead className="w-[120px] font-medium text-sm text-text-primary h-auto py-4 px-5">
              Desenvolvedor
            </TableHead>
            <TableHead className="w-[123px] font-medium text-sm text-text-primary h-auto py-4 px-5">
              Status
            </TableHead>
            <TableHead className="w-[66px] text-right font-medium text-sm text-text-primary h-auto py-4 px-5">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <ProjetosTabelaEscopoSkeletonRows count={6} />
        </TableBody>
      </Table>
    </div>
  );
}
