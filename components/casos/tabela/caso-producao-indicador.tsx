"use client";

import { CirclePause, CirclePlay } from "lucide-react";
import { cn } from "@/lib/utils";

export type CasoProducaoEstado = "iniciado" | "parado";

export function getCasoProducaoEstado(
  tempoStatus?: string,
  statusTempo?: string,
): CasoProducaoEstado | null {
  if (tempoStatus === "PARAR" && statusTempo === "INICIADO") {
    return "iniciado";
  }
  if (tempoStatus === "INICIAR" && statusTempo === "PARADO") {
    return "parado";
  }
  return null;
}

interface CasoProducaoIndicadorProps {
  estado: CasoProducaoEstado;
  className?: string;
}

const iconBoxClass =
  "relative inline-flex size-[24px] shrink-0 items-center justify-center";

export function CasoProducaoIndicador({
  estado,
  className,
}: CasoProducaoIndicadorProps) {
  if (estado === "iniciado") {
    return (
      <span
        className={cn(iconBoxClass, className)}
        aria-label="Produção iniciada"
        role="img"
      >
        <CirclePlay
          className="size-[24px] fill-green-500 text-white"
          aria-hidden
        />
      </span>
    );
  }

  return (
    <span
      className={cn(iconBoxClass, className)}
      aria-label="Produção parada"
      role="img"
    >
      <CirclePause
        className="size-[20px] fill-muted-foreground/30 text-muted-foreground"
        aria-hidden
      />
    </span>
  );
}
