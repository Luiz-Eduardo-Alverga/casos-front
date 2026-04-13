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

const ROWS = 6;

function SkeletonRow() {
  return (
    <TableRow className="bg-white border-t border-border-divider hover:bg-white">
      <TableCell className="py-3 px-2.5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm" />
          <Skeleton className="h-4 w-20" />
        </div>
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-[88px]" />
      </TableCell>
      <TableCell className="py-3 px-2.5 text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function VersoesTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Versão
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[200px]">
            Data de cadastro
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 w-[88px] text-right">
            Ações
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
