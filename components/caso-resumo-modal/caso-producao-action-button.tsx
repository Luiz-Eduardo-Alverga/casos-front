"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CasoProducaoActionButtonProps {
  mode: "iniciar" | "parar";
  onClick: () => void;
  isPending: boolean;
  disabled?: boolean;
  className?: string;
}

export function CasoProducaoActionButton({
  mode,
  onClick,
  isPending,
  disabled = false,
  className,
}: CasoProducaoActionButtonProps) {
  const isIniciar = mode === "iniciar";
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={cn(
        "px-4 text-white",
        isIniciar
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-red-600 hover:bg-red-700",
        className ?? "w-48",
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
          {isIniciar ? "Iniciando..." : "Parando..."}
        </>
      ) : (
        <>
          {isIniciar ? (
            <Play className="h-3.5 w-3.5 mr-2" />
          ) : (
            <Pause className="h-3.5 w-3.5 mr-2" />
          )}
          {isIniciar ? "Iniciar" : "Parar"}
        </>
      )}
    </Button>
  );
}

