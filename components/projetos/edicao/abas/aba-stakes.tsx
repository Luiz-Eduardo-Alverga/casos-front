"use client";

import { AbaStakes } from "@/components/projetos/edicao/stakes";

export interface AbaStakesTabProps {
  projetoId: number | string;
  nomeProjeto?: string;
  setorProjeto?: string;
  enabled?: boolean;
}

export function AbaStakesTab({
  projetoId,
  nomeProjeto,
  setorProjeto,
  enabled,
}: AbaStakesTabProps) {
  return (
    <AbaStakes
      projetoId={projetoId}
      nomeProjeto={nomeProjeto}
      setorProjeto={setorProjeto}
      enabled={enabled}
    />
  );
}
