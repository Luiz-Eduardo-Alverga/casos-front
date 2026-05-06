"use client";

import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormInformacoesAdicionais } from "@/components/fields/caso-form-informacoes-adicionais";
import { CasoFormOrigem } from "@/components/fields/caso-form-origem";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap, Bug, FileText } from "lucide-react";

export interface ReportsFormLeftColumnProps {
  quickMode: boolean;
  attachmentCount: number;
  onOpenAnexos: () => void;
}

export function ReportsFormLeftColumn({
  quickMode,
  attachmentCount,
  onOpenAnexos,
}: ReportsFormLeftColumnProps) {
  return (
    <div className="flex-1 flex flex-col gap-0">
      <Card className="bg-card shadow-card rounded-lg">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex justify-between items-center gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-text-primary" />
              <CardTitle className="text-sm font-semibold text-text-primary">
                Informações
              </CardTitle>
            </div>

            <div>
              {quickMode && (
                <Badge
                  variant="secondary"
                  className="h-7 shrink-0 rounded-full border-transparent bg-sky-100 px-2.5 text-sm font-semibold text-text-primary hover:bg-sky-100/80"
                >
                  <Zap className="h-3.5 w-3.5 mr-2" />
                  Modo de preenchimento rápido ativo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3 space-y-4">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta
            showAnexosTrigger
            anexosCount={attachmentCount}
            onOpenAnexos={onOpenAnexos}
          />
          <CasoFormInformacoesAdicionais />
        </CardContent>
      </Card>

      <Card className="bg-card shadow-card rounded-lg mt-auto">
        <CardHeader className="p-5 pb-2 border-b border-border-divider">
          <div className="flex items-center gap-2">
            <Bug className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Classificação e Origem
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
            <CasoFormImportancia />
            <CasoFormOrigem />
            <CasoFormCategoria />
            <CasoFormRelator />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
