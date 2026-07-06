import type { StatusBadgeConfigItem } from "@/components/badges/status-badge";

export const TICKET_STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["FINALIZADO", "CONCLUIDO", "CONCLUÍDO"],
    style: {
      container: "bg-green-50 border-green-200",
      dot: "bg-green-500",
      text: "text-green-700",
    },
  },
  {
    values: ["PENDENTE"],
    style: {
      container: "bg-orange-50 border-orange-200",
      dot: "bg-orange-500",
      text: "text-orange-700",
    },
  },
  {
    values: ["ABERTO", "EM ANDAMENTO", "ANDAMENTO"],
    style: {
      container: "bg-blue-50 border-blue-200",
      dot: "bg-blue-500",
      text: "text-blue-700",
    },
  },
  {
    values: ["CANCELADO", "CANCELADA"],
    style: {
      container: "bg-red-50 border-red-200",
      dot: "bg-red-500",
      text: "text-red-700",
    },
  },
  {
    values: [],
    style: {
      container: "bg-gray-50 border-gray-200",
      dot: "bg-gray-500",
      text: "text-gray-700",
    },
  },
];
