"use client";

import { ProjetoCreateLeftColumn } from "@/components/projetos/cadastro/projeto-create-left-column";
import { ProjetoCreateRightColumn } from "@/components/projetos/cadastro/projeto-create-right-column";

export interface ProjetoAberturaFormProps {
  objetivoFallback?: { value: string; label: string };
}

/** Layout compartilhado da aba Abertura (cadastro e edição). */
export function ProjetoAberturaForm({
  objetivoFallback,
}: ProjetoAberturaFormProps) {
  return (
    <div className="flex min-h-0 flex-col gap-6 lg:flex-row">
      <ProjetoCreateLeftColumn />
      <ProjetoCreateRightColumn objetivoFallback={objetivoFallback} />
    </div>
  );
}
