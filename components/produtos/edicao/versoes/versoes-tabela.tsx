"use client";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProdutoVersaoData } from "@/services/produtos/types";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import {
  VersaoListaMobileCard,
  VersoesTabelaRow,
} from "@/components/produtos/edicao/versoes/versoes-tabela-row";
import {
  VersoesTabelaSkeleton,
  VersoesTabelaSkeletonRows,
} from "@/components/produtos/edicao/versoes/versoes-skeleton";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";

export interface VersoesTabelaProps {
  itens: ProdutoVersaoData[];
  canEdit: boolean;
  canDelete: boolean;
  usuarios?: Usuario[];
  currentUser?: User | null;
  isFetchingNextPage?: boolean;
  onEdit: (versao: ProdutoVersaoData) => void;
  onToggleStatus: (versao: ProdutoVersaoData) => void;
  onDelete: (versao: ProdutoVersaoData) => void;
}

const HEADER_CLASS =
  "h-auto px-4 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground";

export function VersoesTabela({
  itens,
  canEdit,
  canDelete,
  usuarios,
  currentUser,
  isFetchingNextPage = false,
  onEdit,
  onToggleStatus,
  onDelete,
}: VersoesTabelaProps) {
  const showAcoes = canEdit || canDelete;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow className="border-b border-border-divider hover:bg-transparent">
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.versaoColuna}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.status}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.dataAbertura}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.dataFechamento}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.notasVersao}
              </TableHead>
              <TableHead className={`${HEADER_CLASS} text-center`}>
                {PRODUTO_LABELS.helptools}
              </TableHead>
              <TableHead className={HEADER_CLASS}>
                {PRODUTO_LABELS.testador}
              </TableHead>
              {showAcoes ? <TableHead className={HEADER_CLASS} /> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((versao) => (
              <VersoesTabelaRow
                key={versao.Sequencia}
                versao={versao}
                canEdit={canEdit}
                canDelete={canDelete}
                usuarios={usuarios}
                currentUser={currentUser}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onDelete={onDelete}
              />
            ))}
            {isFetchingNextPage ? (
              <VersoesTabelaSkeletonRows
                count={3}
                columns={showAcoes ? 8 : 7}
              />
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:hidden">
        {itens.map((versao) => (
          <VersaoListaMobileCard
            key={versao.Sequencia}
            versao={versao}
            canEdit={canEdit}
            canDelete={canDelete}
            onEdit={onEdit}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
        {isFetchingNextPage ? <VersoesTabelaSkeleton count={2} /> : null}
      </div>
    </>
  );
}
