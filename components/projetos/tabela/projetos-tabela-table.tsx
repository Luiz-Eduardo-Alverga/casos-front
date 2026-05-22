"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { ProjetosTabelaSkeletonRows } from "@/components/projetos/layout/projetos-tabela-skeleton";
import { ProjetosTabelaEscopoSkeletonRows } from "@/components/projetos/layout/projetos-tabela-escopo-skeleton-rows";
import { ProjetosTabelaRowListagem } from "@/components/projetos/tabela/projetos-tabela-row-listagem";
import { ProjetosTabelaRowEscopo } from "@/components/projetos/tabela/projetos-tabela-row-escopo";
import type {
  ProjetosTabelaTableEscopoProps,
  ProjetosTabelaTableListagemProps,
  ProjetosTabelaTableProps,
} from "@/components/projetos/tabela/projetos-tabela-types";

const HEADER_ROW_CLASS =
  "bg-background border-b border-background hover:bg-background";

function ProjetosTabelaTableEscopo({
  itens,
  isFetchingNextPage,
  showCheckbox = false,
}: ProjetosTabelaTableEscopoProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={HEADER_ROW_CLASS}>
          {showCheckbox ? (
            <TableHead className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2" />
          ) : null}
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
        {itens.map((row) => (
          <ProjetosTabelaRowEscopo key={row.id} row={row} />
        ))}
        {isFetchingNextPage ? (
          <ProjetosTabelaEscopoSkeletonRows count={3} />
        ) : null}
      </TableBody>
    </Table>
  );
}

function ProjetosTabelaTableListagem({
  itens,
  isFetchingNextPage,
  showCheckbox = false,
}: ProjetosTabelaTableListagemProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={HEADER_ROW_CLASS}>
          {showCheckbox ? (
            <TableHead className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2" />
          ) : null}
          <TableHead className="w-[80px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Registro
          </TableHead>
          <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
            Nome do projeto
          </TableHead>
          <TableHead className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Data inicial
          </TableHead>
          <TableHead className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Data final
          </TableHead>
          <TableHead className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
          <TableHead className="w-[76px] text-right font-medium text-sm text-text-primary h-auto py-4 px-5">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <ProjetosTabelaRowListagem key={item.registro} item={item} />
        ))}
        {isFetchingNextPage ? <ProjetosTabelaSkeletonRows count={3} /> : null}
      </TableBody>
    </Table>
  );
}

export function ProjetosTabelaTable(props: ProjetosTabelaTableProps) {
  if (props.variant === "escopo") {
    return <ProjetosTabelaTableEscopo {...props} />;
  }
  return <ProjetosTabelaTableListagem {...props} />;
}
