"use client";

import { Badge } from "@/components/ui/badge";

/**
 * Configuração de cores do badge por status.
 * Cada item define um conjunto de valores (palavras-chave) que, ao serem
 * encontrados no status (case-insensitive), aplicam a classe de cor.
 * A ordem importa: o primeiro match é usado.
 * Use `values: []` no último item como fallback (cor padrão).
 */
export interface StatusBadgeConfigItem {
  /** Valores que, se contidos no status, aplicam esta cor */
  values: string[];
  /** Classes Tailwind para background e texto (ex: "bg-green-100 text-green-700") */
  className: string;
}

/** Configuração padrão de status para casos (reutilizável e customizável) */
export const STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["CONCLUÍDO", "CONCLUIDO"],
    className: "bg-green-100 text-green-700 hover:bg-green-100",
  },
  {
    values: ["ATRIBUÍDO"],
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  {
    values: ["AGUARDANDO TESTE"],
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  {
    values: ["SUSPENSO"],
    className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
  },
  { values: [], className: "bg-gray-100 text-gray-700 hover:bg-gray-100" },
];

/** Exibe o status com primeira letra maiúscula e o resto minúsculo */
function formatStatusLabel(status: string): string {
  if (!status?.trim()) return "—";
  const lower = status.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getStatusBadgeClassName(
  status: string,
  config: StatusBadgeConfigItem[],
): string {
  const statusUpper = (status ?? "").trim().toUpperCase();
  for (const item of config) {
    if (item.values.length === 0) return item.className;
    const match = item.values.some((v) => statusUpper.includes(v));
    if (match) return item.className;
  }
  return (
    config[config.length - 1]?.className ??
    "bg-gray-100 text-gray-700 hover:bg-gray-100"
  );
}

interface StatusBadgeProps {
  /** Texto do status a ser exibido */
  status: string;
  /** Configuração de cores por valor (opcional; usa STATUS_BADGE_CONFIG se não informado) */
  config?: StatusBadgeConfigItem[];
  /** Classes adicionais no Badge */
  className?: string;
}

/**
 * Badge reutilizável para exibição de status com cores configuráveis.
 * Use a prop `config` para definir em quais valores cada cor se aplica.
 */
export function StatusBadge({
  status,
  config = STATUS_BADGE_CONFIG,
  className = "",
}: StatusBadgeProps) {
  const colorClass = getStatusBadgeClassName(status, config);
  return (
    <Badge
      className={`${colorClass} border-transparent rounded-full h-7 px-2.5 flex items-center justify-center whitespace-nowrap ${className}`.trim()}
    >
      <span className="text-xs font-semibold whitespace-nowrap">
        {formatStatusLabel(status)}
      </span>
    </Badge>
  );
}
