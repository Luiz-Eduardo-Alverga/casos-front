"use client";

import { cn } from "@/lib/utils";
import { resolveCronogramaPapelBadgeStyle } from "@/components/projetos/edicao/cronograma/cronograma-papel-badge-config";

export interface CronogramaPapelBadgeProps {
  idPapel: number;
  label: string;
  className?: string;
}

export function CronogramaPapelBadge({
  idPapel,
  label,
  className,
}: CronogramaPapelBadgeProps) {
  const style = resolveCronogramaPapelBadgeStyle(idPapel, label);
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
