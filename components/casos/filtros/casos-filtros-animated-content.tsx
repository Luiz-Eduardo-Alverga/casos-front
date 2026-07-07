"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CasosFiltrosAnimationMode = "edicao" | "resumo";

export const FILTROS_TRANSITION = { duration: 0.2, ease: "easeInOut" } as const;

const contentVariants = {
  edicao: {
    initial: { height: 0, opacity: 0 },
    animate: { height: "auto", opacity: 1 },
    exit: { height: 0, opacity: 0 },
  },
  resumo: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
  },
} as const;

interface CasosFiltrosAnimatedContentProps {
  mode: CasosFiltrosAnimationMode;
  children: ReactNode;
  className?: string;
}

export function CasosFiltrosAnimatedContent({
  mode,
  children,
  className,
}: CasosFiltrosAnimatedContentProps) {
  const reduceMotion = useReducedMotion();
  const variants = contentVariants[mode];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={FILTROS_TRANSITION}
      className={className}
    >
      {children}
    </motion.div>
  );
}
