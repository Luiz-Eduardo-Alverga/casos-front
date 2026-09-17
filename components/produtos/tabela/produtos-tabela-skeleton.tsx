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
import { PRODUTO_LABELS } from "@/components/produtos/constants";

const HEADER_CLASS =
  "h-auto px-4 py-4 text-xs font-medium uppercase tracking-wide text-muted-foreground";

function SkeletonRow() {
  return (
    <TableRow className="border-t border-border-divider hover:bg-transparent">
      <TableCell className="px-4 py-4">
        <Skeleton className="h-4 w-10" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-4 w-full max-w-xs" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-6 w-28 rounded-full" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-6 w-28 rounded-full" />
      </TableCell>
      <TableCell className="px-4 py-4">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="px-4 py-4 text-right">
        <Skeleton className="ml-auto h-6 w-24 rounded-full" />
      </TableCell>
    </TableRow>
  );
}

export function ProdutosTabelaSkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </>
  );
}

export function ProdutosTabelaSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-border-divider hover:bg-transparent">
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.registro}</TableHead>
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.nomeColuna}</TableHead>
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.setor}</TableHead>
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.po}</TableHead>
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.scrumMaster}</TableHead>
          <TableHead className={HEADER_CLASS}>{PRODUTO_LABELS.data}</TableHead>
          <TableHead className={`${HEADER_CLASS} text-right`}>
            {PRODUTO_LABELS.status}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <ProdutosTabelaSkeletonRows count={8} />
      </TableBody>
    </Table>
  );
}

export function ProdutosListaMobileSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-2 border-b border-border-divider p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-48 rounded-full" />
        </div>
      ))}
    </div>
  );
}
