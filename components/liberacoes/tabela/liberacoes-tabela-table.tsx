"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ExternalLink, SquarePen } from "lucide-react";
import { LiberacaoStatusBadge } from "@/components/liberacoes/liberacao-status-badge";
import { VersaoChip } from "@/components/liberacoes/versao-chip";
import {
  formatLiberacaoDateDisplay,
  resolveProdutoNome,
} from "@/components/liberacoes/utils";
import { LiberacoesTabelaSkeletonRows } from "@/components/liberacoes/layout/liberacoes-tabela-skeleton";
import { buildLiberacaoHrefForNewTab } from "@/lib/liberacao-standalone-url";
import type { Produto } from "@/services/auxiliar/produtos";
import type { LiberacaoItem } from "@/interfaces/liberacao";

interface LiberacoesTabelaTableProps {
  itens: LiberacaoItem[];
  produtos: Produto[] | undefined;
  isFetchingNextPage?: boolean;
}

export function LiberacoesTabelaTable({
  itens,
  produtos,
  isFetchingNextPage = false,
}: LiberacoesTabelaTableProps) {
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
          <TableHead className="w-[90px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Registro
          </TableHead>
          <TableHead className="h-auto py-3 px-2.5 text-sm text-text-primary">
            Produto
          </TableHead>
          <TableHead className="w-[120px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Tipo
          </TableHead>
          <TableHead className="w-[220px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Versões
          </TableHead>
          <TableHead className="w-[110px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Status
          </TableHead>
          <TableHead className="w-[150px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Previsão versão final
          </TableHead>
          <TableHead className="w-[90px] h-auto py-3 px-2.5 text-right text-sm text-text-primary">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {itens.map((item) => (
          <TableRow
            key={item.registro}
            className="bg-background border-t border-border-strong hover:bg-muted/30 cursor-pointer"
            onClick={() => router.push(`/liberacoes/${item.registro}`)}
          >
            <TableCell className="py-3 px-2.5 font-mono text-sm font-semibold text-text-primary whitespace-nowrap">
              #{item.registro}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-sm font-medium text-text-primary">
              {resolveProdutoNome(item.produto_id, produtos)}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-sm text-text-secondary">
              {item.tipo_liberacao}
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {item.versoes.slice(0, 2).map((v) => (
                  <VersaoChip key={v.sequencia} versao={v.versao} />
                ))}
                {item.versoes.length > 2 ? (
                  <span className="font-mono text-xs text-text-secondary">
                    +{item.versoes.length - 2}
                  </span>
                ) : null}
                {item.versoes.length === 0 ? (
                  <span className="text-xs text-text-secondary">—</span>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <LiberacaoStatusBadge status={item.status} />
            </TableCell>
            <TableCell className="py-3 px-2.5 font-mono text-sm text-text-secondary">
              {formatLiberacaoDateDisplay(item.versao_final_data_prevista)}
            </TableCell>
            <TableCell
              className="py-3 px-2.5 text-right"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/liberacoes/${item.registro}`}
                  aria-label={`Editar liberação ${item.registro}`}
                >
                  <SquarePen className="h-4 w-4 text-text-primary" />
                </Link>
                <Link
                  target="_blank"
                  href={buildLiberacaoHrefForNewTab(item.registro)}
                  aria-label={`Abrir liberação ${item.registro} em nova aba`}
                >
                  <ExternalLink className="h-4 w-4 text-text-primary" />
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {isFetchingNextPage ? (
          <LiberacoesTabelaSkeletonRows count={3} />
        ) : null}
      </TableBody>
    </Table>
  );
}
