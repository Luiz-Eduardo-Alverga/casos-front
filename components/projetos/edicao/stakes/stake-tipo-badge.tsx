"use client";

import { cn } from "@/lib/utils";
import { resolveStakeTipoBadgeStyle } from "@/components/projetos/edicao/stakes/stake-tipo-badge-config";

export interface StakeTipoBadgeProps {
  idTipo: number;
  /** Label exibido (`Nomes` do catálogo SGP). */
  label: string;
  className?: string;
}

export function StakeTipoBadge({ idTipo, label, className }: StakeTipoBadgeProps) {
  const style = resolveStakeTipoBadgeStyle(idTipo, label);
  const Icon = style.Icon;
  const text = label.trim() || "—";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full py-0.5 text-xs font-medium leading-4",
        style.paddingClass ?? "px-2.5",
        style.containerClass,
        className,
      )}
    >
      <Icon className={style.iconClass} aria-hidden />
      {text}
    </span>
  );
}
