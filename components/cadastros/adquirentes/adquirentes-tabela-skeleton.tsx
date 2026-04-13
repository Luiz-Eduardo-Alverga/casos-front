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
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-14" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <Skeleton className="h-4 w-14" />
      </TableCell>
      <TableCell className="py-3 px-2.5">
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-12 rounded-md" />
        </div>
      </TableCell>
      <TableCell className="py-3 px-2.5 text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function AdquirentesTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-white border-b border-white hover:bg-white">
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Adquirente
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Versão
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Status
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Próxima
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5">
            Dispositivos
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wide h-auto py-3 px-2.5 text-right">
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
