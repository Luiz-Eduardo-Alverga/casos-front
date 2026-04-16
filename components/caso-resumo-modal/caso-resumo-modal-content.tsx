"use client";

import { Eye, Info, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import { EmptyState } from "@/components/painel/empty-state";
import { CasoResumoInfoBox } from "@/components/caso-resumo-modal/caso-resumo-info-box";
import { CasoResumoStatusActions } from "@/components/caso-resumo-modal/caso-resumo-status-actions";
import { CasoResumoModalSkeleton } from "@/components/caso-resumo-modal/caso-resumo-modal-skeleton";
import { CasoProducaoActionButton } from "@/components/caso-resumo-modal/caso-producao-action-button";

interface CasoResumoModalContentProps {
  variant: "kanban" | "pesquisa";
  item: ProjetoMemoriaItem | null;
  memoriaQueryId?: string;
  showEmptyForSearch: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onStatusUpdated: () => void;
  onVerCasoCompleto: () => void;
  onAcaoProducao?: () => void;
  showProducaoButton?: boolean;
  producaoMode?: "iniciar" | "parar";
  producaoIsPending?: boolean;
  producaoDisabled?: boolean;
  resultBannerText?: string;
  searchHeader?: React.ReactNode;
}

export function CasoResumoModalContent({
  variant,
  item,
  memoriaQueryId,
  showEmptyForSearch,
  isLoading = false,
  isError = false,
  onStatusUpdated,
  onVerCasoCompleto,
  onAcaoProducao,
  showProducaoButton = false,
  producaoMode = "iniciar",
  producaoIsPending = false,
  producaoDisabled = false,
  resultBannerText,
  searchHeader,
}: CasoResumoModalContentProps) {
  if (showEmptyForSearch) {
    return (
      <div className="flex flex-col">
        {searchHeader}
        <div className="flex-1 px-6 pb-6">
          <EmptyState
            title="Pesquise um caso"
            description="Digite o código do caso com 5 dígitos para carregar a visualização resumida."
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        {searchHeader}
        <div className="flex-1 overflow-hidden">
          <CasoResumoModalSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col">
        {searchHeader}
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-sm font-medium text-destructive">
            Não foi possível carregar o caso.
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  const caso = item.caso;
  const statusLabel = caso?.status?.descricao ?? "Não informado";
  const statusIdApi = Number(caso?.status?.status_id ?? 0);

  return (
    <div className="flex flex-col max-h-[90vh] bg-card">
      {searchHeader}
      {resultBannerText && (
        <div className="w-full bg-muted px-6 py-2.5 shrink-0">
          <p className="text-sm font-semibold text-foreground">
            {resultBannerText}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between px-6 pt-8 pb-4 shrink-0">
        <p className="text-2xl font-bold leading-5 text-foreground">
          Caso #{caso?.id}
        </p>
        <StatusBadge status={statusLabel} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6 space-y-6">
          <div className="space-y-5">
            <CasoResumoInfoBox
              title="Resumo (Título)"
              content={caso?.textos?.descricao_resumo}
            />
            <CasoResumoInfoBox
              title="Descrição Completa"
              content={caso?.textos?.descricao_completa}
              contentClassName="max-h-[240px] overflow-y-auto"
            />
            <CasoResumoInfoBox
              title="Informações adicionais"
              content={caso?.textos?.informacoes_adicionais}
              contentClassName="max-h-[140px] overflow-y-auto"
            />
          </div>

          <Card className="bg-muted/40 border border-border-divider w-full rounded-lg">
            <CardContent className="p-4 pt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-primary" />
                <p className="text-sm font-semibold text-text-primary">
                  Dados do Produto
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 text-text-secondary sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold leading-5">Produto</p>
                  <p className="text-sm font-semibold leading-5">
                    {item.produto?.nome ?? "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold leading-5">Versão</p>
                  <p className="text-sm font-semibold leading-5">
                    {item.produto?.versao ?? "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold leading-5">Módulo</p>
                  <p className="text-sm font-semibold leading-5">
                    {item.caso?.caracteristicas?.modulo ?? "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {memoriaQueryId && (
            <div>
              <CasoResumoStatusActions
                statusIdApi={statusIdApi}
                memoriaQueryId={memoriaQueryId}
                onStatusUpdated={onStatusUpdated}
              />
            </div>
          )}

          {!caso?.textos?.informacoes_adicionais?.trim() && (
            <div className="bg-blue-100 border border-blue-200 flex items-center justify-center h-[55px] px-2 py-0.5 rounded-lg w-full">
              <p className="text-xs font-bold text-center text-blue-700 leading-4 flex items-center justify-center">
                <Info className=" mr-2" />
                <span>Este caso não possui anotações adicionais</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border-divider bg-card">
        <div className="px-6 py-4 flex flex-row gap-2.5 w-full ">
          <Button type="button" className="w-full" onClick={onVerCasoCompleto}>
            <Eye className="h-3.5 w-3.5 mr-2" />
            Ver caso completo
          </Button>
          {showProducaoButton && (
            <CasoProducaoActionButton
              mode={producaoMode}
              onClick={onAcaoProducao ?? (() => {})}
              disabled={producaoDisabled}
              isPending={producaoIsPending}
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
