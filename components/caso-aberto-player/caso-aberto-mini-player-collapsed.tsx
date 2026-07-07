"use client";

import { useMemo } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { ChevronDown, ChevronUp, CirclePlay, GripVertical } from "lucide-react";

import { PulseContainer } from "@/components/caso-aberto-player/pulse-ring";

import {
  useMiniPlayerDragHandle,
  useMiniPlayerExpandDirection,
} from "@/components/caso-aberto-player/mini-player-shell-context";

import type { CasoAbertoMiniPlayerCollapsedProps } from "@/components/caso-aberto-player/types";

import { cn } from "@/lib/utils";

import {
  collapseEnterTransition,
  expandTransition,
} from "@/components/caso-aberto-player/mini-player-transitions";

function buildPillVariants(expandDirection: "up" | "down") {
  const enterOffset = expandDirection === "down" ? 20 : -20;

  const exitOffset = expandDirection === "down" ? -10 : 10;

  return {
    hidden: {
      opacity: 0,

      y: enterOffset,

      scale: 0.88,

      transition: collapseEnterTransition,
    },

    visible: {
      opacity: 1,

      y: 0,

      scale: 1,

      transition: collapseEnterTransition,
    },

    exit: {
      opacity: 0,

      y: exitOffset,

      scale: 0.94,

      transition: expandTransition,
    },
  };
}

export function CasoAbertoMiniPlayerCollapsed({
  viewModel,

  onExpand,
}: CasoAbertoMiniPlayerCollapsedProps) {
  const reduceMotion = useReducedMotion();

  const startDrag = useMiniPlayerDragHandle();

  const expandDirection = useMiniPlayerExpandDirection();

  const pillVariants = useMemo(
    () => buildPillVariants(expandDirection),

    [expandDirection],
  );

  const ExpandChevron = expandDirection === "down" ? ChevronDown : ChevronUp;

  return (
    <motion.div
      key="collapsed"
      variants={pillVariants}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit={reduceMotion ? undefined : "exit"}
      transition={reduceMotion ? { duration: 0 } : undefined}
    >
      <PulseContainer enabled className="rounded-full">
        <div
          className={cn(
            "flex max-w-[min(100vw-2rem,360px)] items-center rounded-full border border-emerald-500/30",

            "bg-card py-2.5 pl-1 pr-4 shadow-lg",
          )}
        >
          <div
            role="button"
            tabIndex={0}
            onPointerDown={(event) => startDrag?.(event)}
            className={cn(
              "flex size-9 shrink-0 cursor-grab items-center justify-center rounded-full text-muted-foreground",

              "touch-none transition-colors hover:bg-muted/50 active:cursor-grabbing",

              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            )}
            aria-label="Arrastar player"
          >
            <GripVertical className="size-4" aria-hidden />
          </div>

          <button
            type="button"
            onClick={onExpand}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 transition-colors hover:opacity-90",

              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            )}
            aria-label={`Caso ${viewModel.casoId} em produção. Clique para expandir ${expandDirection === "down" ? "para baixo" : "para cima"}.`}
          >
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
              <CirclePlay
                className="size-5 fill-emerald-500 text-white"
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1 text-left">
              {/* <span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                Produção ativa
              </span> */}

              <span className="block truncate text-sm font-bold text-foreground">
                Caso #{viewModel.casoId}
              </span>

              <span className="block truncate text-xs text-muted-foreground">
                {viewModel.produtoNome}
              </span>
            </span>

            <ExpandChevron
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        </div>
      </PulseContainer>
    </motion.div>
  );
}
