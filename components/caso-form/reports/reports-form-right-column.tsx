"use client";

import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { NaoPlanejadoField } from "@/components/caso-edit/producao/nao-planejado-field";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Package, Check } from "lucide-react";

export interface ReportsFormRightColumnProps {
  naoPlanejado: boolean;
  onNaoPlanejadoChange: (checked: boolean) => void;
  isSubmitting: boolean;
  isCreatingCaso: boolean;
  isUploadingAttachments: boolean;
}

export function ReportsFormRightColumn({
  naoPlanejado,
  onNaoPlanejadoChange,
  isSubmitting,
  isCreatingCaso,
  isUploadingAttachments,
}: ReportsFormRightColumnProps) {
  return (
    <div className="w-full lg:w-[362px] flex flex-col gap-6">
      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Dados do Produto
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormProduto />
          <CasoFormVersao todas={false} />
          <CasoFormModulo required={false} />
          <CasoFormProjeto />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Atribuição
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormDevAtribuido />
          <CasoFormQaAtribuido />
        </CardContent>
      </Card>

      <NaoPlanejadoField
        checked={naoPlanejado}
        onCheckedChange={onNaoPlanejadoChange}
        id="reports-nao-planejado"
        disabled={isCreatingCaso || isSubmitting}
      />

      <div className="border border-border-accent rounded-lg p-5 bg-gradient-to-br from-bg-accent-start to-bg-accent-end">
        <Button
          type="submit"
          className="w-full"
          disabled={
            isCreatingCaso || isSubmitting || isUploadingAttachments
          }
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
