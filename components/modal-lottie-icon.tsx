"use client";

import { useMemo } from "react";
import Lottie from "lottie-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  BLUE_ALERT_SOURCE_COLOR,
  QUESTION_SOURCE_COLOR,
  getPrimaryLottieColor,
  prepareModalLottieAnimation,
} from "@/lib/lottie-color-utils";
import successAnimation from "@/public/animations/SuccessCheck.json";
import alertAnimation from "@/public/animations/BlueAlert.json";
import dangerAlertAnimation from "@/public/animations/RedAlert.json";
import questionAnimation from "@/public/animations/questionMarkBlue.json";

export type ModalLottieVariant = "success" | "alert" | "danger" | "question";

const ANIMATIONS = {
  success: successAnimation,
  alert: alertAnimation,
  danger: dangerAlertAnimation,
  question: questionAnimation,
} as const;

const DEFAULT_SIZES: Record<ModalLottieVariant, string> = {
  success: "h-[120px] w-[120px]",
  alert: "h-[120px] w-[107px]",
  danger: "h-[120px] w-[107px]",
  question: "h-[120px] w-[120px]",
};

interface ModalLottieIconProps {
  variant: ModalLottieVariant;
  /** Alterar ao reabrir o modal para reiniciar a animação. */
  playKey?: string | number | boolean;
  className?: string;
}

export function ModalLottieIcon({
  variant,
  playKey,
  className,
}: ModalLottieIconProps) {
  const { resolvedTheme } = useTheme();

  const animationData = useMemo(() => {
    const base = ANIMATIONS[variant];
    const targetColor = getPrimaryLottieColor(resolvedTheme);

    if (variant === "alert") {
      return prepareModalLottieAnimation(base, {
        remapColor: { from: BLUE_ALERT_SOURCE_COLOR, to: targetColor },
      });
    }

    if (variant === "question") {
      return prepareModalLottieAnimation(base, {
        remapColor: { from: QUESTION_SOURCE_COLOR, to: targetColor },
      });
    }

    return prepareModalLottieAnimation(base);
  }, [variant, resolvedTheme]);

  return (
    <Lottie
      key={String(playKey ?? variant)}
      animationData={animationData}
      loop={false}
      className={cn("mx-auto", DEFAULT_SIZES[variant], className)}
      aria-hidden
    />
  );
}
