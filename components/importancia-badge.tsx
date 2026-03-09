"use client";

import { Badge } from "@/components/ui/badge";

/**
 * Define uma faixa de importância (min, max inclusive) e a classe de cor.
 * A primeira faixa que contiver o valor é usada.
 */
export interface ImportanciaBadgeConfigItem {
  /** Valor mínimo da faixa (inclusive) */
  min: number;
  /** Valor máximo da faixa (inclusive). Use número alto (ex: 10) para "em diante". */
  max: number;
  /** Classes Tailwind (ex: "bg-green-100 text-green-700") */
  className: string;
}

/** Configuração padrão: 1-3 verde, 4-7 amarelo, 8+ vermelho */
export const IMPORTANCIA_BADGE_CONFIG: ImportanciaBadgeConfigItem[] = [
  { min: 1, max: 3, className: "bg-green-100 text-green-700" },
  { min: 4, max: 7, className: "bg-yellow-100 text-yellow-700" },
  { min: 8, max: 10, className: "bg-red-100 text-red-700" },
];

function getImportanciaBadgeClassName(
  importancia: number,
  config: ImportanciaBadgeConfigItem[],
): string {
  const value = Number(importancia);
  if (!Number.isFinite(value)) {
    return config[config.length - 1]?.className ?? "bg-gray-100 text-gray-700";
  }
  const item = config.find(
    (c) => value >= c.min && value <= c.max,
  );
  return item?.className ?? config[config.length - 1]?.className ?? "bg-gray-100 text-gray-700";
}

interface ImportanciaBadgeProps {
  /** Valor da importância (1-10) */
  importancia: number;
  /** Configuração de faixas e cores (opcional) */
  config?: ImportanciaBadgeConfigItem[];
  /** Classes adicionais no Badge */
  className?: string;
}

/**
 * Badge reutilizável para exibição de importância com cores por faixa.
 * Padrão: 1-3 verde, 4-7 amarelo, 8-10 vermelho.
 */
export function ImportanciaBadge({
  importancia,
  config = IMPORTANCIA_BADGE_CONFIG,
  className = "",
}: ImportanciaBadgeProps) {
  const colorClass = getImportanciaBadgeClassName(importancia, config);
  const displayValue = Number.isFinite(Number(importancia)) ? Number(importancia) : "—";

  return (
    <Badge
      className={`${colorClass} border-transparent rounded-full h-7 w-9 flex items-center justify-center whitespace-nowrap ${className}`.trim()}
    >
      <span className="text-xs font-semibold">{String(displayValue)}</span>
    </Badge>
  );
}
