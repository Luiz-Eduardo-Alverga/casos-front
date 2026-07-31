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
      <TableCell className="w-[90px] py-3 px-2.5">
        <Skeleton className="h-4 w-12" />
      </TableCell>
      <TableCell className="min-w-0 py-3 px-2.5">
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell className="w-[120px] py-3 px-2.5">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="w-[180px] py-3 px-2.5">
        <Skeleton className="h-5 w-28" />
      </TableCell>
      <TableCell className="w-[110px] py-3 px-2.5">
        <Skeleton className="h-6 w-20 rounded-full" />
      </TableCell>
      <TableCell className="w-[150px] py-3 px-2.5">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="w-[90px] py-3 px-2.5">
        <Skeleton className="h-8 w-16 ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function LiberacoesTabelaSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background border-b border-background hover:bg-background">
          <TableHead className="w-[90px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Registro
          </TableHead>
          <TableHead className="h-auto py-3 px-2.5 text-sm text-text-primary">
            Produto
          </TableHead>
          <TableHead className="w-[120px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Tipo
          </TableHead>
          <TableHead className="w-[180px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Versões
          </TableHead>
          <TableHead className="w-[110px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Status
          </TableHead>
          <TableHead className="w-[150px] h-auto py-3 px-2.5 text-sm text-text-primary">
            Previsão versão final
          </TableHead>
          <TableHead className="w-[90px] h-auto py-3 px-2.5 text-right text-sm text-text-primary">
            Ações
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
