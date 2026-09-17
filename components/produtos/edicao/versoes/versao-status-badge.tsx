"use client";

import { isVersaoAberta } from "@/components/produtos/edicao/versoes/utils";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";

export interface VersaoStatusBadgeProps {
  status: string;
  className?: string;
}

export function VersaoStatusBadge({ status, className }: VersaoStatusBadgeProps) {
  const aberto = isVersaoAberta(status);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-2 py-1 text-xs font-semibold",
        aberto
          ? "border-status-info/30 bg-status-info/10 text-status-info"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          aberto ? "bg-status-info" : "bg-muted-foreground",
        )}
      />
      {aberto ? PRODUTO_LABELS.statusAberto : PRODUTO_LABELS.statusFechado}
    </span>
  );
}
