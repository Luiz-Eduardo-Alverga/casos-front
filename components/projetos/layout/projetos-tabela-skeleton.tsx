"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonRow() {
  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-transparent cursor-default">
      <TableCell className="w-[80px] py-3 px-5">
        <Skeleton className="h-5 w-14" />
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5">
        <Skeleton className="h-4 w-full max-w-md" />
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="w-[148px] py-3 px-5">
        <Skeleton className="h-7 w-20 rounded-full" />
      </TableCell>
      <TableCell className="w-[76px] py-3 px-5">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjetosTabelaSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

export function ProjetosTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
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
        <ProjetosTabelaSkeletonRows count={8} />
      </TableBody>
    </Table>
  );
}
