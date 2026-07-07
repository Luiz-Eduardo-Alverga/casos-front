"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Alinhado às colunas de contagem do painel (produtos priorizados / Kanban). */
export type PainelContagemStatusVariant =
  | "abertos"
  | "corrigidos"
  | "retornos"
  | "concluidos"
  | "Em homologação"
  | "Em desenvolvimento"
  | "Em teste"
  | "Em certificação"
  | "Concluído";

const VARIANT_CLASSES: Record<PainelContagemStatusVariant, string> = {
  abertos:
    "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/40",
  corrigidos:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-950/40",
  retornos:
    "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/40",
  concluidos:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-950/40",
  "Em homologação":
    "bg-muted text-muted-foreground border-transparent hover:bg-muted dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted",
  "Em desenvolvimento":
    "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/40",
  "Em teste":
    "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/40",
  "Em certificação":
    "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/40",
  Concluído:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:hover:bg-green-950/40",
};

export interface PainelContagemStatusBadgeProps {
  variant: PainelContagemStatusVariant;
  children: ReactNode;
  className?: string;
}

/**
 * Badge numérico por status (abertos / corrigidos / retornos / concluídos),
 * mesmo padrão visual de {@link ProdutosPriorizados}.
 */
export function PainelContagemStatusBadge({
  variant,
  children,
  className,
}: PainelContagemStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full w-6 h-6 flex items-center justify-center border-transparent px-0",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
