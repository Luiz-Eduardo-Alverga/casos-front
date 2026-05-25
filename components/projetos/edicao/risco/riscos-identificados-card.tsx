"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import type { SgpRiscoItem } from "@/interfaces/sgp-risco";
import { RiscosGrid } from "@/components/projetos/edicao/risco/riscos-grid";

export interface RiscosIdentificadosCardProps {
  riscos: SgpRiscoItem[];
  riscoSelecionadoId?: number | null;
  isError: boolean;
  errorMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onAdicionar?: () => void;
  onSelecionar?: (item: SgpRiscoItem) => void;
  onEditar?: (item: SgpRiscoItem) => void;
  onExcluir?: (item: SgpRiscoItem) => void;
}

export function RiscosIdentificadosCard({
  riscos,
  riscoSelecionadoId = null,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onAdicionar,
  onSelecionar,
  onEditar,
  onExcluir,
}: RiscosIdentificadosCardProps) {
  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <AlertTriangle className="h-4 w-4 text-amber-800" aria-hidden />
            </div>
            <CardTitle className="text-base font-semibold text-text-primary">
              Riscos Identificados
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={onAdicionar}
            disabled={!onAdicionar}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar risco
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-3">
        {isError ? (
          <p className="text-sm text-destructive">
            {errorMessage ?? "Erro ao carregar riscos."}
          </p>
        ) : riscos.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="Nenhum risco identificado"
            description="Este projeto ainda não possui riscos cadastrados."
            className="min-h-[160px]"
          />
        ) : (
          <RiscosGrid
            riscos={riscos}
            riscoSelecionadoId={riscoSelecionadoId}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={onLoadMore}
            onSelecionar={onSelecionar}
            onEditar={onEditar}
            onExcluir={onExcluir}
          />
        )}
      </CardContent>
    </Card>
  );
}
