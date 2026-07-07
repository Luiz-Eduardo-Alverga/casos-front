"use client";

import { cn } from "@/lib/utils";
import { CasoAbertoEqualizer } from "@/components/caso-aberto-player/caso-aberto-equalizer";
import { formatMinutosAsHm } from "@/components/caso-aberto-player/utils";

interface CasoAbertoProgressTrackProps {
  percent: number;
  realizadoMinutos: number;
  estimadoMinutos: number;
  className?: string;
}

export function CasoAbertoProgressTrack({
  percent,
  realizadoMinutos,
  estimadoMinutos,
  className,
}: CasoAbertoProgressTrackProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Estimado:{" "}
          <span className="font-medium text-foreground">
            {formatMinutosAsHm(estimadoMinutos)}
          </span>
        </span>
        <span className="text-muted-foreground">
          Realizado:{" "}
          <span className="font-semibold text-emerald-600">
            {formatMinutosAsHm(realizadoMinutos)}
          </span>
        </span>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <CasoAbertoEqualizer />
    </div>
  );
}
