"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CasoFormDescricaoResumo,
  CasoFormDescricaoCompleta,
  CasoFormInformacoesAdicionais,
} from "@/components/caso-form";
import { FileText } from "lucide-react";
import { CasoEditCardClassificacao } from "./caso-edit-card-classificacao";

/**
 * Conteúdo da aba Inicial: Informações + Classificação e Origem (coluna esquerda).
 * A coluna direita (Status, Dados do Produto, Atribuição) é exibida pelo CasoEditView em todas as abas.
 */
export function AbaInicial() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="bg-card shadow-card rounded-lg h-full">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Informações
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4 ">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
          <CasoFormInformacoesAdicionais />
        </CardContent>
      </Card>

      <CasoEditCardClassificacao />
    </div>
  );
}
