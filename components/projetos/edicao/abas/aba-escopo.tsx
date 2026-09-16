"use client";

import { AbaEscopo } from "@/components/projetos/edicao/escopo";

export interface AbaEscopoTabProps {
  projetoId: number | string;
  setorProjeto?: string;
  enabled?: boolean;
}

export function AbaEscopoTab({
  projetoId,
  setorProjeto,
  enabled,
}: AbaEscopoTabProps) {
  return (
    <AbaEscopo
      projetoId={projetoId}
      setorProjeto={setorProjeto}
      enabled={enabled}
    />
  );
}
