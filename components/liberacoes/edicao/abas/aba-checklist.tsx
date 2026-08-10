"use client";

import { AbaChecklist as AbaChecklistFeature } from "@/components/liberacoes/edicao/checklist";

export interface AbaChecklistProps {
  registro: number | string;
  enabled?: boolean;
  disabled?: boolean;
}

export function AbaChecklist(props: AbaChecklistProps) {
  return <AbaChecklistFeature {...props} />;
}
