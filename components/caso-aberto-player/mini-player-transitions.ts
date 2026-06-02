/** Easing suave para expandir o painel */
export const expandEase = [0.22, 1, 0.36, 1] as const;

/** Easing suave ao minimizar (desacelera no final) */
export const collapseEase = [0.33, 1, 0.68, 1] as const;

export const expandTransition = {
  duration: 0.32,
  ease: expandEase,
} as const;

export const collapseExitTransition = {
  duration: 0.42,
  ease: collapseEase,
} as const;

export const collapseEnterTransition = {
  duration: 0.44,
  ease: expandEase,
  /** Entrada do pill ligeiramente após o painel começar a fechar */
  delay: 0.08,
} as const;
