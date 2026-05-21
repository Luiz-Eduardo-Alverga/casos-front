"use client";

import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import {
  computeStakesHorasTotais,
  formatHorasResumoTotais,
} from "@/components/projetos/edicao/stakes/utils";

export interface StakesSummaryProps {
  stakes: SgpStakeItem[];
}

function SummaryItem({
  label,
  value,
  primaryColor,
  secondaryColor,
}: {
  label: string;
  value: string;
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <div className="flex flex-col text-center">
      <span className={`text-xs ${primaryColor}`}>{label}</span>
      <span className={`text-xl font-semibold  ${secondaryColor}`}>
        {value}
      </span>
    </div>
  );
}

export function StakesSummary({ stakes }: StakesSummaryProps) {
  const { planejadasMin, naoPlanejadasMin, totalGeralMin } =
    computeStakesHorasTotais(stakes);

  return (
    <div className="flex flex-wrap items-center justify-end gap-6 rounded-lg border border-border-divider bg-muted/20 px-4 py-3">
      <SummaryItem
        label="Horas planejadas"
        value={formatHorasResumoTotais(planejadasMin)}
        primaryColor="text-text-secondary"
        secondaryColor="text-text-primary"
      />
      <div className="hidden h-10 w-px bg-border-divider sm:block" />
      <SummaryItem
        label="Horas não planejadas"
        value={formatHorasResumoTotais(naoPlanejadasMin)}
        primaryColor="text-text-secondary"
        secondaryColor="text-text-primary"
      />
      <div className="hidden h-10 w-px bg-border-divider sm:block text-blue-500" />
      <SummaryItem
        label="Total geral"
        value={formatHorasResumoTotais(totalGeralMin)}
        primaryColor="text-blue-500"
        secondaryColor="text-blue-500"
      />
    </div>
  );
}
