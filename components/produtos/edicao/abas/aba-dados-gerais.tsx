"use client";

import { ProdutoDadosForm } from "@/components/produtos/cadastro/produto-dados-form";
import { ProdutoExibicaoSwitches } from "@/components/produtos/cadastro/produto-exibicao-switches";
import type { ProdutoDadosFormProps } from "@/components/produtos/cadastro/produto-dados-form";

export interface AbaDadosGeraisProps extends ProdutoDadosFormProps {
  somenteLeitura?: boolean;
}

export function AbaDadosGerais({
  somenteLeitura = false,
  ...props
}: AbaDadosGeraisProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ProdutoDadosForm {...props} somenteLeitura={somenteLeitura} />
      <ProdutoExibicaoSwitches somenteLeitura={somenteLeitura} />
    </div>
  );
}
