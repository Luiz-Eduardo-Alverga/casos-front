"use client";

import { ClipboardCheck } from "lucide-react";
import { EmptyState } from "@/components/painel/empty-state";
import type { AuditoriaEmptyStateProps } from "./types";

export function AuditoriaEmptyState({ variant }: AuditoriaEmptyStateProps) {
  const isSemAuditoria = variant === "sem_auditoria";

  return (
    <EmptyState
      icon={ClipboardCheck}
      title={
        isSemAuditoria
          ? "Nenhuma auditoria realizada"
          : "Nenhum resultado encontrado"
      }
      description={
        isSemAuditoria
          ? "Preencha os filtros e clique em Auditar Squad agora para visualizar o resumo e os colaboradores."
          : "Não há dados de produção para os filtros selecionados. Tente outra data ou colaborador."
      }
    />
  );
}
