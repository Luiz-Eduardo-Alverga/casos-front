"use client";

import { cn } from "@/lib/utils";

export interface CategoriaBadgeStyle {
  container: string;
  dot: string;
  text: string;
}

export interface CategoriaBadgeConfigItem {
  values: string[];
  style: CategoriaBadgeStyle;
}

const DEFAULT_CATEGORIA_BADGE_STYLE: CategoriaBadgeStyle = {
  container: "bg-gray-50 border-gray-200",
  dot: "bg-gray-500",
  text: "text-gray-700",
};

export const CATEGORIA_BADGE_CONFIG: CategoriaBadgeConfigItem[] = [
  {
    values: ["MELHORIA"],
    style: {
      container: "bg-purple-50 border-purple-200",
      dot: "bg-purple-500",
      text: "text-purple-700",
    },
  },
  {
    values: ["BUG"],
    style: {
      container: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
  },
  {
    values: ["REQUISITO"],
    style: {
      container: "bg-blue-50 border-blue-200",
      dot: "bg-blue-500",
      text: "text-blue-700",
    },
  },
  { values: [], style: DEFAULT_CATEGORIA_BADGE_STYLE },
];

function formatCategoriaLabel(categoria: string): string {
  if (!categoria?.trim()) return "—";
  const lower = categoria.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getCategoriaBadgeStyle(
  categoria: string,
  config: CategoriaBadgeConfigItem[],
): CategoriaBadgeStyle {
  const upper = (categoria ?? "").trim().toUpperCase();
  for (const item of config) {
    if (item.values.length === 0) return item.style;
    const match = item.values.some((v) => upper.includes(v));
    if (match) return item.style;
  }
  return config[config.length - 1]?.style ?? DEFAULT_CATEGORIA_BADGE_STYLE;
}

interface CategoriaBadgeProps {
  categoria: string;
  config?: CategoriaBadgeConfigItem[];
  className?: string;
}

export function CategoriaBadge({
  categoria,
  config = CATEGORIA_BADGE_CONFIG,
  className = "",
}: CategoriaBadgeProps) {
  const style = getCategoriaBadgeStyle(categoria, config);

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap",
        style.container,
        className,
      )}
    >
      <span className={cn("size-1 shrink-0 rounded-full", style.dot)} />
      <span
        className={cn("text-xs font-semibold whitespace-nowrap", style.text)}
      >
        {formatCategoriaLabel(categoria)}
      </span>
    </span>
  );
}
