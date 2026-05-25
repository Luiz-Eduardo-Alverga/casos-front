"use client";

import {
  AlertCircle,
  Check,
  Shield,
  ShieldAlert,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import { cn } from "@/lib/utils";
import { RiscoPrioridadeBadge } from "@/components/projetos/edicao/risco/risco-prioridade-badge";
import { formatRiscoNivel } from "@/components/projetos/edicao/risco/utils";

const RISCO_CARD_SELECTED_SHADOW = "shadow-[0px_0px_0px_2px_#1e2330]";

export interface RiscoCardProps {
  item: SgpRiscoItem;
  selected?: boolean;
  onSelecionar?: (item: SgpRiscoItem) => void;
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

export function RiscoCard({
  item,
  selected = false,
  onSelecionar,
  onEditar,
  onExcluir,
}: RiscoCardProps) {
  const titulo = item.descricao_risco?.trim() || "—";
  const mitigacao = item.mitigacao?.trim() || "";
  const contingencia = item.contingencia?.trim() || "";
  const selecionavel = Boolean(onSelecionar);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!selecionavel) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelecionar?.(item);
    }
  };

  return (
    <article
      role={selecionavel ? "button" : undefined}
      tabIndex={selecionavel ? 0 : undefined}
      aria-selected={selecionavel ? selected : undefined}
      onClick={selecionavel ? () => onSelecionar?.(item) : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex min-w-0 flex-col justify-between rounded-lg border border-border-divider bg-background p-4 transition-shadow",
        selecionavel && "cursor-pointer",
        selected && RISCO_CARD_SELECTED_SHADOW,
      )}
    >
      {selected ? (
        <span
          className="absolute right-0 top-0 z-10 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-[#1e2330] text-white"
          aria-hidden
        >
          <Check className="h-3 w-3" strokeWidth={2.5} />
        </span>
      ) : null}

      <div>
        <div className="flex items-start justify-between gap-2">
          <RiscoPrioridadeBadge prioridade={item.prioridade} />
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 px-1"
              onClick={(e) => {
                e.stopPropagation();
                onEditar?.(item);
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onExcluir?.(item);
              }}
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
