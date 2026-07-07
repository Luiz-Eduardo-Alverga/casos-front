"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ProjetosTabelaSkeletonRows } from "@/components/projetos/layout/projetos-tabela-skeleton";
import { ProjetosTabelaEscopoSkeletonRows } from "@/components/projetos/layout/projetos-tabela-escopo-skeleton-rows";
import { ProjetosTabelaRowListagem } from "@/components/projetos/tabela/projetos-tabela-row-listagem";
import { ProjetosTabelaRowEscopo } from "@/components/projetos/tabela/projetos-tabela-row-escopo";
import { ProjetosTabelaSortableHeader } from "@/components/projetos/tabela/projetos-tabela-sortable-header";
import type {
  ProjetosTabelaTableEscopoProps,
  ProjetosTabelaTableListagemProps,
  ProjetosTabelaTableProps,
} from "@/components/projetos/tabela/projetos-tabela-types";

const HEADER_ROW_CLASS =
  "bg-background border-b border-background dark:border-card hover:bg-background";

function ProjetosTabelaTableEscopo({
  itens,
  isFetchingNextPage,
  showCheckbox = false,
  selectedIds = [],
  onToggleItem,
  onToggleAll,
  sort,
  onSortChange,
}: ProjetosTabelaTableEscopoProps) {
  const selectedIdsSet = new Set(selectedIds);
  const allChecked =
    itens.length > 0 && itens.every((row) => selectedIdsSet.has(row.id));
  const someChecked = itens.some((row) => selectedIdsSet.has(row.id));

  const headerCells = [
    showCheckbox ? (
      <TableHead
        key="checkbox"
        className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2"
      >
        <Checkbox
          checked={allChecked ? true : someChecked ? "indeterminate" : false}
          onCheckedChange={(checked) => onToggleAll?.(Boolean(checked))}
          aria-label="Selecionar todos os casos"
        />
      </TableHead>
    ) : null,
    <ProjetosTabelaSortableHeader
      key="id"
      label="Id/Categoria"
      sortField="numero_caso"
      sort={sort}
      onSortChange={onSortChange}
      className="min-w-[95px]"
    />,
    <ProjetosTabelaSortableHeader
      key="detalhes"
      label="Detalhes do caso"
      sortFields={["produto_nome", "prioridade"]}
      sort={sort}
      onSortChange={onSortChange}
      className="min-w-0 flex-1"
    />,
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
    <ProjetosTabelaSortableHeader
      key="status"
      label="Status"
      sortField="data_conclusao_dev"
      sort={sort}
      onSortChange={onSortChange}
      className="w-[123px]"
    />,
    <TableHead
      key="acoes"
      className="w-[66px] text-right font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Ações
    </TableHead>,
  ];

  const bodyRows = [
    ...itens.map((row) => (
      <ProjetosTabelaRowEscopo
        key={row.id}
        row={row}
        showCheckbox={showCheckbox}
        checked={selectedIdsSet.has(row.id)}
        onCheckedChange={(checked) => onToggleItem?.(row.id, checked)}
      />
    )),
    ...(isFetchingNextPage
      ? [
          <ProjetosTabelaEscopoSkeletonRows
            key="skeleton"
            count={3}
            showCheckbox={showCheckbox}
          />,
        ]
      : []),
  ];

  return (
    <Table>
      {[
        <TableHeader key="header">
          <TableRow className={HEADER_ROW_CLASS}>{headerCells}</TableRow>
        </TableHeader>,
        <TableBody key="body">{bodyRows}</TableBody>,
      ]}
    </Table>
  );
}

function ProjetosTabelaTableListagem({
  itens,
  isFetchingNextPage,
  showCheckbox = false,
}: ProjetosTabelaTableListagemProps) {
  const headerCells = [
    showCheckbox ? (
      <TableHead
        key="checkbox"
        className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2"
      />
    ) : null,
    <TableHead
      key="registro"
      className="w-[80px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Registro
    </TableHead>,
    <TableHead
      key="nome"
      className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Nome do projeto
    </TableHead>,
    <TableHead
      key="data-inicial"
      className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Data inicial
    </TableHead>,
    <TableHead
      key="data-final"
      className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Data final
    </TableHead>,
    <TableHead
      key="status"
      className="w-[148px] font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Status
    </TableHead>,
    <TableHead
      key="acoes"
      className="w-[76px] text-right font-medium text-sm text-text-primary h-auto py-4 px-5"
    >
      Ações
    </TableHead>,
  ];

  const bodyRows = [
    ...itens.map((item) => (
      <ProjetosTabelaRowListagem key={item.registro} item={item} />
    )),
    ...(isFetchingNextPage
      ? [<ProjetosTabelaSkeletonRows key="skeleton" count={3} />]
      : []),
  ];

  return (
    <Table>
      {[
        <TableHeader key="header">
          <TableRow className={HEADER_ROW_CLASS}>{headerCells}</TableRow>
        </TableHeader>,
        <TableBody key="body">{bodyRows}</TableBody>,
      ]}
    </Table>
  );
}

export function ProjetosTabelaTable(props: ProjetosTabelaTableProps) {
  if (props.variant === "escopo") {
    return <ProjetosTabelaTableEscopo {...props} />;
  }
  return <ProjetosTabelaTableListagem {...props} />;
}
