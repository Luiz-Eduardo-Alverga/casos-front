import type { StatusBadgeConfigItem } from "@/components/badges/status-badge";

export const TICKET_STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["FINALIZADO", "CONCLUIDO", "CONCLUÍDO"],
    style: {
      container: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
      dot: "bg-green-500 dark:bg-green-400",
      text: "text-green-700 dark:text-green-400",
    },
  },
  {
    values: ["PENDENTE"],
    style: {
      container: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800",
      dot: "bg-orange-500 dark:bg-orange-400",
      text: "text-orange-700 dark:text-orange-400",
    },
  },
  {
    values: ["ABERTO", "EM ANDAMENTO", "ANDAMENTO"],
    style: {
      container: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
      dot: "bg-blue-500 dark:bg-blue-400",
      text: "text-blue-700 dark:text-blue-400",
    },
  },
  {
    values: ["CANCELADO", "CANCELADA"],
    style: {
      container: "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800",
      dot: "bg-red-500 dark:bg-red-400",
      text: "text-red-700 dark:text-red-400",
    },
  },
  {
    values: [],
    style: {
      container: "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
      dot: "bg-gray-500 dark:bg-gray-400",
      text: "text-gray-700 dark:text-gray-300",
    },
  },
];
