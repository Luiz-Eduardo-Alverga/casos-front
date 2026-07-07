"use client";

import { Building2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  StatusBadge,
  type StatusBadgeConfigItem,
} from "@/components/badges/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/painel/empty-state";
import {
  formatCidadeUf,
  formatClienteDocumento,
} from "@/components/clientes/utils";
import type { ClienteListItem } from "./types";

interface ClientesTableProps {
  rows: ClienteListItem[];
  isFetchingNextPage?: boolean;
}

const CLIENTE_SITUACAO_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["INATIVO"],
    style: {
      container:
        "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
  {
    values: ["BLOQUEADO"],
    style: {
      container:
        "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
      dot: "bg-red-500 dark:bg-red-400",
      text: "text-red-700 dark:text-red-400",
    },
  },
  {
    values: [],
    style: {
      container:
        "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
];

const TABLE_COLUMN_COUNT = 7;

function getClienteSituacaoBadges(cliente: ClienteListItem): string[] {
  const badges: string[] = [];

  if (cliente.bloqueado) badges.push("Bloqueado");
  if (cliente.desativado) badges.push("Inativo");

  return badges;
}

function LoadingMoreRow() {
  return (
    <TableRow className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover">
      <TableCell className="py-3" colSpan={TABLE_COLUMN_COUNT}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ClientesTable({
  rows,
  isFetchingNextPage = false,
}: ClientesTableProps) {
  const router = useRouter();

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="Nenhum cliente encontrado"
        description="Ajuste a busca para localizar clientes por nome ou razão social."
        className="min-h-[260px]"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-table-row-bg border-b border-border hover:bg-table-row-hover">
          <TableHead className="w-[90px] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            ID
          </TableHead>
          <TableHead className="w-[22%] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="w-[24%] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Razão social
          </TableHead>
          <TableHead className="w-[160px] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            CPF/CNPJ
          </TableHead>
          <TableHead className="w-[140px] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Cidade / UF
          </TableHead>
          <TableHead className="w-[140px] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Situação
          </TableHead>
          <TableHead className="w-[80px] text-right text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const situacaoBadges = getClienteSituacaoBadges(row);

          return (
          <TableRow
            key={row.id}
            className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover cursor-pointer"
            onClick={() => router.push(`/clientes/${row.id}`)}
          >
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-primary">
                #{row.id}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-primary">
                {row.nome}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-secondary">
                {row.razaoSocial}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-secondary">
                {formatClienteDocumento(row.cnpj, row.cpf)}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-secondary">
                {formatCidadeUf(row.cidade, row.uf)}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              {situacaoBadges.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {situacaoBadges.map((status) => (
                    <StatusBadge
                      key={status}
                      status={status}
                      config={CLIENTE_SITUACAO_BADGE_CONFIG}
                    />
                  ))}
                </div>
              ) : (
                <span className="text-xs font-semibold text-text-secondary">
                  —
                </span>
              )}
            </TableCell>
            <TableCell className="py-3 px-2.5 text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/clientes/${row.id}`);
                }}
                aria-label={`Visualizar cliente ${row.nome}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
          );
        })}
        {isFetchingNextPage ? <LoadingMoreRow /> : null}
      </TableBody>
    </Table>
  );
}
