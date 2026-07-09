"use client";

import { cn, formatMinutesToHHMM } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface CasosTotalizadorProps {
  exibindo: number;
  totalCasos: number;
  tempoEstimadoMinutos: number;
  tempoRealizadoMinutos: number;
  hasFilters: boolean;
  isLoading?: boolean;
  className?: string;
}

export function CasosTotalizador({
  exibindo,
  totalCasos,
  tempoEstimadoMinutos,
  tempoRealizadoMinutos,
  hasFilters,
  isLoading = false,
  className,
}: CasosTotalizadorProps) {
  if (!hasFilters) return null;

  const totalExibicao = totalCasos > 0 ? totalCasos : exibindo;
  const percentual =
    totalExibicao > 0
      ? Math.min(100, Math.round((exibindo / totalExibicao) * 100))
      : isLoading
        ? 0
        : 100;

  return (
    <div
      className={cn(
        "mb-1 flex min-w-0 flex-col gap-2 rounded-md p-0.5 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 px-2">
        <p className="text-xs text-text-primary">
          <span className="font-semibold">Estimado:</span> E:{" "}
          {formatMinutesToHHMM(tempoEstimadoMinutos)}
        </p>
        <p className="text-xs text-text-primary">
          <span className="font-semibold">Realizado:</span> R:{" "}
          {formatMinutesToHHMM(tempoRealizadoMinutos)}
        </p>
      </div>

      <div className="flex h-7 min-w-0 shrink-0 items-center justify-end gap-1 px-2">
        <p className="truncate text-xs text-text-primary">
          Exibindo {exibindo} de {totalExibicao} casos
        </p>
        <Progress
          value={percentual}
          className="h-1.5 w-20 bg-primary/20"
          aria-label={`${percentual}% dos casos carregados`}
        />
        <span className="w-8 text-right text-xs text-text-primary tabular-nums">
          {percentual}%
        </span>
      </div>
    </div>
  );
}
