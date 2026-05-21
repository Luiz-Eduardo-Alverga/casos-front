"use client";

import { AbaStakes } from "@/components/projetos/edicao/stakes";

export interface AbaStakesTabProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaStakesTab({ projetoId, enabled }: AbaStakesTabProps) {
  return <AbaStakes projetoId={projetoId} enabled={enabled} />;
}
