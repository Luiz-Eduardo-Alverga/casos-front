"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PulseRingProps {
  className?: string;
  dotClassName?: string;
  /** Tamanho do núcleo (bolinha sólida) */
  size?: "sm" | "md";
}

const sizeMap = {
  sm: { dot: "size-2", ring: "size-2" },
  md: { dot: "size-2.5", ring: "size-2.5" },
};

export function PulseRing({
  className,
  dotClassName,
  size = "md",
}: PulseRingProps) {
  const reduceMotion = useReducedMotion();
  const sizes = sizeMap[size];

  if (reduceMotion) {
    return (
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center",
          className,
        )}
        aria-hidden
      >
        <span
          className={cn(
            sizes.dot,
            "rounded-full bg-emerald-500",
            dotClassName,
          )}
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <motion.span
        className={cn(
          "absolute rounded-full bg-emerald-500/40",
          sizes.ring,
        )}
        animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <span
        className={cn(
          sizes.dot,
          "relative rounded-full bg-emerald-500",
          dotClassName,
        )}
      />
    </span>
  );
}

interface PulseContainerProps {
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

/** Pulso suave no container (mini-player fechado). */
export function PulseContainer({
  children,
  className,
  enabled = true,
}: PulseContainerProps) {
  const reduceMotion = useReducedMotion();

  if (!enabled || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ boxShadow: [
        "0 0 0 0 rgba(16, 185, 129, 0.35)",
        "0 0 0 8px rgba(16, 185, 129, 0)",
      ] }}
      transition={{
        duration: 1.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}
