"use client";

import {
  AlertCircle,
  Shield,
  ShieldAlert,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import { RiscoPrioridadeBadge } from "@/components/projetos/edicao/risco/risco-prioridade-badge";
import { formatRiscoNivel } from "@/components/projetos/edicao/risco/utils";

export interface RiscoCardProps {
  item: SgpRiscoItem;
  onEditar?: (item: SgpRiscoItem) => void;
  onExcluir?: (item: SgpRiscoItem) => void;
}

function RiscoDetailLine({
  icon: Icon,
  children,
}: {
  icon: typeof AlertCircle;
  children: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate" title={children}>
        {children}
      </span>
    </div>
  );
}

function RiscoObservacaoLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-xs leading-4 text-text-secondary">
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate" title={`${label}: ${value}`}>
        {label}: {value}
      </span>
    </div>
  );
}

export function RiscoCard({ item, onEditar, onExcluir }: RiscoCardProps) {
  const titulo = item.descricao_risco?.trim() || "—";
  const mitigacao = item.mitigacao?.trim() || "";
  const contingencia = item.contingencia?.trim() || "";

  return (
    <article className="flex min-w-0 flex-col justify-between rounded-lg border border-border-divider bg-background p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <RiscoPrioridadeBadge prioridade={item.prioridade} />
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 px-1"
              onClick={() => onEditar?.(item)}
              disabled={!onEditar}
              aria-label="Editar risco"
            >
              <SquarePen className="h-4 w-4 text-text-secondary" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 px-1 text-destructive"
              onClick={() => onExcluir?.(item)}
              disabled={!onExcluir}
              aria-label="Excluir risco"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h3 className="mt-3 text-sm font-semibold leading-5 text-text-primary">
          {titulo}
        </h3>
      </div>

      <div className="mt-3 min-w-0 space-y-2 text-sm text-text-secondary">
        <RiscoDetailLine icon={AlertCircle}>
          {`Probabilidade: ${formatRiscoNivel(item.probalidade)}`}
        </RiscoDetailLine>
        <RiscoDetailLine icon={ShieldAlert}>
          {`Impacto: ${formatRiscoNivel(item.impacto)}`}
        </RiscoDetailLine>

        {mitigacao ? (
          <RiscoObservacaoLine
            icon={Shield}
            label="Mitigação"
            value={mitigacao}
          />
        ) : null}
        {contingencia ? (
          <RiscoObservacaoLine
            icon={Shield}
            label="Contingência"
            value={contingencia}
          />
        ) : null}
      </div>
    </article>
  );
}
