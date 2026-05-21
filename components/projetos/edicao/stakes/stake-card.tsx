"use client";

import { SquarePen, Trash2 } from "lucide-react";

import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

import type { SgpStakeItem } from "@/interfaces/sgp-stake";

import { StakeTipoBadge } from "@/components/projetos/edicao/stakes/stake-tipo-badge";

import {
  formatSgpHorasCurto,
  formatStakeCardTotal,
} from "@/components/projetos/edicao/stakes/utils";

import { cn } from "@/lib/utils";

export interface StakeCardProps {
  stake: SgpStakeItem;
  tipoLabel: string;
  onEditar?: (stake: SgpStakeItem) => void;
  onExcluir?: (stake: SgpStakeItem) => void;
}

type MetricVariant = "default" | "highlight";

function MetricBox({
  label,

  value,

  variant = "default",
}: {
  label: string;

  value: string;

  variant?: MetricVariant;
}) {
  const isHighlight = variant === "highlight";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-lg border p-[9px]",

        isHighlight
          ? "border-border-accent bg-bg-accent-start"
          : "border-border-divider bg-card",
      )}
    >
      <p
        className={cn(
          "text-center text-xs leading-4",

          isHighlight ? "text-public-info-text" : "text-text-secondary",
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          "text-center text-sm font-bold leading-5",

          isHighlight ? "text-public-info-text" : "text-text-primary",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function StakeCard({
  stake,
  tipoLabel,
  onEditar,
  onExcluir,
}: StakeCardProps) {
  const handleEmBreve = () => toast("Em breve");

  const handleEditar = () => {
    if (onEditar) onEditar(stake);
    else handleEmBreve();
  };

  const handleExcluir = () => {
    if (onExcluir) onExcluir(stake);
    else handleEmBreve();
  };

  return (
    <article className="flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-gradient-to-br from-background to-muted px-[15px] py-[21px]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold leading-6 text-text-primary">
            {stake.nomes?.trim() || "—"}
          </h3>

          <div className="mt-1">
            <StakeTipoBadge idTipo={stake.id_tipo} label={tipoLabel} />
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 px-1"
            onClick={handleEditar}
            aria-label="Editar stakeholder"
          >
            <SquarePen className="h-4 w-4 text-text-primary" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 px-1 text-destructive hover:text-destructive"
            onClick={handleExcluir}
            aria-label="Excluir stakeholder"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <MetricBox
          label="Planejadas"
          value={formatSgpHorasCurto(stake.horas_disponiveis)}
        />

        <MetricBox
          label="Não planejadas"
          value={formatSgpHorasCurto(stake.horas_nao_planejadas)}
        />

        <MetricBox
          label="Dias"
          value={stake.dias_uteis != null ? String(stake.dias_uteis) : "—"}
        />

        <MetricBox
          label="Total"
          variant="highlight"
          value={formatStakeCardTotal(stake)}
        />
      </div>
    </article>
  );
}
