"use client";

import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROWS = 8;

export function ClientesTableSkeleton() {
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
        {Array.from({ length: ROWS }).map((_, index) => (
          <TableRow
            key={index}
            className="bg-table-row-bg border-t border-border-divider hover:bg-table-row-hover"
          >
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-4 w-48" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-4 w-56" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <Skeleton className="h-6 w-20 rounded-full" />
            </TableCell>
            <TableCell className="py-3 px-2.5">
              <div className="flex justify-end">
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ClientesListSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-[88px] w-full rounded-lg" />
      <div className="rounded-lg border border-border-divider bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-text-primary" />
          <Skeleton className="h-4 w-40" />
        </div>
        <ClientesTableSkeleton />
      </div>
    </div>
  );
}
