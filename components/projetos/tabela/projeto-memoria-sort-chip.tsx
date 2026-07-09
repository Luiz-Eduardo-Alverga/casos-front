"use client";

import {
  getProjetoMemoriaSortActiveLabel,
  type ProjetoMemoriaSortState,
} from "@/components/projetos/tabela/projeto-memoria-sort";
import { cn } from "@/lib/utils";
import { ArrowUpDown, X } from "lucide-react";

export interface ProjetoMemoriaSortChipProps {
  sort?: ProjetoMemoriaSortState;
  onClear?: () => void;
  className?: string;
}

export function ProjetoMemoriaSortChip({
  sort,
  onClear,
  className,
}: ProjetoMemoriaSortChipProps) {
  const label = sort ? getProjetoMemoriaSortActiveLabel(sort) : null;
  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex h-7 max-w-full items-center gap-2 rounded-[10px] bg-blue-100 px-2 py-1",
        "text-[11px] font-semibold text-blue-800",
        className,
      )}
    >
      <ArrowUpDown className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-sm p-0.5 text-blue-800 hover:bg-blue-200/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Remover ordenação"
        >
          <X className="h-3 w-3" aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
