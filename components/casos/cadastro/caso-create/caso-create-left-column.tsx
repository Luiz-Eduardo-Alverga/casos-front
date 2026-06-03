"use client";

import { CasoFormCategoria } from "@/components/fields/caso-form-categoria";
import { CasoFormDescricaoCompleta } from "@/components/fields/caso-form-descricao-completa";
import { CasoFormDescricaoResumo } from "@/components/fields/caso-form-descricao-resumo";
import { CasoFormImportancia } from "@/components/fields/caso-form-importancia";
import { CasoFormInformacoesAdicionais } from "@/components/fields/caso-form-informacoes-adicionais";
import { CasoFormOrigem } from "@/components/fields/caso-form-origem";
import { CasoFormRelator } from "@/components/fields/caso-form-relator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, FileText, Zap } from "lucide-react";

export interface CasoCreateLeftColumnProps {
  quickMode: boolean;
  attachmentCount: number;
  onOpenAnexos: () => void;
}

export function CasoCreateLeftColumn({
  quickMode,
  attachmentCount,
  onOpenAnexos,
}: CasoCreateLeftColumnProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
      <Card className="rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center justify-between gap-2">
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
                  <Zap className="mr-2 h-3.5 w-3.5" />
                  Modo de preenchimento rápido ativo
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-6 pt-2">
          <CasoFormDescricaoResumo />
          <CasoFormDescricaoCompleta
            showAnexosTrigger
            anexosCount={attachmentCount}
            onOpenAnexos={onOpenAnexos}
          />
          <CasoFormInformacoesAdicionais />
        </CardContent>
      </Card>

      <Card className="mt-auto rounded-lg bg-card shadow-card">
        <CardHeader className="border-b border-border-divider p-4 pb-2">
          <div className="flex items-center gap-2">
            <Bug className="h-3.5 w-3.5 text-text-primary" />
            <CardTitle className="text-sm font-semibold text-text-primary">
              Classificação e Origem
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CasoFormImportancia tipo="CASO" />
            <CasoFormOrigem />
            <CasoFormCategoria />
            <CasoFormRelator />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
