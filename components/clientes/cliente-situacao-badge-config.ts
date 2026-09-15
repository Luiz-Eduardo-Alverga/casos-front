import type { StatusBadgeConfigItem } from "@/components/badges/status-badge";

/** Inativo e bloqueado — vermelho (destructive). */
const CLIENTE_SITUACAO_NEGATIVA_STYLE = {
  container: "border-destructive/30 bg-destructive/10",
  dot: "bg-destructive",
  text: "text-destructive",
};

/**
 * Badges de situação do cliente (listagem e detalhe).
 * INATIVO deve vir antes de ATIVO: o matcher usa `includes` e "INATIVO" contém "ATIVO".
 */
export const CLIENTE_SITUACAO_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["INATIVO"],
    style: CLIENTE_SITUACAO_NEGATIVA_STYLE,
  },
  {
    values: ["BLOQUEADO"],
    style: CLIENTE_SITUACAO_NEGATIVA_STYLE,
  },
  {
    values: ["ATIVO"],
    style: {
      container:
        "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
      dot: "bg-green-500 dark:bg-green-400",
      text: "text-green-700 dark:text-green-400",
    },
  },
  {
    values: [],
    style: {
      container:
        "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
];
