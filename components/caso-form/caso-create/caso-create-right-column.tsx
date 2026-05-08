"use client";

import { NaoPlanejadoField } from "@/components/caso-edit/producao/nao-planejado-field";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Package, Users } from "lucide-react";

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
  return (
    <div className="flex w-full flex-col gap-6 lg:w-[362px]">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Dados do Produto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <CasoFormProduto />
          <CasoFormVersao todas={false} />
          <CasoFormModulo required={false} />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-5 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Atribuição
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-3">
          <CasoFormDevAtribuido />
          <CasoFormQaAtribuido />
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
              ? "Criando Caso..."
              : "Criar Caso"}
        </Button>
      </div>
    </div>
  );
}
