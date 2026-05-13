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
      <TableCell className="w-[48px] py-3 px-2 text-center">
        <Skeleton className="mx-auto h-4 w-4 rounded-sm" />
      </TableCell>
      <TableCell className="min-w-[150px] max-w-[200px] py-3 px-5 align-top">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-7 w-9 rounded-full" />
          </div>
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5 align-top">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-3 w-48" />
        </div>
      </TableCell>
      <TableCell className="w-[100px] py-3 px-5 text-center align-top">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
        </div>
      </TableCell>
      <TableCell className="w-[120px] py-3 px-5 align-top">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="w-[150px] py-3 px-5 align-top">
        <Skeleton className="h-6 w-24 rounded-full" />
      </TableCell>
      <TableCell className="w-[100px] py-3 px-5">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

/** Linhas skeleton para uso no TableBody (ex.: loading inicial ou paginação infinita). */
export function CasosTabelaSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

const ROWS_INITIAL = 8;

export function CasosTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
          <TableHead className="w-[48px] text-center font-medium text-sm text-text-primary h-auto py-4 px-2" />
          <TableHead className="min-w-[150px] max-w-[200px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            ID / Categoria
          </TableHead>
          <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
            Detalhes do caso
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Estimativas
          </TableHead>
          <TableHead className="w-[120px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Desenvolvedor
          </TableHead>
          <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
          <TableHead className="w-[100px] text-right font-medium text-sm text-text-primary h-auto py-4 ">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <CasosTabelaSkeletonRows count={ROWS_INITIAL} />
      </TableBody>
    </Table>
  );
}
