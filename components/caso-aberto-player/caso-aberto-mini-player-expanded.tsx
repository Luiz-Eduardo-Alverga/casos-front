"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useMiniPlayerDragHandle,
  useMiniPlayerExpandDirection,
} from "@/components/caso-aberto-player/mini-player-shell-context";
import { CasoAbertoCronometro } from "@/components/caso-aberto-player/caso-aberto-cronometro";
import { CasoAbertoProgressTrack } from "@/components/caso-aberto-player/caso-aberto-progress-track";
import { PulseRing } from "@/components/caso-aberto-player/pulse-ring";
import type { CasoAbertoMiniPlayerExpandedProps } from "@/components/caso-aberto-player/types";
import { cn } from "@/lib/utils";
import {
  collapseExitTransition,
  expandTransition,
} from "@/components/caso-aberto-player/mini-player-transitions";

function buildPanelVariants(expandDirection: "up" | "down") {
  const enterOffset = expandDirection === "down" ? 16 : -16;
  const exitOffset = expandDirection === "down" ? 20 : -20;

  return {
    hidden: {
      opacity: 0,
      y: enterOffset,
      scale: 0.94,
      transition: expandTransition,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: expandTransition,
    },
    exit: {
      opacity: 0,
      y: exitOffset,
      scale: 0.92,
      transition: collapseExitTransition,
    },
  };
}

export function CasoAbertoMiniPlayerExpanded({
  viewModel,
  onCollapse,
  onVerCaso,
  onFinalizarCaso,
  onParar,
  isParando,
  isFinalizando,
}: CasoAbertoMiniPlayerExpandedProps) {
  const reduceMotion = useReducedMotion();
  const startDrag = useMiniPlayerDragHandle();
  const expandDirection = useMiniPlayerExpandDirection();
  const panelVariants = useMemo(
    () => buildPanelVariants(expandDirection),
    [expandDirection],
  );
  const CollapseChevron = expandDirection === "down" ? ChevronUp : ChevronDown;

  return (
    <motion.div
      key="expanded"
      variants={panelVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit={reduceMotion ? undefined : "exit"}
      transition={reduceMotion ? { duration: 0 } : undefined}
      className={cn(
        "w-[min(100vw-2rem,420px)] overflow-hidden rounded-xl border border-border-divider",
        "bg-card shadow-2xl",
      )}
    >
      <div className="flex items-center justify-between border-b border-border-divider px-2 py-3">
        <div
          className="flex min-w-0 flex-1 cursor-grab items-center gap-1 touch-none active:cursor-grabbing"
          onPointerDown={(event) => startDrag?.(event)}
          aria-label="Arrastar player"
        >
          <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground">
            <GripVertical className="size-4" aria-hidden />
          </span>
          <div className="flex min-w-0 items-center gap-2">
            <PulseRing size="sm" />
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Produção ativa
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          onPointerDown={(event) => event.stopPropagation()}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Minimizar player"
        >
          <CollapseChevron className="size-4" strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-sm font-bold leading-snug text-foreground">
            {viewModel.titleLine}
          </h2>
          {viewModel.prioridadeBadge ? (
            <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {viewModel.prioridadeBadge}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {viewModel.pathDescription}
        </p>

        <CasoAbertoProgressTrack
          percent={viewModel.progressPercent}
          realizadoMinutos={viewModel.realizadoMinutos}
          estimadoMinutos={viewModel.estimadoMinutos}
        />

        <CasoAbertoCronometro
          horaAberturaIso={viewModel.horaAberturaIso}
          onParar={onParar}
          isParando={isParando}
        />
      </div>

      <div className="flex gap-2 border-t border-border-divider px-4 py-3">
        <Button
          type="button"
          className="h-10 flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onVerCaso}
        >
          <Eye className="mr-2 size-4" aria-hidden />
          Ver caso completo
        </Button>
        <Button
          type="button"
          className="h-10 flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={onFinalizarCaso}
          disabled={isFinalizando || isParando}
        >
          <CheckCircle2 className="mr-2 size-4" aria-hidden />
          {isFinalizando ? "Finalizando..." : "Finalizar caso"}
        </Button>
      </div>
    </motion.div>
  );
}
