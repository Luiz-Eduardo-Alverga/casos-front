"use client";

import { useDbCadastroList } from "@/hooks/use-db-cadastro-list";
import { STATUS_TYPE_VALUES } from "@/lib/validators/db/shared";
import { listAcquirersClient } from "@/services/db-api/list-cadastros";
import type { AcquirerListExpandedItem } from "@/components/cadastros/types";

export const ACQUIRER_STATUS_KANBAN_ORDER = [
  "Em homologação",
  "Em desenvolvimento",
  "Em teste",
  "Em certificação",
  "Concluído",
] as const satisfies readonly (typeof STATUS_TYPE_VALUES)[number][];

export type AcquirerStatusKanbanColumn = (typeof ACQUIRER_STATUS_KANBAN_ORDER)[number];

export function isAcquirerStatusKanbanColumn(
  status: string | null | undefined,
): status is AcquirerStatusKanbanColumn {
  if (!status) return false;
  return (ACQUIRER_STATUS_KANBAN_ORDER as readonly string[]).includes(status);
}

export function useAdquirentesList(initialSearch: string, initialStatus: string) {
  return useDbCadastroList<AcquirerListExpandedItem>({
    queryKeyPrefix: "db-acquirers",
    queryKeyExtra: "expand-status",
    initialSearch,
    acquirerStatusFilter: { initial: initialStatus },
    fetcher: (search, opts) =>
      listAcquirersClient(search, {
        expand: "status",
        status: opts?.status,
      }),
  });
}

export function hasAdquirentesFiltrosAtivos(params: {
  searchInput: string;
  initialSearch: string;
  statusValue?: string;
  initialStatus: string;
}) {
  return (
    params.searchInput.trim().length > 0 ||
    params.initialSearch.trim().length > 0 ||
    (params.statusValue?.trim().length ?? 0) > 0 ||
    params.initialStatus.trim().length > 0
  );
}

export function getAcquirerStatusDotClass(status: string | null): string {
  switch (status) {
    case "Concluído":
      return "bg-emerald-500";
    case "Em certificação":
      return "bg-orange-500";
    case "Em homologação":
      return "bg-slate-400";
    case "Em teste":
      return "bg-blue-500";
    case "Em desenvolvimento":
      return "bg-blue-400";
    default:
      return "bg-muted-foreground/40";
  }
}

export function getStatusLabel(status: AcquirerStatusKanbanColumn): string {
  if (status === "Concluído") return "Concluídos";
  return status;
}

export function formatDeliveryDate(dateString: string | null): string {
  if (!dateString) return "—";
  const [year, month, day] = dateString.split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}
