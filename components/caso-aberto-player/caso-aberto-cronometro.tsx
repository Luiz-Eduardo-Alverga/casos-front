"use client";

import { useEffect, useState } from "react";
import { Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatElapsedHms,
  getElapsedSecondsSince,
} from "@/components/caso-aberto-player/utils";

interface CasoAbertoCronometroProps {
  horaAberturaIso: string;
  onParar: () => void;
  isParando: boolean;
  className?: string;
}

export function CasoAbertoCronometro({
  horaAberturaIso,
  onParar,
  isParando,
  className,
}: CasoAbertoCronometroProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    getElapsedSecondsSince(horaAberturaIso),
  );

  useEffect(() => {
    const tick = () => setElapsedSeconds(getElapsedSecondsSince(horaAberturaIso));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [horaAberturaIso]);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cronômetro geral
        </p>
        <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-slate-900">
          {formatElapsedHms(elapsedSeconds)}
        </p>
      </div>
      <button
        type="button"
        onClick={onParar}
        disabled={isParando}
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-full",
          "bg-red-50 text-red-600 transition-colors hover:bg-red-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
          "disabled:opacity-60",
        )}
        aria-label="Parar produção"
      >
        {isParando ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <Square className="size-4 fill-current" aria-hidden />
        )}
      </button>
    </div>
  );
}
