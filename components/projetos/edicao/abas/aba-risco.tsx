"use client";

import { AbaRisco } from "@/components/projetos/edicao/risco";

export interface AbaRiscoTabProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaRiscoTab({ projetoId, enabled }: AbaRiscoTabProps) {
  return <AbaRisco projetoId={projetoId} enabled={enabled} />;
}
