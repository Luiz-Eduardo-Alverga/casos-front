"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportsFiltroChipProps {
  pressed: boolean;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  dotClassName?: string;
  count?: number;
  vencidos?: number;
  zero?: boolean;
  className?: string;
}

export function ReportsFiltroChip({
  pressed,
  label,
  onClick,
  icon,
  dotClassName,
  count,
  vencidos = 0,
  zero = false,
  className,
}: ReportsFiltroChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      title={label}
      className={cn(
        "inline-flex h-9 max-w-full items-center gap-2 rounded-md border px-2 text-sm font-semibold text-text-primary",
        className,
        pressed
          ? "border-brand-yellow bg-brand-yellow/20"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      {pressed ? <Check className="size-3.5 shrink-0" aria-hidden /> : null}
      {icon}
      {dotClassName ? (
        <span
          className={cn("size-2 shrink-0 rounded-full", dotClassName)}
          aria-hidden
        />
      ) : null}
      <span className="truncate">{label}</span>
      {vencidos > 0 ? (
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-destructive">
          <span className="size-1.5 rounded-full bg-destructive" aria-hidden />
          {vencidos} venc.
        </span>
      ) : null}
      {count != null ? (
        <span
          className={cn(
            "inline-flex h-5 min-w-6 shrink-0 items-center justify-center rounded px-2 text-xs tabular-nums",
            zero
              ? "bg-muted text-text-secondary"
              : pressed
                ? "bg-brand-yellow text-text-primary"
                : "bg-primary text-primary-foreground",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
