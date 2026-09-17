"use client";

import { StatusBadge } from "@/components/badges/status-badge";
import type { StatusBadgeConfigItem } from "@/components/badges/status-badge";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { cn } from "@/lib/utils";

const PRODUTO_STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["DESATIVADO"],
    style: {
      container: "border-destructive/30 bg-destructive/10",
      dot: "bg-destructive",
      text: "text-destructive",
    },
  },
  {
    values: ["ATIVO"],
    style: {
      container: "border-status-success/30 bg-status-success/10",
      dot: "bg-status-success",
      text: "text-status-success",
    },
  },
  {
    values: [],
    style: {
      container: "border-border bg-muted",
      dot: "bg-muted-foreground",
      text: "text-muted-foreground",
    },
  },
];

interface ProdutoStatusBadgeProps {
  desativado: boolean;
  className?: string;
}

export function ProdutoStatusBadge({
  desativado,
  className,
}: ProdutoStatusBadgeProps) {
  return (
    <StatusBadge
      status={desativado ? PRODUTO_LABELS.desativado : PRODUTO_LABELS.ativo}
      config={PRODUTO_STATUS_BADGE_CONFIG}
      className={className}
    />
  );
}

interface ProdutoVacaLeiteiraBadgeProps {
  className?: string;
}

export function ProdutoVacaLeiteiraBadge({
  className,
}: ProdutoVacaLeiteiraBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-status-warning/30 bg-status-warning/10 px-2 py-1 text-xs font-semibold text-status-warning",
        className,
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-status-warning" />
      {PRODUTO_LABELS.vacaLeiteira}
    </span>
  );
}
