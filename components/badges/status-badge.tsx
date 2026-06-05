"use client";

import { cn } from "@/lib/utils";

export interface StatusBadgeStyle {
  container: string;
  dot: string;
  text: string;
}

/**
 * Configuração de cores do badge por status.
 * Cada item define um conjunto de valores (palavras-chave) que, ao serem
 * encontrados no status (case-insensitive), aplicam o estilo.
 * A ordem importa: o primeiro match é usado.
 * Use `values: []` no último item como fallback (cor padrão).
 */
export interface StatusBadgeConfigItem {
  /** Valores que, se contidos no status, aplicam este estilo */
  values: string[];
  style: StatusBadgeStyle;
}

const DEFAULT_STATUS_BADGE_STYLE: StatusBadgeStyle = {
  container: "bg-gray-50 border-gray-200",
  dot: "bg-gray-500",
  text: "text-gray-700",
};

/** Configuração padrão de status para casos (reutilizável e customizável) */
export const STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["CONCLUÍDO", "CONCLUIDO"],
    style: {
      container: "bg-green-50 border-green-200",
      dot: "bg-green-500",
      text: "text-green-700",
    },
  },
  {
    values: ["EM DESENVOLVIMENTO"],
    style: {
      container: "bg-blue-50 border-blue-200",
      dot: "bg-blue-500",
      text: "text-blue-700",
    },
  },
  {
    values: ["AGUARDANDO TESTE"],
    style: {
      container: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
  },
  {
    values: ["SUSPENSO"],
    style: {
      container: "bg-yellow-50 border-yellow-200",
      dot: "bg-yellow-500",
      text: "text-yellow-700",
    },
  },
  {
    values: ["REABERTO"],
    style: {
      container: "bg-orange-50 border-orange-200",
      dot: "bg-orange-500",
      text: "text-orange-700",
    },
  },
  { values: [], style: DEFAULT_STATUS_BADGE_STYLE },
];

/** Exibe o status com primeira letra maiúscula e o resto minúsculo */
function formatStatusLabel(status: string): string {
  if (!status?.trim()) return "—";
  const lower = status.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function getStatusBadgeStyle(
  status: string,
  config: StatusBadgeConfigItem[],
): StatusBadgeStyle {
  const statusUpper = (status ?? "").trim().toUpperCase();
  for (const item of config) {
    if (item.values.length === 0) return item.style;
    const match = item.values.some((v) => statusUpper.includes(v));
    if (match) return item.style;
  }
  return config[config.length - 1]?.style ?? DEFAULT_STATUS_BADGE_STYLE;
}

interface StatusBadgeProps {
  /** Texto do status a ser exibido */
  status: string;
  /** Configuração de cores por valor (opcional; usa STATUS_BADGE_CONFIG se não informado) */
  config?: StatusBadgeConfigItem[];
  /** Classes adicionais no container */
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
  const style = getStatusBadgeStyle(status, config);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap",
        style.container,
        className,
      )}
    >
      <span className={cn("size-1 shrink-0 rounded-full", style.dot)} />
      <span
        className={cn("text-xs font-semibold whitespace-nowrap", style.text)}
      >
        {formatStatusLabel(status)}
      </span>
    </span>
  );
}
