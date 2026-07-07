"use client";

import { cn } from "@/lib/utils";
import {
  resolvePrioridadeBadge,
  type PrioridadeBadgeVariant,
} from "@/components/projetos/edicao/risco/utils";

const VARIANT_CLASSES: Record<PrioridadeBadgeVariant, string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400",
  high: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  neutral: "bg-muted text-text-secondary",
};

export interface RiscoPrioridadeBadgeProps {
  prioridade: string;
  className?: string;
}

export function RiscoPrioridadeBadge({
  prioridade,
  className,
}: RiscoPrioridadeBadgeProps) {
  const { label, variant } = resolvePrioridadeBadge(prioridade);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium leading-4",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
