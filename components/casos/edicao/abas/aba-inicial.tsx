"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CasoEditTabCardHeader } from "../caso-edit-card-header";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormInformacoesAdicionais } from "@/components/fields/caso-form-informacoes-adicionais";
import { CasoFormAnexo } from "@/components/fields/caso-form-anexo";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { CasoEditCardClassificacao } from "../caso-edit-card-classificacao";

/**
 * Conteúdo da aba Inicial: Informações + Classificação e Origem (coluna esquerda).
 * A coluna direita (Status, Dados do Produto, Atribuição) é exibida pelo CasoEditView em todas as abas.
 */
export function AbaInicial() {
  const informacoesPreset = CARD_HEADER_PRESETS.informacoes;

  return (
    <div className="flex flex-col gap-2 h-full">
      <Card className="bg-card shadow-card rounded-lg h-full">
        <CasoEditTabCardHeader
          title="Informações"
          icon={informacoesPreset.icon}
          iconClassName={informacoesPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="p-6 pt-2 space-y-2">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <CasoFormInformacoesAdicionais />
            <CasoFormAnexo />
          </div>
        </CardContent>
      </Card>

      <CasoEditCardClassificacao />
    </div>
  );
}
