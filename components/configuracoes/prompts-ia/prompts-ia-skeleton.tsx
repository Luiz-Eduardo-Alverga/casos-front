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

function SkeletonRow() {
  return (
    <TableRow>
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell className="py-3">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="py-3 text-right">
        <Skeleton className="h-8 w-16 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function PromptsIaSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[35%]">Nome</TableHead>
          <TableHead className="w-[25%]">Squad</TableHead>
          <TableHead className="w-[15%]">Status</TableHead>
          <TableHead className="w-[25%] text-right">Ações</TableHead>
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
