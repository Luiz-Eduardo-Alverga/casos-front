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

const HEADER_ROW_CLASS =
  "bg-background border-b border-background dark:border-card hover:bg-background";

function SkeletonRow() {
  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-transparent cursor-default">
      <TableCell className="min-w-[95px] max-w-[120px] py-3 px-2 align-top">
        <div className="flex flex-col gap-0.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="min-w-0 flex-1 py-3 px-2 align-top">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-3/4 max-w-[420px]" />
          <Skeleton className="h-3 w-1/2 max-w-[280px]" />
        </div>
      </TableCell>
      <TableCell className="min-w-[140px] w-[160px] py-3 px-2 align-top">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function MelhoriasTabelaSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={HEADER_ROW_CLASS}>
          <TableHead className="min-w-[95px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Registro
          </TableHead>
          <TableHead className="min-w-0 flex-1 font-medium text-sm text-text-primary h-auto py-4 px-2">
            Detalhes
          </TableHead>
          <TableHead className="min-w-[140px] w-[160px] font-medium text-sm text-text-primary h-auto py-4 px-2">
            Situação
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </TableBody>
    </Table>
  );
}
