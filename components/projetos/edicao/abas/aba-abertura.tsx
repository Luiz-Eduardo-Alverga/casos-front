"use client";

import { ProjetoAberturaForm } from "@/components/projetos/shared/projeto-abertura-form";

export interface AbaAberturaProps {
  objetivoFallback?: { value: string; label: string };
}

export function AbaAbertura({ objetivoFallback }: AbaAberturaProps) {
  return <ProjetoAberturaForm objetivoFallback={objetivoFallback} />;
}
