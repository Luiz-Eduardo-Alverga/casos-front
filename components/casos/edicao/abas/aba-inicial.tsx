"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "../caso-edit-card-header";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormInformacoesAdicionais } from "@/components/fields/caso-form-informacoes-adicionais";
import { FileText } from "lucide-react";
import { CasoEditCardClassificacao } from "../caso-edit-card-classificacao";
import { useCasoEdit } from "../caso-edit-context";

/**
 * Conteúdo da aba Inicial: Informações + Classificação e Origem (coluna esquerda).
 * A coluna direita (Status, Dados do Produto, Atribuição) é exibida pelo CasoEditView em todas as abas.
 */
export function AbaInicial() {
  const { numeroCaso } = useCasoEdit();

  return (
    <div className="flex flex-col gap-2 h-full">
      <Card className="bg-card shadow-card rounded-lg h-full">
        <CasoEditCardHeader
          title="Informações"
          icon={FileText}
          badge={numeroCaso}
          shrink={false}
        />
        <CardContent className="p-6 pt-2 space-y-2">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
          <CasoFormInformacoesAdicionais />
        </CardContent>
      </Card>

      <CasoEditCardClassificacao />
    </div>
  );
}
