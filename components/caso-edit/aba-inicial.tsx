"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import {
  CasoFormDescricaoResumo,
  CasoFormDescricaoCompleta,
  CasoFormInformacoesAdicionais,
} from "@/components/caso-form";
import { FileText } from "lucide-react";
import { CasoEditCardClassificacao } from "./caso-edit-card-classificacao";

export interface AbaInicialProps {
  casoId: number;
}

/**
 * Conteúdo da aba Inicial: Informações + Classificação e Origem (coluna esquerda).
 * A coluna direita (Status, Dados do Produto, Atribuição) é exibida pelo CasoEditView em todas as abas.
 */
export function AbaInicial({ casoId }: AbaInicialProps) {
  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="bg-card shadow-card rounded-lg h-full">
        <CasoEditCardHeader
          title="Informações"
          icon={FileText}
          badge={casoId}
          shrink={false}
        />
        <CardContent className="p-6 pt-3 space-y-4 ">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
          <CasoFormInformacoesAdicionais />
        </CardContent>
      </Card>

      <CasoEditCardClassificacao casoId={casoId} />
    </div>
  );
}
