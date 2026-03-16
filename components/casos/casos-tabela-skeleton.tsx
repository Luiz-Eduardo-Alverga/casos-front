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
    <TableRow className="bg-white border-t border-[#e0e0e0] hover:bg-transparent cursor-default">
      <TableCell className="w-[60px] py-3 px-5">
        <Skeleton className="h-4 w-10" />
      </TableCell>
      <TableCell className="w-[100px] py-3 px-5">
        <div className="flex justify-center">
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="w-[200px] py-3 px-5">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </TableCell>
      <TableCell className="flex-1 py-3 px-5">
        <Skeleton className="h-3.5 w-full max-w-[280px]" />
      </TableCell>
      <TableCell className="w-[100px] py-3 px-5">
        <div className="flex justify-center">
          <Skeleton className="h-7 w-9 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="w-[150px] py-3 px-5">
        <Skeleton className="h-6 w-20 rounded-full" />
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
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="w-[60px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Registro
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Categoria
          </TableHead>
          <TableHead className="w-[200px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Produto
          </TableHead>
          <TableHead className="flex-1 font-medium text-sm text-text-primary h-auto py-4 px-5">
            Resumo
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-4 px-5">
            Importância
          </TableHead>
          <TableHead className="w-[150px] font-medium text-sm text-text-primary h-auto py-4 px-5">
            Status
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <CasosTabelaSkeletonRows count={ROWS_INITIAL} />
      </TableBody>
    </Table>
  );
}
