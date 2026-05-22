"use client";

import { AbaEscopo } from "@/components/projetos/edicao/escopo";

export interface AbaEscopoTabProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaEscopoTab({ projetoId, enabled }: AbaEscopoTabProps) {
  return <AbaEscopo projetoId={projetoId} enabled={enabled} />;
}
