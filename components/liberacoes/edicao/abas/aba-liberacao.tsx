"use client";

import { IdentidadeCard } from "@/components/liberacoes/edicao/liberacao/identidade-card";
import { PilotoCard } from "@/components/liberacoes/edicao/liberacao/piloto-card";
import { VersaoFinalCard } from "@/components/liberacoes/edicao/liberacao/versao-final-card";
import { FlagsCard } from "@/components/liberacoes/edicao/liberacao/flags-card";
import { VersoesCard } from "@/components/liberacoes/edicao/liberacao/versoes-card";
import type { LiberacaoItem } from "@/interfaces/liberacao";

export interface AbaLiberacaoProps {
  liberacao: LiberacaoItem;
  disabled?: boolean;
}

export function AbaLiberacao({ liberacao, disabled }: AbaLiberacaoProps) {
  return (
    <div className="flex flex-col gap-6 pb-6 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <IdentidadeCard liberacao={liberacao} disabled={disabled} />
        <FlagsCard liberacao={liberacao} disabled={disabled} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <VersoesCard
          registro={liberacao.registro}
          produtoId={liberacao.produto_id}
          versoes={liberacao.versoes}
          disabled={disabled}
        />
        <PilotoCard disabled={disabled} />
        <VersaoFinalCard liberacao={liberacao} disabled={disabled} />
      </div>
    </div>
  );
}
