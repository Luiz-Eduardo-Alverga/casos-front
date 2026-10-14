"use client";

import { Bug, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCapitalize, getPrioridadeStyle } from "../utils";

function getCategoriaTone(categoria: string) {
  const normalized = categoria.trim().toLowerCase();
  if (normalized.includes("melhoria")) {
    return "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-400";
  }
  if (normalized.includes("bug")) {
    return "border-pink-100 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-400";
  }
  return "border-border bg-muted text-text-secondary";
}

function getCategoriaIcon(categoria: string) {
  const normalized = categoria.trim().toLowerCase();
  if (normalized.includes("bug")) return Bug;
  if (normalized.includes("melhoria")) return Sparkles;
  return null;
}

interface ReportIdBadgeProps {
  id?: number | string | null;
  className?: string;
}

export function ReportIdBadge({ id, className }: ReportIdBadgeProps) {
  if (id == null || String(id).trim() === "") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-primary/30 bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground",
        className,
      )}
    >
      #{id}
    </span>
  );
}

interface ReportCategoriaBadgeProps {
  categoria?: string | null;
  className?: string;
}

export function ReportCategoriaBadge({
  categoria,
  className,
}: ReportCategoriaBadgeProps) {
  if (!categoria?.trim()) return null;

  const label = formatCapitalize(categoria);
  const CategoriaIcon = getCategoriaIcon(categoria);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        getCategoriaTone(categoria),
        className,
      )}
    >
      {CategoriaIcon ? <CategoriaIcon className="h-3 w-3 shrink-0" /> : null}
      {label}
    </span>
  );
}

interface ReportPrioridadeBadgeProps {
  prioridade?: string | null;
  className?: string;
}

export function ReportPrioridadeBadge({
  prioridade,
  className,
}: ReportPrioridadeBadgeProps) {
  if (!prioridade?.trim()) return null;

  const prioridadeStyle = getPrioridadeStyle(prioridade);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        prioridadeStyle.badgeContainer,
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          prioridadeStyle.badgeDot,
        )}
      />
      <span className={cn("text-xs font-semibold", prioridadeStyle.badgeText)}>
        {formatCapitalize(prioridade)}
      </span>
    </span>
  );
}
