"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CasoEditCardHeader } from "./caso-edit-card-header";
import {
  CasoFormProduto,
  CasoFormVersao,
  CasoFormProjeto,
  CasoFormModulo,
  CasoFormDevAtribuido,
  CasoFormQaAtribuido,
} from "@/components/caso-form";
import { Package, Sparkles, Users } from "lucide-react";
import { CasoResumoStatusActions } from "@/components/caso-resumo-modal/caso-resumo-status-actions";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import type { ProjetoMemoriaReport } from "@/interfaces/projeto-memoria";
import { ReportAnaliseModal } from "./report-analise-modal";

export interface CasoEditColunaDireitaProps {
  /** ID do status retornado pela API (não o valor atual do formulário). */
  statusIdApi: number;
  /** ID do caso na rota / query `projeto-memoria`. */
  memoriaQueryId: string;
  /** Invalidar dados após atualizar status. */
  onStatusUpdated: () => void;

  openingType?: "REPORT" | "CASO";
  report: ProjetoMemoriaReport;
  onSalvar: () => void;
  isSaving?: boolean;
  disabled?: boolean;
}

export function CasoEditColunaDireita({
  statusIdApi,
  memoriaQueryId,
  onStatusUpdated,
  openingType = "CASO",
  report,
  onSalvar,
  isSaving = false,
  disabled = false,
}: CasoEditColunaDireitaProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <>
      <div className="w-full lg:w-[362px] flex flex-col gap-6 shrink-0">
        <Card className="bg-card shadow-card rounded-lg">
          <CardContent className="p-6 pt-3 space-y-4">
            <CasoResumoStatusActions
              statusIdApi={statusIdApi}
              memoriaQueryId={memoriaQueryId}
              onStatusUpdated={onStatusUpdated}
            />

            {openingType === "REPORT" && (
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

        <Card className="bg-card shadow-card rounded-lg">
          <CasoEditCardHeader
            title="Dados do Produto"
            icon={Package}
            shrink={false}
          />
          <CardContent className="p-6 pt-3 space-y-4">
            <CasoFormProduto />
            <CasoFormVersao todas={false} />
            <CasoFormModulo required={false} />
            <CasoFormProjeto />
          </CardContent>
        </Card>

        <Card className="bg-card shadow-card rounded-lg">
          <CasoEditCardHeader title="Atribuição" icon={Users} shrink={false} />
          <CardContent className="p-6 pt-3 space-y-4">
            <CasoFormDevAtribuido />
            <CasoFormQaAtribuido />
          </CardContent>
        </Card>
      </div>

      {openingType === "REPORT" ? (
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
