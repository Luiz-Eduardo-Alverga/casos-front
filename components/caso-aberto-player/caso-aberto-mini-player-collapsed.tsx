"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronUp, CirclePlay } from "lucide-react";
import { PulseContainer } from "@/components/caso-aberto-player/pulse-ring";
import type { CasoAbertoMiniPlayerCollapsedProps } from "@/components/caso-aberto-player/types";
import { cn } from "@/lib/utils";
import {
  collapseEnterTransition,
  expandTransition,
} from "@/components/caso-aberto-player/mini-player-transitions";

const pillVariants = {
  hidden: {
    opacity: 0,
    y: 20,
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
    y: -10,
    scale: 0.94,
    transition: expandTransition,
  },
};

export function CasoAbertoMiniPlayerCollapsed({
  viewModel,
  onExpand,
}: CasoAbertoMiniPlayerCollapsedProps) {
  const reduceMotion = useReducedMotion();

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
        <button
          type="button"
          onClick={onExpand}
          className={cn(
            "flex max-w-[min(100vw-2rem,360px)] items-center gap-3 rounded-full border border-emerald-500/30",
            "bg-card px-4 py-2.5 shadow-lg transition-colors hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          )}
          aria-label={`Caso ${viewModel.casoId} em produção. Clique para expandir.`}
        >
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
            <CirclePlay
              className="size-5 fill-emerald-500 text-white"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-emerald-600">
              Produção ativa
            </span>
            <span className="block truncate text-sm font-bold text-slate-900">
              {viewModel.titleLine}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {viewModel.titulo}
            </span>
          </span>
          <ChevronUp
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </button>
      </PulseContainer>
    </motion.div>
  );
}
