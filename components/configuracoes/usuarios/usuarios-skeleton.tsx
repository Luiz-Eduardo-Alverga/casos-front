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
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-56" />
        </div>
      </TableCell>
      <TableCell className="py-3">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="py-3">
        <Skeleton className="h-6 w-28 rounded-full" />
      </TableCell>
      <TableCell className="py-3 text-right">
        <Skeleton className="ml-auto h-8 w-36 rounded-md" />
      </TableCell>
    </TableRow>
  );
}

export function UsuariosTableSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[34%]">Usuário</TableHead>
          <TableHead className="w-[20%]">Setor</TableHead>
          <TableHead className="w-[26%]">Perfil de acesso</TableHead>
          <TableHead className="w-[20%] text-right">Ações</TableHead>
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

