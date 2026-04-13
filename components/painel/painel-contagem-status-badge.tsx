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
  abertos: "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100",
  corrigidos:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100",
  retornos:
    "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-100",
  concluidos:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100",
  "Em homologação":
    "bg-slate-200 text-slate-600 border-transparent hover:bg-slate-200",
  "Em desenvolvimento":
    "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100",
  "Em teste": "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100",
  "Em certificação":
    "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-100",
  Concluído:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100",
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
        "rounded-full w-9 h-7 flex items-center justify-center border-transparent px-0",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </Badge>
  );
}
