"use client";

import { CalendarDays, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import type { SgpCronogramaItem } from "@/interfaces/sgp-cronograma";
import type { SgpTipoMeta } from "@/components/projetos/edicao/shared/sgp-tipos-utils";
import { CronogramaGrid } from "@/components/projetos/edicao/cronograma/cronograma-grid";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface CronogramaCardProps {
  tarefas: SgpCronogramaItem[];
  tiposMap: Map<number, string>;
  tiposMetaMap: Map<number, SgpTipoMeta>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onAdicionar: () => void;
  onEditar: (tarefa: SgpCronogramaItem) => void;
  onExcluir: (tarefa: SgpCronogramaItem) => void;
  onConcluir: (tarefa: SgpCronogramaItem) => void;
}

export function CronogramaCard({
  tarefas,
  tiposMap,
  tiposMetaMap,
  isLoading,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onAdicionar,
  onEditar,
  onExcluir,
  onConcluir,
}: CronogramaCardProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CalendarDays className="h-4 w-4 text-text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-text-primary">
              Cronograma do Projeto
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            disabled={!canEdit}
            onClick={onAdicionar}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar Tarefa
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3">
        {isLoading ? null : isError ? (
          <p className="text-sm text-destructive">
            {errorMessage ?? "Erro ao carregar cronograma do projeto."}
          </p>
        ) : tarefas.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nenhuma tarefa no cronograma"
            description="Este projeto ainda não possui tarefas cadastradas no cronograma."
            className="min-h-[160px]"
          />
        ) : (
          <CronogramaGrid
            tarefas={tarefas}
            tiposMap={tiposMap}
            tiposMetaMap={tiposMetaMap}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={onLoadMore}
            onEditar={onEditar}
            onExcluir={onExcluir}
            onConcluir={onConcluir}
          />
        )}
      </CardContent>
    </Card>
  );
}
