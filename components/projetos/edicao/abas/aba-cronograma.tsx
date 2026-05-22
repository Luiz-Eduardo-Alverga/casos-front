"use client";

import { AbaCronograma } from "@/components/projetos/edicao/cronograma";

export interface AbaCronogramaTabProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaCronogramaTab({ projetoId, enabled }: AbaCronogramaTabProps) {
  return <AbaCronograma projetoId={projetoId} enabled={enabled} />;
}
