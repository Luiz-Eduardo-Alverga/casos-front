"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import { CasoFormProduto } from "@/components/fields/caso-form-produto";
import { CasoFormVersao } from "@/components/fields/caso-form-versao";
import { CasoFormProjeto } from "@/components/fields/caso-form-projeto";
import { CasoFormModulo } from "@/components/fields/caso-form-modulo";
import { CasoFormDevAtribuido } from "@/components/fields/caso-form-dev-atribuido";
import { CasoFormQaAtribuido } from "@/components/fields/caso-form-qa-atribuido";
import { useCasoForm } from "@/components/fields/caso-form-provider";
import { CARD_HEADER_PRESETS } from "@/lib/casos/card-header-theme";
import { Sparkles } from "lucide-react";
import { CasoResumoStatusActions } from "@/components/caso-resumo-modal/caso-resumo-status-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ReportAnaliseModal } from "./report-analise-modal";
import { useCasoEdit } from "./caso-edit-context";

export function CasoEditColunaDireita() {
  const {
    memoriaQueryId,
    invalidate,
    isSaving,
    canEditCase,
    statusIdApi,
    onSalvar,
    getReportStatusFromCasoStatus,
  } = useCasoEdit();
  const { editCaseItem } = useCasoForm();
  const report = editCaseItem?.report;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!report) {
    return null;
  }

  const openingType = report.tipo_abertura ?? "CASO";
  const isReport = openingType === "REPORT";
  const disabled = isSaving || !canEditCase;
  const dadosProdutoPreset = CARD_HEADER_PRESETS.dadosProduto;
  const atribuicaoPreset = CARD_HEADER_PRESETS.atribuicao;

  return (
    <>
      <div className="w-full lg:w-[362px] flex flex-col gap-2 shrink-0">
        <Card className="bg-card shadow-card rounded-lg">
          <CardContent className=" space-y-2 p-4 ">
            <CasoResumoStatusActions
              statusIdApi={statusIdApi}
              memoriaQueryId={memoriaQueryId}
              onStatusUpdated={invalidate}
              getReportStatusFromCasoStatus={
                isReport ? getReportStatusFromCasoStatus : undefined
              }
            />

            {isReport && (
              <>
                <Separator />

                <Button
                  type="button"
                  onClick={() => setIsReportModalOpen(true)}
                  className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:opacity-90 px-4 flex-1 sm:flex-initial"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Análise Report
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card  shadow-card rounded-lg">
          <CasoEditCardHeader
            title="Dados do Produto"
            icon={dadosProdutoPreset.icon}
            iconClassName={dadosProdutoPreset.iconClassName}
            shrink={false}
          />
          <CardContent className="p-6 pt-2 space-y-2">
            <CasoFormProduto />
            <CasoFormVersao todas={false} />
            <CasoFormModulo required={false} />
            <CasoFormProjeto />
          </CardContent>
        </Card>

        <Card className="bg-card shadow-card rounded-lg">
          <CasoEditCardHeader
            title="Atribuição"
            icon={atribuicaoPreset.icon}
            iconClassName={atribuicaoPreset.iconClassName}
            shrink={false}
          />
          <CardContent className="p-6 pt-2 space-y-2">
            <CasoFormDevAtribuido />
            <CasoFormQaAtribuido />
          </CardContent>
        </Card>
      </div>

      {isReport ? (
        <ReportAnaliseModal
          open={isReportModalOpen}
          onOpenChange={setIsReportModalOpen}
          report={report}
          onSalvar={onSalvar}
          isLoading={isSaving}
          disabled={disabled}
        />
      ) : null}
    </>
  );
}
