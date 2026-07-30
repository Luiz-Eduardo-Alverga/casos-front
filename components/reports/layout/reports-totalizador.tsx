"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ReportsTotalizadorProps {
  exibindo: number;
  total: number;
  hasSetor: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ReportsTotalizador({
  exibindo,
  total,
  hasSetor,
  isLoading = false,
  className,
}: ReportsTotalizadorProps) {
  if (!hasSetor) return null;

  const totalExibicao = total > 0 ? total : exibindo;
  const percentual =
    totalExibicao > 0
      ? Math.min(100, Math.round((exibindo / totalExibicao) * 100))
      : isLoading
        ? 0
        : 100;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center justify-between gap-1 rounded-md p-0.5",
        className,
      )}
    >
      <div className="flex h-7 min-w-0 items-center gap-1 px-2">
        <p className="truncate text-xs text-text-primary">
          Exibindo {exibindo} de {totalExibicao} reports
        </p>
      </div>

      <div className="flex h-7 shrink-0 items-center gap-1 px-2">
        <Progress
          value={percentual}
          className="h-1.5 w-20 bg-primary/20"
          aria-label={`${percentual}% dos reports carregados`}
        />
        <span className="w-8 text-right text-xs text-text-primary tabular-nums">
          {percentual}%
        </span>
      </div>
    </div>
  );
}
