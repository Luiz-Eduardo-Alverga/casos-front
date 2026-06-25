"use client";

import { NaoPlanejadoField } from "@/components/casos/edicao/producao/nao-planejado-field";
import { CasoEditCardHeader } from "@/components/casos/edicao/caso-edit-card-header";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { Check } from "lucide-react";

export interface CasoCreateRightColumnProps {
  naoPlanejado: boolean;
  onNaoPlanejadoChange: (checked: boolean) => void;
  isSubmitting: boolean;
  isCreatingCaso: boolean;
  isUploadingAttachments: boolean;
}

export function CasoCreateRightColumn({
  naoPlanejado,
  onNaoPlanejadoChange,
  isSubmitting,
  isCreatingCaso,
  isUploadingAttachments,
}: CasoCreateRightColumnProps) {
  const dadosProdutoPreset = CARD_HEADER_PRESETS.dadosProduto;
  const atribuicaoPreset = CARD_HEADER_PRESETS.atribuicao;

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 lg:w-[362px]">
      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Dados do Produto"
          icon={dadosProdutoPreset.icon}
          iconClassName={dadosProdutoPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="space-y-2 p-6 pt-2">
          <CasoFormProduto />
          <CasoFormVersao todas={false} />
          <CasoFormModulo required={false} />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CasoEditCardHeader
          title="Atribuição"
          icon={atribuicaoPreset.icon}
          iconClassName={atribuicaoPreset.iconClassName}
          shrink={false}
        />
        <CardContent className="space-y-2 p-6 pt-2">
          <CasoFormDevAtribuido requireProjeto />
          <CasoFormQaAtribuido requireProjeto />
        </CardContent>
      </Card>

      <NaoPlanejadoField
        checked={naoPlanejado}
        onCheckedChange={onNaoPlanejadoChange}
        id="caso-create-nao-planejado"
        disabled={isCreatingCaso || isSubmitting}
      />

      <div className="rounded-lg border border-border-accent bg-gradient-to-br from-bg-accent-start to-bg-accent-end p-5">
        <Button
          type="submit"
          className="w-full"
          disabled={isCreatingCaso || isSubmitting || isUploadingAttachments}
        >
          <Check className="h-3.5 w-3.5" />
          {isUploadingAttachments
            ? "Enviando anexos..."
            : isCreatingCaso || isSubmitting
              ? "Abrindo Caso..."
              : "Abrir Caso"}
        </Button>
      </div>
    </div>
  );
}
