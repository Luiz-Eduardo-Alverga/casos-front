"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function EscopoSkeletonRow() {
  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-transparent cursor-default">
      <TableCell className="min-w-[95px] py-3 px-5">
        <Skeleton className="h-5 w-16 mb-2" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-5">
        <Skeleton className="h-4 w-full max-w-lg mb-2" />
        <Skeleton className="h-3 w-48" />
      </TableCell>
      <TableCell className="w-[88px] py-3 px-5">
        <Skeleton className="h-3 w-12 mx-auto mb-1" />
        <Skeleton className="h-3 w-12 mx-auto" />
      </TableCell>
      <TableCell className="w-[120px] py-3 px-5">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="w-[123px] py-3 px-5">
        <Skeleton className="h-7 w-24 rounded-full" />
      </TableCell>
      <TableCell className="w-[66px] py-3 px-5">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ProjetosTabelaEscopoSkeletonRows({
  count = 5,
}: {
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <EscopoSkeletonRow key={i} />
      ))}
    </>
  );
}
