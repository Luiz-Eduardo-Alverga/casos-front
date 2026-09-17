"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProdutoData } from "@/services/produtos/types";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import {
  ProdutoListaMobileCard,
  ProdutosTabelaRow,
} from "@/components/produtos/tabela/produtos-tabela-row";
import {
  ProdutosListaMobileSkeleton,
  ProdutosTabelaSkeletonRows,
} from "@/components/produtos/tabela/produtos-tabela-skeleton";

interface ProdutosTabelaTableProps {
  itens: ProdutoData[];
  isFetchingNextPage?: boolean;
}

const HEADER_CLASS =
  "h-auto px-4 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export function ProdutosTabelaTable({
  itens,
  isFetchingNextPage = false,
}: ProdutosTabelaTableProps) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-b border-border-divider hover:bg-transparent">
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.registro}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.nomeColuna}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.setor}
              </TableHead>
              <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.po}</TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.scrumMaster}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.data}
              </TableHead>
              <TableHead className={`${HEADER_CLASS} text-right`}>
                {PRODUTO_LABELS.status}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((produto) => (
              <ProdutosTabelaRow key={produto.Registro} produto={produto} />
            ))}
            {isFetchingNextPage ? (
              <ProdutosTabelaSkeletonRows count={3} />
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:hidden">
        {itens.map((produto) => (
          <ProdutoListaMobileCard key={produto.Registro} produto={produto} />
        ))}
        {isFetchingNextPage ? (
          <ProdutosListaMobileSkeleton count={2} />
        ) : null}
      </div>
    </>
  );
}
