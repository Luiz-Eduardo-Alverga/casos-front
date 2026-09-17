"use client";

import { AlertTriangle, ListChecks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { PRODUTO_LABELS } from "@/components/produtos/constants";
import { ChecklistAddRow } from "@/components/produtos/edicao/checklist/checklist-add-row";
import { ChecklistItem } from "@/components/produtos/edicao/checklist/checklist-item";
import { ChecklistItemEdit } from "@/components/produtos/edicao/checklist/checklist-item-edit";
import { ChecklistListaSkeleton } from "@/components/produtos/edicao/checklist/checklist-skeleton";
import type { ChecklistItemFormData } from "@/components/produtos/edicao/checklist/checklist-schema";
import type { User } from "@/lib/auth";
import type { Usuario } from "@/services/auxiliar/usuarios";
import type { ProdutoChecklistData } from "@/services/produtos/types";

export interface ChecklistListProps {
  itens: ProdutoChecklistData[];
  canEdit: boolean;
  canDelete: boolean;
  usuarios?: Usuario[];
  currentUser?: User | null;
  isLoading: boolean;
  isError: boolean;
  editingId: number | null;
  isSavingEdit: boolean;
  isSavingAdd: boolean;
  onRetry: () => void;
  onEdit: (item: ProdutoChecklistData) => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: ChecklistItemFormData) => Promise<void> | void;
  onDelete: (item: ProdutoChecklistData) => void;
  onAdd: (data: ChecklistItemFormData) => Promise<void> | void;
}

export function ChecklistList({
  itens,
  canEdit,
  canDelete,
  usuarios,
  currentUser,
  isLoading,
  isError,
  editingId,
  isSavingEdit,
  isSavingAdd,
  onRetry,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAdd,
}: ChecklistListProps) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col rounded-lg bg-card shadow-card">
      <CardHeader className="shrink-0 border-b border-border-divider p-4 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold text-text-primary">
            {PRODUTO_LABELS.abaChecklist}
          </CardTitle>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {PRODUTO_LABELS.checklistSubtitulo}
        </p>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-y-auto p-0">
        {isLoading ? (
          <ChecklistListaSkeleton />
        ) : isError && itens.length === 0 ? (
          <div className="flex flex-col items-center">
            <EmptyState
              icon={AlertTriangle}
              title={PRODUTO_LABELS.erroTitulo}
              description={PRODUTO_LABELS.erroCarregarChecklist}
            />
            <Button
              type="button"
              variant="outline"
              className="mb-8"
              onClick={onRetry}
            >
              {PRODUTO_LABELS.tentarNovamente}
            </Button>
          </div>
        ) : (
          <>
            {itens.length === 0 ? (
              <EmptyState
                icon={ListChecks}
                title={PRODUTO_LABELS.checklistVazioTitulo}
                description={PRODUTO_LABELS.checklistVazioDescricao}
              />
            ) : (
              itens.map((item, index) =>
                editingId === item.ID ? (
                  <ChecklistItemEdit
                    key={item.ID}
                    item={item}
                    posicao={index + 1}
                    usuarios={usuarios}
                    currentUser={currentUser}
                    isSaving={isSavingEdit}
                    onSave={onSaveEdit}
                    onCancel={onCancelEdit}
                  />
                ) : (
                  <ChecklistItem
                    key={item.ID}
                    item={item}
                    posicao={index + 1}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    usuarios={usuarios}
                    currentUser={currentUser}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ),
              )
            )}
            {canEdit ? (
              <ChecklistAddRow
                usuarios={usuarios}
                currentUser={currentUser}
                isSaving={isSavingAdd}
                onAdd={onAdd}
              />
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
