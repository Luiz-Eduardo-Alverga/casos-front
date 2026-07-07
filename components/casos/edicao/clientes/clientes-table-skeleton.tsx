"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function ClientesTableSkeletonRow() {
  return (
    <TableRow className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover">
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-32 max-w-full" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-[200px] max-w-full" />
      </TableCell>
      <TableCell className="py-3 px-2.5 w-[80px]">
        <Skeleton className="h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export interface ClientesTableSkeletonProps {
  rowCount?: number;
}

export function ClientesTableSkeleton({ rowCount = 1 }: ClientesTableSkeletonProps) {
  const rows = Math.max(1, rowCount);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-table-row-bg border-b border-border hover:bg-table-row-hover">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Cliente
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Data solicitação
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            URL
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5 w-[80px]">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <ClientesTableSkeletonRow key={i} />
        ))}
      </TableBody>
    </Table>
  );
}
