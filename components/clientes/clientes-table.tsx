"use client";

import { Building2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
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
import type { ClienteListItem } from "./types";

interface ClientesTableProps {
  rows: ClienteListItem[];
  isFetchingNextPage?: boolean;
}

function LoadingMoreRow() {
  return (
    <TableRow className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover">
      <TableCell className="py-3" colSpan={4}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-64" />
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
          <TableHead className="w-[120px] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Código
          </TableHead>
          <TableHead className="w-[35%] text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Nome (fantasia)
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Razão social
          </TableHead>
          <TableHead className="w-[100px] text-right text-xs uppercase tracking-wide font-medium text-text-primary h-auto py-3 px-2.5">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.registro}
            className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover cursor-pointer"
            onClick={() => router.push(`/clientes/${row.registro}`)}
          >
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-primary">
                #{row.registro}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-primary">
                {row.nome}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <span className="text-xs font-semibold text-text-secondary">
                {row.razao_social}
              </span>
            </TableCell>
            <TableCell className="py-3 px-2.5 text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/clientes/${row.registro}`);
                }}
                aria-label={`Visualizar cliente ${row.nome}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {isFetchingNextPage ? <LoadingMoreRow /> : null}
      </TableBody>
    </Table>
  );
}
