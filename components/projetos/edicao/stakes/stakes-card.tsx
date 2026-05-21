"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasPermission, permissionsLoaded } from "@/lib/rbac-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { StakesGrid } from "@/components/projetos/edicao/stakes/stakes-grid";
import { StakesSummary } from "@/components/projetos/edicao/stakes/stakes-summary";

export interface StakesCardProps {
  stakes: SgpStakeItem[];
  tiposMap: Map<number, string>;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onAdicionar?: () => void;
  onEditar?: (stake: SgpStakeItem) => void;
  onExcluir?: (stake: SgpStakeItem) => void;
}

export function StakesCard({
  stakes,
  isLoading,
  isError,
  errorMessage,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  tiposMap,
  onAdicionar,
  onEditar,
  onExcluir,
}: StakesCardProps) {
  const rbacReady = permissionsLoaded();
  const canEdit = !rbacReady || hasPermission("edit-project");

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Users className="h-4 w-4 text-text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-text-primary">
              Stakeholders
            </CardTitle>
          </div>
          <Button
            type="button"
            size="sm"
            className="shrink-0"
            onClick={onAdicionar}
            disabled={!canEdit || !onAdicionar}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Adicionar stakeholder
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-3">
        {isLoading ? null : isError ? (
          <p className="text-sm text-destructive">
            {errorMessage ?? "Erro ao carregar stakeholders."}
          </p>
        ) : stakes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum stakeholder"
            description="Este projeto ainda não possui stakeholders cadastrados."
            className="min-h-[160px]"
          />
        ) : (
          <>
            <StakesGrid
              stakes={stakes}
              tiposMap={tiposMap}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={onLoadMore}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
            <StakesSummary stakes={stakes} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
