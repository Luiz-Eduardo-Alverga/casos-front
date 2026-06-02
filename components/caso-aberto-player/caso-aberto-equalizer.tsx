"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Alturas fixas em px (maior barra = 16px), proporções da esquerda para direita: 40%, 70%, 30%, 100%, 60% */
const BAR_HEIGHTS = [6, 11, 5, 16, 10] as const;

const BAR_COUNT = BAR_HEIGHTS.length;
const WAVE_DURATION = 1.4;
const STAGGER = WAVE_DURATION / BAR_COUNT;

interface CasoAbertoEqualizerProps {
  className?: string;
}

export function CasoAbertoEqualizer({ className }: CasoAbertoEqualizerProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "flex h-4 items-end justify-center gap-[3px]",
        className,
      )}
      aria-hidden
    >
      {BAR_HEIGHTS.map((height, index) => (
        <motion.span
          key={index}
          className="w-[3px] shrink-0 rounded-full bg-teal-400"
          style={{ height }}
          initial={{ opacity: reduceMotion ? 1 : 0.25 }}
          animate={
            reduceMotion ? { opacity: 1 } : { opacity: [0.25, 1, 0.25] }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: WAVE_DURATION,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * STAGGER,
                }
          }
        />
      ))}
    </div>
  );
}
