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
        <Skeleton className="h-4 w-[140px]" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-[200px] max-w-[280px]" />
      </TableCell>
      <TableCell className="py-3 px-2.5 text-center">
        <Skeleton className="h-4 w-8 mx-auto" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-[120px]" />
      </TableCell>
    </TableRow>
  );
}

export function AdquirentesTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Nome
          </TableHead>
          <TableHead className="font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Logo (URL)
          </TableHead>
          <TableHead className="w-[100px] text-center font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            4G
          </TableHead>
          <TableHead className="w-[160px] font-medium text-sm text-text-primary h-auto py-3 px-2.5">
            Criado em
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
