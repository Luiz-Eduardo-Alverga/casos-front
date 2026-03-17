"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_BADGE_CLASSES = {
  abertos: "bg-blue-100 text-blue-700 border-transparent hover:bg-blue-100",
  corrigido:
    "bg-green-100 text-green-700 border-transparent hover:bg-green-100",
  retorno: "bg-orange-100 text-orange-700 border-transparent hover:bg-orange-100",
  suspenso:
    "bg-yellow-100 text-yellow-700 border-transparent hover:bg-yellow-100",
  resolvidos:
    "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-100",
} as const;

interface CasosParaTestarBadgesProps {
  abertos: number;
  corrigidos: number;
  retornos: number;
  suspenso?: number;
  resolvidos: number;
  className?: string;
  /** Exibe label acima do badge (estilo Figma). Quando false, exibe apenas o badge com número (ex.: células da tabela). */
  showLabels?: boolean;
}

const ITEMS: {
  label: string;
  key: keyof typeof STATUS_BADGE_CLASSES;
  valueKey: keyof CasosParaTestarBadgesProps;
}[] = [
  { label: "ABERTOS", key: "abertos", valueKey: "abertos" },
  { label: "CORRIGIDO", key: "corrigido", valueKey: "corrigidos" },
  { label: "RETORNO", key: "retorno", valueKey: "retornos" },
  { label: "SUSPENSO", key: "suspenso", valueKey: "suspenso" },
  { label: "RESOLVIDOS", key: "resolvidos", valueKey: "resolvidos" },
];

export function CasosParaTestarBadges({
  abertos,
  corrigidos,
  retornos,
  suspenso = 0,
  resolvidos,
  className,
  showLabels = true,
}: CasosParaTestarBadgesProps) {
  const values: Record<string, number> = {
    abertos,
    corrigidos,
    retornos,
    suspenso,
    resolvidos,
  };

  return (
    <div
      className={cn("flex flex-wrap items-end gap-4", className)}
      role="list"
    >
      {ITEMS.map(({ label, key, valueKey }) => {
        const value = values[valueKey];
        if (showLabels) {
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-1 shrink-0"
            >
              <span className="text-xs font-medium uppercase tracking-wide text-text-secondary">
                {label}
              </span>
              <Badge
                className={cn(
                  "rounded-full h-7 min-w-[2.25rem] flex items-center justify-center font-semibold text-xs px-3 shadow-sm",
                  STATUS_BADGE_CLASSES[key]
                )}
                aria-label={`${label}: ${value}`}
              >
                {value}
              </Badge>
            </div>
          );
        }
        return (
          <Badge
            key={key}
            className={cn(
              "rounded-full w-9 h-7 flex items-center justify-center shrink-0 font-semibold text-xs",
              STATUS_BADGE_CLASSES[key]
            )}
            aria-label={`${label}: ${value}`}
          >
            {value}
          </Badge>
        );
      })}
    </div>
  );
}
