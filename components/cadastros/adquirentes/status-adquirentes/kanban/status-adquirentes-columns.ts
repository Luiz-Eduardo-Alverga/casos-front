"use client";

import type { AcquirerStatusKanbanColumn } from "@/components/cadastros/adquirentes/adquirentes-shared";
import { ACQUIRER_STATUS_KANBAN_ORDER } from "@/components/cadastros/adquirentes/adquirentes-shared";

export interface StatusAdquirentesColumnMeta extends Record<string, unknown> {
  id: AcquirerStatusKanbanColumn;
  name: string;
  dotClass: string;
  emptyTitle: string;
  emptyDescription: string;
  badgeClass: string;
}

export const STATUS_ADQUIRENTES_COLUMNS: StatusAdquirentesColumnMeta[] =
  ACQUIRER_STATUS_KANBAN_ORDER.map((status) => {
    switch (status) {
      case "Em homologação":
        return {
          id: status,
          name: "Em homologação",
          dotClass: "bg-slate-400",
          emptyTitle: "Nenhum item em homologação",
          emptyDescription: "Não há adquirentes nesta etapa.",
          badgeClass: "bg-slate-200 text-slate-600",
        };
      case "Em desenvolvimento":
        return {
          id: status,
          name: "Em desenvolvimento",
          dotClass: "bg-blue-400",
          emptyTitle: "Nenhum item em desenvolvimento",
          emptyDescription: "Não há adquirentes nesta etapa.",
          badgeClass: "bg-blue-100 text-blue-700",
        };
      case "Em teste":
        return {
          id: status,
          name: "Em teste",
          dotClass: "bg-blue-500",
          emptyTitle: "Nenhum item em teste",
          emptyDescription: "Não há adquirentes nesta etapa.",
          badgeClass: "bg-blue-100 text-blue-700",
        };
      case "Em certificação":
        return {
          id: status,
          name: "Em certificação",
          dotClass: "bg-orange-500",
          emptyTitle: "Nenhum item em certificação",
          emptyDescription: "Não há adquirentes nesta etapa.",
          badgeClass: "bg-orange-100 text-orange-700",
        };
      case "Concluído":
      default:
        return {
          id: "Concluído",
          name: "Concluídos",
          dotClass: "bg-emerald-500",
          emptyTitle: "Nenhum item concluído",
          emptyDescription: "Não há adquirentes nesta etapa.",
          badgeClass: "bg-emerald-100 text-emerald-700",
        };
    }
  });
