"use client";

import { cn } from "@/lib/utils";
import {
  isMelhoriaAprovada,
  isMelhoriaConcluida,
  isMelhoriaPendente,
  isMelhoriaRecusada,
} from "@/components/melhorias/melhoria-status";

interface MelhoriasSituacaoBadgesProps {
  status: string | null | undefined;
  concluido: string | null | undefined;
}

function SituacaoBadge({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function MelhoriasSituacaoBadges({
  status,
  concluido,
}: MelhoriasSituacaoBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {isMelhoriaPendente(status) ? (
        <SituacaoBadge className="border-border-divider bg-muted text-text-secondary">
          Aguardando avaliação
        </SituacaoBadge>
      ) : null}
      {isMelhoriaAprovada(status) ? (
        <SituacaoBadge className="border-transparent bg-panel-badge-fixed-bg text-panel-badge-fixed">
          Aprovada
        </SituacaoBadge>
      ) : null}
      {isMelhoriaRecusada(status) ? (
        <SituacaoBadge className="border-destructive/30 bg-destructive/10 text-destructive">
          Recusada
        </SituacaoBadge>
      ) : null}
      {isMelhoriaConcluida(concluido) ? (
        <SituacaoBadge className="border-border-divider bg-background font-medium text-text-secondary">
          Concluída
        </SituacaoBadge>
      ) : null}
    </div>
  );
}
