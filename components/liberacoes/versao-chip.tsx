"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VersaoChipProps {
  versao: string;
  onRemove?: () => void;
  className?: string;
}

export function VersaoChip({ versao, onRemove, className }: VersaoChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 pl-2.5 pr-1.5 py-1 font-mono text-xs font-semibold text-text-primary whitespace-nowrap",
        !onRemove && "pr-2.5",
        className,
      )}
    >
      {versao}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="grid h-4 w-4 place-items-center rounded hover:bg-border text-text-secondary"
          aria-label={`Remover versão ${versao}`}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      ) : null}
    </span>
  );
}
