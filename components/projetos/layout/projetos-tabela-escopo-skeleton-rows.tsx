"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

function EscopoSkeletonRow({
  showCheckbox = false,
  index = 0,
}: {
  showCheckbox?: boolean;
  index?: number;
}) {
  const titleWidths = ["max-w-md", "max-w-lg", "max-w-sm", "max-w-xl"];
  const titleWidth = titleWidths[index % titleWidths.length];

  const cells = [
    showCheckbox ? (
      <TableCell
        key="checkbox"
        className="w-[48px] py-3 px-2 text-center align-top"
      >
        <Skeleton className="mx-auto h-4 w-4 rounded-sm" />
      </TableCell>
    ) : null,
    <TableCell
      key="id"
      className="min-w-[95px] max-w-[120px] py-3 px-2 align-top"
    >
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </TableCell>,
    <TableCell key="detalhes" className="min-w-0 flex-1 py-3 px-2 align-top">
      <div className="flex min-w-0 flex-col gap-1">
        <Skeleton className={`h-4 w-full ${titleWidth}`} />
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
            <Skeleton className="h-3.5 w-3.5 shrink-0 rounded" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-[5.5rem] rounded-full" />
            <Skeleton className="h-4 w-[4.75rem] rounded-full" />
          </div>
          {index % 3 === 0 ? (
            <Skeleton className="h-5 w-24 shrink-0 rounded-md" />
          ) : null}
        </div>
      </div>
    </TableCell>,
    <TableCell
      key="estimativas"
      className="w-[88px] py-3 px-2 align-top"
    >
      <div className="flex flex-col gap-0.5">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
      </div>
    </TableCell>,
    <TableCell key="desenvolvedor" className="w-[120px] py-3 px-5 align-top">
      <Skeleton className="h-4 w-16" />
    </TableCell>,
    <TableCell key="status" className="min-w-[185px] py-3 px-2 align-top">
      <div className="flex flex-col items-start gap-1">
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-3 w-36" />
      </div>
    </TableCell>,
    <TableCell key="acoes" className="w-[66px] py-3 px-5 align-top">
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
    </TableCell>,
  ];

  return (
    <TableRow className="bg-background border-t border-border-strong hover:bg-transparent cursor-default">
      {cells}
    </TableRow>
  );
}

export function ProjetosTabelaEscopoSkeletonRows({
  count = 5,
  showCheckbox = false,
}: {
  count?: number;
  showCheckbox?: boolean;
}) {
  return Array.from({ length: count }, (_, i) => (
    <EscopoSkeletonRow key={i} showCheckbox={showCheckbox} index={i} />
  ));
}
