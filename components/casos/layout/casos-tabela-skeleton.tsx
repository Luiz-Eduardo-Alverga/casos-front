"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { ProjetosTabelaEscopoSkeletonRows } from "@/components/projetos/layout/projetos-tabela-escopo-skeleton-rows";

const ROWS_INITIAL = 8;

const HEADER_ROW_CLASS =
  "bg-background border-b border-background hover:bg-background";

export function CasosTabelaSkeleton() {
  const headerCells = [
    <TableHead
      key="checkbox"
      className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2"
    />,
    <TableHead
      key="id"
      className="min-w-[95px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      ID / Categoria
    </TableHead>,
    <TableHead
      key="detalhes"
      className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Detalhes do caso
    </TableHead>,
    <TableHead
      key="estimativas"
      className="w-[88px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Estimativas
    </TableHead>,
    <TableHead
      key="desenvolvedor"
      className="w-[120px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Desenvolvedor
    </TableHead>,
    <TableHead
      key="status"
      className="w-[123px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Status
    </TableHead>,
    <TableHead
      key="acoes"
      className="w-[66px] text-right font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Ações
    </TableHead>,
  ];

  return (
    <Table>
      {[
        <TableHeader key="header">
          <TableRow className={HEADER_ROW_CLASS}>{headerCells}</TableRow>
        </TableHeader>,
        <TableBody key="body">
          <ProjetosTabelaEscopoSkeletonRows count={ROWS_INITIAL} showCheckbox />
        </TableBody>,
      ]}
    </Table>
  );
}
