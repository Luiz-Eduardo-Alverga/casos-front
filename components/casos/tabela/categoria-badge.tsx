"use client";

import { Badge } from "@/components/ui/badge";

export interface CategoriaBadgeConfigItem {
  values: string[];
  className: string;
}

export const CATEGORIA_BADGE_CONFIG: CategoriaBadgeConfigItem[] = [
  {
    values: ["MELHORIA"],
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  {
    values: ["BUG"],
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  {
    values: ["REQUISITO"],
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  { values: [], className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
];

function formatCategoriaLabel(categoria: string): string {
  if (!categoria?.trim()) return "—";
  return categoria.trim();
}

function getCategoriaBadgeClassName(
  categoria: string,
  config: CategoriaBadgeConfigItem[],
): string {
  const upper = (categoria ?? "").trim().toUpperCase();
  for (const item of config) {
    if (item.values.length === 0) return item.className;
    const match = item.values.some((v) => upper.includes(v));
    if (match) return item.className;
  }
  return (
    config[config.length - 1]?.className ??
    "bg-gray-100 text-gray-700 hover:bg-gray-100"
  );
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
  const colorClass = getCategoriaBadgeClassName(categoria, config);
  return (
    <Badge
      className={`${colorClass} border-transparent rounded-full h-7 px-2.5 flex items-center justify-center whitespace-nowrap ${className}`.trim()}
    >
      <span className="text-xs font-semibold whitespace-nowrap">
        {formatCategoriaLabel(categoria)}
      </span>
    </Badge>
  );
}

