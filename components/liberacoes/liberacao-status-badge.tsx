"use client";

import { StatusBadge, type StatusBadgeConfigItem } from "@/components/badges/status-badge";

export const LIBERACAO_STATUS_BADGE_CONFIG: StatusBadgeConfigItem[] = [
  {
    values: ["FECHADO"],
    style: {
      container:
        "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800",
      dot: "bg-green-500 dark:bg-green-400",
      text: "text-green-700 dark:text-green-400",
    },
  },
  {
    values: ["ABERTO"],
    style: {
      container:
        "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
      dot: "bg-blue-500 dark:bg-blue-400",
      text: "text-blue-700 dark:text-blue-400",
    },
  },
];

interface LiberacaoStatusBadgeProps {
  status: string;
  className?: string;
}

export function LiberacaoStatusBadge({ status, className }: LiberacaoStatusBadgeProps) {
  return (
    <StatusBadge
      status={status}
      config={LIBERACAO_STATUS_BADGE_CONFIG}
      className={className}
    />
  );
}
