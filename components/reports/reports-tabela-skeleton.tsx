"use client";

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

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="py-3 px-3">
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell className="py-3 px-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="py-3 px-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full max-w-[200px]" />
          <Skeleton className="h-3 w-full max-w-[280px]" />
        </div>
      </TableCell>
      <TableCell className="py-3 px-3">
        <Skeleton className="h-6 w-16 rounded-full" />
      </TableCell>
    </TableRow>
  );
}

export function ReportsTabelaSkeletonRows({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </>
  );
}

export function ReportsTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
          <TableHead className="w-[80px] font-medium text-sm text-text-primary py-4 px-3">
            Caso
          </TableHead>
          <TableHead className="w-[110px] font-medium text-sm text-text-primary py-4 px-3">
            Categoria
          </TableHead>
          <TableHead className="min-w-0 font-medium text-sm text-text-primary py-4 px-3">
            Detalhes do caso
          </TableHead>
          <TableHead className="w-[100px] font-medium text-sm text-text-primary py-4 px-3">
            Prioridade
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: ROWS }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </TableBody>
    </Table>
  );
}
